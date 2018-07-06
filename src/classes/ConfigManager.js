'use strict';

const fs = require('fs-extra');
const path = require('path');

const CONFIG_FILE_NAME = Symbol('configuration file name');
const LOCATIONS = Symbol('configuration file location');
const SERIALIZERS = Symbol('configuration file serializers');

function suffixPath (location, configFileName) {
	const suffix = path.sep + configFileName;
	return location.substr(-suffix.length) !== suffix ?
		location + suffix :
		location;
}

function readJsonOrReturnObject (jsonPath) {
	try {
		return fs.readJsonSync(jsonPath);
	}
	catch (_error) {
		return {};
	}
}
/**
 * Manages a unified configuration file for all modules that register their config.
 */
class ConfigManager {
	/**
	 * @constructor
	 * @param {Array} possibleLocations  A list of possible config file locations, from high to low priority.
	 * @param {string} configFileName    The name of the config file.
	 */
	constructor (possibleLocations, configFileName) {
		this[CONFIG_FILE_NAME] = configFileName;
		this[LOCATIONS] = possibleLocations.filter(location => !!location);
		this[SERIALIZERS] = {};

		if (!this[LOCATIONS].length) {
			throw new Error('No config location');
		}

		this.read();
	}

	/**
	 * @param {string} name - A key of the configuration object that you can share with other modules, or not.
	 * @param {*} defaultValue - If no configuration is found, use this.
	 * @param {*|function(config): ?*} [serialize]
	 * @return {*}
	 */
	registerConfig (name, defaultValue, serialize) {
		if (!this[name]) {
			this[name] = defaultValue || null;
		}

		Object.assign(this[SERIALIZERS], {
			[name]: serialize
		});

		return this[name];
	}

	/**
	 * Checks the path & exist status for all possible configuration file locations.
	 *
	 * @return {Array}
	 */
	status () {
		return this[LOCATIONS]
			.filter(location => !!location)
			.map(location => suffixPath(location, this[CONFIG_FILE_NAME]))
			.map(location => ({
				path: location,
				exists: fs.existsSync(location)
			}));
	}

	/**
	 * Read all possible configuration files and assign them to one new object.
	 */
	read () {
		Object.assign(this, this.status()
			.reduce(
				(config, file) => file.exists ?
					Object.assign(readJsonOrReturnObject(file.path), config) :
					config,
				{}));
	}

	/**
	 * Save a stringified version of the configuration object to a given location.
	 *
	 * @param {string} location - (preferably absolute) path to the dot-rc file, or its intended directory
	 * @return {Promise} - Resolves to the successful location
	 */
	save (location) {
		if (!location) {
			const status = this.status();
			location = (status.find(loc => loc.exists) || status[status.length - 1]).path;
		}

		const suffix = path.sep + this[CONFIG_FILE_NAME];
		if (location.substr(-suffix.length) !== suffix) {
			location += suffix;
		}

		return new Promise((resolve, reject) => fs.outputFile(location, this.toString(), error => {
			return error ?
				reject(error) :
				resolve(location);
		}));
	}

	/**
	 * Prepare a stringified version of the configuration object - one that can be deserialized too.
	 *
	 * @return {string}
	 */
	toString () {
		const serialized = Object.keys(this[SERIALIZERS])
			.reduce((config, serializerName) => {
				const serializerFn = this[SERIALIZERS][serializerName];
				const serialized = typeof serializerFn === 'function' ?
					serializerFn(this[serializerName]) :
					this[serializerName];

				return (serialized !== null && serialized !== undefined) ?
					Object.assign(config, {
						[serializerName]: serialized
					}) :
					config;
			}, {});

		return JSON.stringify(serialized, null, '\t');
	}
}

module.exports = ConfigManager;
