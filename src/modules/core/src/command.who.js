'use strict';

const os = require('os');
const path = require('path');

module.exports = (moduleRegistration, app) => {
	function whoController (req, res) {
		res.caption(req.command.getLongName());

		res.properties({
			Hostname: os.hostname(),
			Install: path.resolve(__dirname, '..', '..'),
			Config: app.config.status().map(loc => loc.path + (loc.exists ? '' : ' (missing)')).join(os.EOL)
		});

		app.modules.forEach((module) => {
			const informers = module.getContextInformers();
			informers.forEach(informer => informer(req, res));
		});
	}

	moduleRegistration.registerCommand('who', whoController)
		.addAlias('whoami')
		.setDescription('Tells you what you are, and what you\'re doing here.');
};
