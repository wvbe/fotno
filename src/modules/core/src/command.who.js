'use strict';

const os = require('os');
const path = require('path');

module.exports = (fotno, app) => {
	function whoController (req, res) {
		res.caption(`${fotno.getAppInfo().name} who`);

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

	fotno.registerCommand('who', whoController)
		.addAlias('whoami')
		.setDescription('Tells you what you are, and what you\'re doing here.');
};
