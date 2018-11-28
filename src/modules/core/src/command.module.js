'use strict';

const path = require('path');

module.exports = (moduleRegistration, app) => {
	function moduleController (req, res) {
		res.caption(req.command.getLongName());

		if (req.options.list) {
			if (req.options.verbose) {
				app.modules.forEach(module => {
					if (module.hideFromList) {
						return;
					}
					const info = module.getInfo();
					res.caption(info.name);
					delete info.name;
					res.indent();
					res.properties(info);
					res.outdent();
				});
			}
			else {
				res.list(app.modules.map(module => module.getInfo().name), '-');
			}

			return;
		}

		if (!req.options.add.concat(req.options.remove).length) {
			return res.debug('No modules to add or remove');
		}

		if (req.options.remove.length) {
			res.debug(`Try disabling ${req.options.remove.length} modules`);
		}

		req.options.remove.forEach(option => {
			const modulePath = path.resolve(process.cwd(), option);
			const modIndex = app.modules.findIndex(mod => mod.getInfo().path === modulePath);

			if (modIndex === -1) {
				return res.property('skipped', `${modulePath} was not loaded`, null, 'notice');
			}

			const mod = app.modules[modIndex];
			const modInfo = mod.getInfo();

			res.property('disable', `${modInfo.name} (${modInfo.version})`);

			app.modules.splice(modIndex, 1);
		});

		if (req.options.add.length) {
			res.debug(`Try enabling ${req.options.add.length} modules`);
		}

		req.options.add.forEach(option => {
			const modulePath = path.resolve(process.cwd(), option);

			const modIndex = app.modules.findIndex(mod => mod.getInfo().path === modulePath);
			if (!modIndex === -1) {
				res.notice('skipped', `A module with name "${modulePath}" was already added.`);
				return;
			}

			try {
				const mod = app.silentEnableModule(modulePath);

				if (!mod) {
					res.property('skipping', `Could not add module with name "${modulePath}", might be a duplicate.`, null, 'notice');

				}
				else {
					const modInfo = mod.getInfo();

					res.property('enabled', `${modInfo.name} (${modInfo.version})`);
				}
			}
			catch (e) {
				res.property('skipped', e.stack, null, 'notice');
			}
		});

		res.break();

		return !req.options.dry ?
			app.config.save().then((location) => {
				res.success(`Saved ${path.basename(location)}`);
				res.debug(`Type "${moduleRegistration.getAppInfo().name} who" to find your current running configuration.`);
			}) :
			res.notice('Not saving configuration file');
	}

	moduleRegistration.registerCommand('module', moduleController)
		.setDescription('Tool\'s module management.')

		.addOption(new moduleRegistration.MultiOption('add')
			.setDescription('Add a module.')
			.setDefault([], true)
			.setShort('a'))
		.addOption(new moduleRegistration.MultiOption('remove')
			.setDescription('Remove a module.')
			.setDefault([], true)
			.setShort('r'))
		.addOption('dry', 'D', 'Simulated run, do not save the new module configuration.')

		.addOption('list', 'l', 'List all enabled modules.')
		.addOption('verbose', 'v', 'Use verbose output when listing modules.')

		.addExample(`${moduleRegistration.getAppInfo().name} module --add ./anywhere/my-fotno-module`, 'Add a module to the tool and store it in the configuration file.')
		.addExample(`${moduleRegistration.getAppInfo().name} module --remove ./anywhere/my-fotno-module`, 'Remove a module from the tool and store it in the configuration file.')
		.addExample(`${moduleRegistration.getAppInfo().name} module --list --verbose`, 'Remove a module from the tool and store it in the configuration file.');
};
