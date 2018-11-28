'use strict';

const path = require('path');

module.exports = moduleRegistration => {
	moduleRegistration.registerConfiguration('test-configuration', 'test');

	moduleRegistration.registerCommand('test-command-1')
		.setLongDescription('Test command is used for test cases.')
		.addParameter('tp1', 'A parameter for testing', false)
		.addParameter('tp2', null, true)
		.addOption('to1', 't', 'A option for testing', false)
		.addOption('to2', null, null, true);

	moduleRegistration.registerCommand('test-command-2')
		.setLongDescription('Test command is used for test cases.')
		.setAsHelpCommand();

	moduleRegistration.registerCommand('test-command-3')
		.setLongDescription('Test command is used for test cases.')
		.setAsHelpCommand()
		.setAsHelpCommand(false);

	moduleRegistration.registerCommand('test-command-4', './src/testLazyLoadCommand.js')
		.addCommand('test-command-4-sub-command-1', './src/testLazyLoadCommand.js');

	moduleRegistration.registerCommand('test-command-5', path.resolve(path.join(__dirname, 'src/testLazyLoadCommand.js')));

	moduleRegistration.registerCommand('test-command-6')
		.addCommand('test-command-6-sub-command', './src/testLazyLoadCommand.js');


	moduleRegistration.registerContextInformer((_request, response) => {
		response.caption('Test');
		response.debug('test context informer');
	});
};
