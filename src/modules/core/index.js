module.exports = (moduleRegistration, app, opts) => {
	moduleRegistration.registerContextInformer((_request, response) => {
		response.caption('Modules');

		const visibleModules = app.modules.filter(module => !module.hideFromList);

		if (!visibleModules.length) {
			response.debug('No external modules loaded.');
			return;
		}

		visibleModules.forEach(module => {
			const info = module.getInfo();
			response.log(info.name);
			delete info.name;
			response.indent();
			response.properties(info);
			response.outdent();
		});
	});

	[
		// require('./src/command.config.js'),
		require('./src/command.motd.js'),
		require('./src/command.module.js'),
		require('./src/command.help.js'),
		require('./src/command.who.js')
	].forEach(mod => mod(moduleRegistration, app, opts));
};
