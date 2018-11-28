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

	fotno.registerContextInformer((_request, response) => {
	moduleRegistration.registerContextInformer((_request, response) => {
		response.caption('Test');
		response.debug('test context informer');
	});
};
