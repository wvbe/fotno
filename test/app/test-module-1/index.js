module.exports = fotno => {
	fotno.registerConfiguration('test-configuration', 'test');

	fotno.registerCommand('test-command-1')
		.setLongDescription('Test command is used for test cases.')
		.addParameter('tp1', 'A parameter for testing', false)
		.addParameter('tp2', null, true)
		.addOption('to1', 't', 'A option for testing', false)
		.addOption('to2', null, null, true);

	fotno.registerContextInformer((_request, response) => {
		response.caption('Test');
		response.debug('test context informer');
	});
};
