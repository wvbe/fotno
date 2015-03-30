'use strict';

const NO_DESCRIPTION = '<no description>';
// the package.json of fotno/fotno

function sortByName (a, b) {
	return a.name < b.name ? -1 : 1;
}

function toParameterRow (param) {
	return [
		`<${param.name}>`,
		(param.description || NO_DESCRIPTION) + (param.required ? ' [required]' : '')
	];
}

function toOptionRow (option) {
	return [
		(option.short ? `-${option.short}` : '--') + `  --${option.name}`,
		(option.description || NO_DESCRIPTION) + (option.required ? ' [required]' : '')
	];
}

function getFull (command) {
	return (command.parent ? getFull(command.parent) : [])
		.concat([command.name]).concat(command.parameters.map(param => `<${param.name}>`));
}

module.exports = (fotno, app) => {
	function helpController (req, res) {
		const command = req.command;
		const isRoot = !command.parent;

		res.caption((isRoot ? `${fotno.getAppInfo().name} --help` : 'help for the ' + command.name + ' command'));

		const props = [];
		props.push(['Command', getFull(command).join(' ')]);
		if (command.aliases.length) {
			props.push(['Aliases', command.aliases.join(', ')]);
		}
		if (command.description) {
			props.push(['Summary', command.description]);
		}

		if (props.length) {
			res.properties(props);
		}

		if (command.longDescription) {
			res.break();
			res.debug(command.longDescription);
		}

		if (command.children.length) {
			res.caption('Child commands');
			command.children.sort(sortByName).forEach(child => res.definition(child.name, child.description));
		}

		if (command.parameters.length) {
			res.caption('Parameters');
			res.properties(command.parameters.map(toParameterRow));
		}

		const options = command.options;
		if (options.length) {
			res.caption('Options');
			res.properties(options.sort(sortByName).map(toOptionRow));
		}

		const examples = command.examples;
		if (examples && examples.length) {
			res.caption('Examples');
			examples.forEach(example => {
				res.definition(example.caption, example.content);
			});
		}
	}

	app.cli.setDescription(app.packageJson.description);
	app.cli.addOption(new fotno.IsolatedOption('help')
		.setShort('h')
		.setDescription('Show usage information, works for any command.'))
		.addPreController((req, res) => {
			if (!req.options.help) {
				return;
			}

			helpController.call(this, req, res);

			return false;
		});
};
