'use strict';

const ask = require('ask-nicely');

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

		this.isHelpCommand = false;
		this.longDescription = null;
		this.examples = [];

		this.setNewChildClass(FotnoCommand);
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

module.exports = FotnoCommand;
