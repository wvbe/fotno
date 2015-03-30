'use strict';

const AskNicely = require('ask-nicely');

class FotnoCommand extends AskNicely.Command {
	constructor (name, controller) {
		super(name, controller);

		this.longDescription = null;
		this.examples = [];

		this.setNewChildClass(FotnoCommand);
	}

	addExample (caption, content) {
		this.examples.push({
			caption: caption,
			content: content
		});

		return this;
	}

	setLongDescription (description) {
		this.longDescription = description;

		return this;
	}
}

module.exports = FotnoCommand;
