'use strict';

const ask = require('ask-nicely');
const path = require('path');

const APP = Symbol('app');
const CONTEXTINFORMERS = Symbol('context informers');
const LOCATION = Symbol('location');
const PACKAGEJSON = Symbol('package.json');

/**
 * The unified API for registering module functionality with the fotno instance. The callback exposed by a module
 * will get an instance of ModuleRegistrationApi to register itself with.
 */
class ModuleRegistrationApi {
	/**
	 * Should not be called by a module.
	 *
	 * @constructor
	 * @param {App} app - The
	 * @param {string} location - The location of the module that is being registered
	 */
	constructor (app, location) {
		this[APP] = app;

		this[LOCATION] = location;

		this[PACKAGEJSON] = require(path.join(this[LOCATION], 'package.json'));

		this[CONTEXTINFORMERS] = [];

		this.hideFromList = false;

		Object.assign(this, ask);
	}

	/**
	 * Should not be called by a module. Loads and evaluates the Javascript code belonging to a module.
	 *
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
	 * Passes on the information returned by App#getInfo
	 * @see App#getInfo
	 * @return {object}
	 */
	getAppInfo () {
		return this[APP].getInfo();
	}

	/**
	 * Returns metadata about the module that is being registered.
	 *
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
	 * Adds a command to the root of the fotno instance.
	 *
	 * @see FotnoCommand#addCommand
	 * @param {string} name
	 * @param {function(AskNicelyRequest, SpeakSoftly)} [controller]
	 * @return {Command} The command object that was created
	 */
	registerCommand (name, controller) {
		return this[APP].cli.addCommand(name, controller);
	}

	/**
	 * NOTE: Only use this from the module's index.js, not from within commands, or else your config might be overridden.
	 *
	 * @see ConfigManager#registerConfiguration
	 * @param {string} name
	 * @param {*} defaultValue
	 * @param {*|function(config): ?*} [serialize]
	 * @return {*} The configuration value
	 */
	registerConfiguration (name, defaultValue, serialize) {
		return this[APP].config.registerConfig(name, defaultValue, serialize);
	}

	/**
	 * Register a subcontroller to render additional info provided by a module in the "who" command provided by fotno.
	 *
	 * @param {function(AskNicelyRequest, SpeakSoftly)} informer
	 * @return {Object} The informer
	 */
	registerContextInformer (informer) {
		this[CONTEXTINFORMERS].push(informer);

		return informer;
	}

	/**
	 * Should not be called by a module. Return the list of context informers registered by this module.
	 *
	 * @return {Array}
	 */
	getContextInformers () {
		return this[CONTEXTINFORMERS].slice(0);
	}
}

module.exports = ModuleRegistrationApi;
