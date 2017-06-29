'use strict';

// core node modules
const os = require('os');
const path = require('path');

// 3rd party node modules
const ask = require('ask-nicely');
const SpeakSoftly = require('speak-softly');

// classes, helpers
const ConfigManager = require('./ConfigManager');
const FotnoCommand = require('./FotnoCommand');
const ModuleRegistrationApi = require('./ModuleRegistrationApi');

class App {
	/**
	 * @constructor
	 * @param {Array} configLocations
	 * @param {string} configFileName
	 * @param {Object} opts
	 * @param {boolean} [opts.silent] - Excludes the use of opts.stdout
	 * @param {WritableStream} [opts.stdout]
	 */
	constructor (configLocations, configFileName, opts) {
		this.name = opts && opts.appName ? opts.appName : path.basename(process.argv[1]);
		this.config = new ConfigManager(configLocations, configFileName);
		this.packageJson = require('../../package.json');
		this.processPath = process.cwd();
		this.version = opts && opts.appVersion ? opts.appVersion : null;

		const colorConfig = this.config.registerConfig('colors', os.platform() === 'win32' ? {
				log: ['reset'],
				success: ['green'],
				caption: ['bold'],
				notice: ['yellow'],
				error: ['red'],
				debug: ['grey'],
				propertyKey: ['grey'],
				propertyValue: ['reset'],
				tableHeader: ['grey'],
				spinnerSpinning: ['grey'],
				spinnerDone: ['grey']
			} : null);

		let stdout = process.stdout;
		if (opts && opts.silent) {
			stdout = { write: () => {} };
		}
		else if (opts && opts.stdout) {
			stdout = opts.stdout;
		}

		this.logger = new SpeakSoftly(colorConfig, {
			indentation: '  ',
			stdout: stdout
		});

		this.cli = new ask.Command(this.name);
		this.cli.setNewChildClass(FotnoCommand);
		this.cli.getLongName = FotnoCommand.prototype.getLongName.bind(this.cli);
		Object.assign(this.cli, ask);

		this.modules = [];
		this.builtInModules = [];

		// Load modules list from configuration
		const moduleConfig = this.config.registerConfig('modules', null, () => {
				// Ignore the old config, write what is currently used
				return this.modules
					// Do not save built-in modules
					.filter(mod => this.builtInModules.indexOf(mod) === -1)
					// Output module paths
					.map(mod => mod.getInfo().path);
			});

		// Load the core module and hide it from listing
		const CORE_MODULE_LOCATION = '../modules/core';
		const coreModule = this.enableBuiltInModule(
			CORE_MODULE_LOCATION,
			this,
			opts || {});
		coreModule.hideFromList = true;

		// Load modules from configuration
		(Array.isArray(moduleConfig) ? moduleConfig : [])
			.map(modulePath => {
				try {
					this.enableModule(modulePath);
				}
				catch (err) {
					this.error(path.basename(modulePath) + ' modulefail', err);
				}
			});
	}

	/**
	 * Built in modules are not saved to the config files. These modules can be added at runtime. This is usefull when
	 * creating a tools bundle powered by fotno.
	 *
	 * @param {string} modulePath The path to the module to enable.
	 * @param {...*} [extra] Extra parameters which can be used by the module, only used for built-in modules.
	 * @return {ModuleRegistrationApi}
	 */
	enableBuiltInModule (modulePath, ...extra) {
		const mod = this.enableModule(modulePath, ...extra);

		this.builtInModules.push(mod);

		return mod;
	}

	/**
	 * Enable a module, which can be saved to the config file.
	 *
	 * @param {string} modulePath The path to the module to enable.
	 * @param {...*} [extra] Extra parameters which can be used by the module, only used for built-in modules.
	 * @return {ModuleRegistrationApi}
	 */
	enableModule (modulePath, ...extra) {
		const mod = new ModuleRegistrationApi(this, modulePath);
		const modInfo = mod.getInfo();

		if (this.modules.some(mod => mod.getInfo().name === modInfo.name)) {
			throw new Error(`A module with name "${modInfo.path}" was already added.`);
		}

		mod.load(...extra);

		this.modules.push(mod);

		return mod;
	}

	/**
	 * Returns an object with information that a module could use to reason about which fotno instance it is used for.
	 *
	 * @return {{name: *, version: ?string}}
	 */
	getInfo () {
		return {
			name: this.name,
			version: this.version
		};
	}

	/**
	 * @param {Array<string>} args
	 * @param {Object} request
	 * @return {Promise.<TResult>}
	 */
	run (args, request) {
		return this.cli.execute(Object.assign([], args), request, this.logger)
			.catch(error => {
				this.error('failure', error, {
					cwd: this.processPath,
					args: [this.name].concat(args.map(arg => arg.indexOf(' ') >= 0 ? `"${arg}"` : arg)).join(' '),
					mods: this.modules.map(mod => mod.getInfo().name + ` (${mod.getInfo().version})`).join(os.EOL)
				});

				// Do not hard exit program, but rather exit with error code one the program is closing itself
				process.on('exit', function () {
					process.exit(1);
				});
			})
			.then(() => {
				if (os.platform() !== 'win32') {
					this.logger.break();
				}
				return this;
			});
	}

	/**
	 * @param {string} caption
	 * @param {Error|InputError} error
	 * @param {Object} [debugVariables]
	 */
	error (caption, error, debugVariables) {
		if (error.solution) {
			this.logger.caption('Input error');
		}
		else if (caption) {
			this.logger.caption(caption);
		}

		if (error) {
			this.logger.error(error.message || error.stack || error);
		}

		if (error.solution) {
			this.logger.break();
			this.logger.notice('You might be able to fix this, use the "--help" flag for usage info.');
			if (error.solution) {
				this.logger.log(error.solution);
			}
		}
		else {
			if (error && error.stack) {
				this.logger.indent();
				this.logger.debug(error.stack);
				this.logger.outdent();
			}

			if (debugVariables) {
				this.logger.properties(debugVariables);
			}
		}
	}
}

module.exports = App;
