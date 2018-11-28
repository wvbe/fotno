'use strict';

const ask = require('ask-nicely');
const path = require('path');

const FILENAMES_TO_SKIP_FOR_SET_CONTROLLER_CALLSITES = Symbol('FILENAMES_TO_SKIP_FOR_SET_CONTROLLER_CALLSITES');

/**
 * A fotno custom version of AskNicely#Command that has extra options for describing examples or a long description.
 * @augments AskNicely.Command
 */
class FotnoCommand extends ask.Command {
	/**
	 * @constructor
	 * @param {string} name
	 * @param {function(AskNicelyRequest, SpeakSoftly)} [controller]
	 */
	constructor (name, controller) {
		super(name, controller);

		this.examples = [];
		this.isHelpCommand = false;
		this.longDescription = null;

		this._moduleRegistration = null;

		this.setNewChildClass(FotnoCommand);
	}

	static addFileNameToSkipForSetControllerCallsites (fileNameToSkip) {
		FotnoCommand[FILENAMES_TO_SKIP_FOR_SET_CONTROLLER_CALLSITES].push(fileNameToSkip);
	}

	getModuleRegistration () {
		let command = this;
		while (command) {
			if (command._moduleRegistration) {
				return command._moduleRegistration;
			}
			command = command.parent;
		}
		return null;
	}

	_getCallSites () {
		const _prepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = (_, stack) => stack;
		const stack = new Error().stack;
		Error.prepareStackTrace = _prepareStackTrace;
		return stack
			.map(s => s.getFileName())
			.filter(fileName => !FotnoCommand[FILENAMES_TO_SKIP_FOR_SET_CONTROLLER_CALLSITES].some(fileNameToSkip => fileName && fileName.endsWith(fileNameToSkip)));
	}

	_createLazyLoadController (controllerSource) {
		if (typeof controllerSource === 'string' && !path.isAbsolute(controllerSource)) {
			const callsiteFilename = this._getCallSites()[0];
			controllerSource = path.resolve(path.join(path.dirname(callsiteFilename), controllerSource));
		}

		return (...args) => {
			return require(controllerSource)(...args);
		};
	}

	/**
	 * Set the main controller
	 *
	 * @param {string|function(AskNicelyRequest, SpeakSoftly)} [controller]
	 * @return {Command} This command
	 */
	setController (controller) {
		if (typeof controller === 'string') {
			controller = this._createLazyLoadController(controller);
		}

		return super.setController(controller);
	}

	/**
	 * Register an example usage of this command. Each example is rendered as a definition item, meaning the definition
	 * is indented below the caption.
	 *
	 * @param {string} caption
	 * @param {string} content
	 * @return {FotnoCommand}
	 */
	addExample (caption, content) {
		this.examples.push({
			caption: caption,
			content: content
		});

		return this;
	}

	/**
	 * Register a long description for a command - one that is printed in the full width of the terminal.
	 *
	 * @param {string} description
	 * @return {FotnoCommand}
	 */
	setLongDescription (description) {
		this.longDescription = description;

		return this;
	}

	setAsHelpCommand (enabled) {
		this.isHelpCommand = enabled !== undefined ? !!enabled : true;

		return this;
	}

	/**
	 * Gets the "long" name of a command, which includes the parameters and the long names of it's ancestors.
	 *
	 * @return {string}
	 */
	getLongName () {
		return (this.parent ? [this.parent.getLongName()] : [])
			.concat([this.name])
			.concat(this.parameters.map(parameter => `<${parameter.name}>`))
			.join(' ');
	}
}

FotnoCommand[FILENAMES_TO_SKIP_FOR_SET_CONTROLLER_CALLSITES] = [
	'/ask-nicely/dist/AskNicely.js',
	'/fotno/src/classes/FotnoCommand.js',
	'/fotno/src/classes/ModuleRegistrationApi.js'
];

module.exports = FotnoCommand;
