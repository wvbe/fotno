'use strict';

const AskNicely = require('ask-nicely');
const path = require('path');

const APP = Symbol('app');
const CONTEXTINFORMERS = Symbol('context informers');
const LOCATION = Symbol('location');
const PACKAGEJSON = Symbol('package.json');

class ModuleRegistrationApi {
	constructor (app, location) {
		this[APP] = app;

		this[LOCATION] = location;

		this[PACKAGEJSON] = require(path.join(this[LOCATION], 'package.json'));

		this[CONTEXTINFORMERS] = [];

		this.hideFromList = false;

		Object.assign(this, AskNicely);
	}

	/**
	 * Do not call manually
	 * @param {...*} extra
	 */
	load (...extra) {
		const mod = require(this[LOCATION]);

		if (typeof mod !== 'function') {
			throw new Error(this[PACKAGEJSON].name + ' is not a function.');
		}

		mod(this, ...extra);
	}

	/**
	 * Returns metadata about the app
	 * @return {{name, fotnoVersion}}
	 */
	getAppInfo () {
		return {
			name: this[APP].name,
			fotnoVersion: this[APP].packageJson.version
		};
	}

	/**
	 * Returns metadata about the module
	 * @return {{name, version, description, path}}
	 */
	getInfo () {
		return {
			name: this[PACKAGEJSON].name,
			version: this[PACKAGEJSON].version,
			description: this[PACKAGEJSON].description,
			path: this[LOCATION]
		};
	}

	/**
	 * @param {string} name
	 * @param {function(AskNicelyRequest, SpeakSoftly)} [controller]
	 * @return {Command} The command object that was created
	 */
	registerCommand (name, controller) {
		return this[APP].cli.addCommand(name, controller);
	}

	/**
	 * NOTE: Only use this from the module's index.js, not from within commands, or else your config might be overridden.
	 * @param {string} name
	 * @param {*} defaultValue
	 * @param {*|function(config): ?*} [serialize]
	 * @return {*} The configuration value
	 */
	registerConfiguration (name, defaultValue, serialize) {
		return this[APP].config.registerConfig(name, defaultValue, serialize);
	}

	/**
	 * @param {function(AskNicelyRequest, SpeakSoftly)} informer
	 * @return {Object} The informer
	 */
	registerContextInformer (informer) {
		this[CONTEXTINFORMERS].push(informer);

		return informer;
	}

	/**
	 * @return {Array}
	 */
	getContextInformers () {
		return this[CONTEXTINFORMERS].slice(0);
	}
}

module.exports = ModuleRegistrationApi;
