'use strict';

module.exports = function testLazyLoadCommand (req, res) {
	res.caption(`Test lazy load command: "${req.command && req.command.name}"`);

	const moduleRegistration = req.command && req.command.getModuleRegistration();
	res.properties({
		'req.command.getModuleRegistration().constructor.name': moduleRegistration && moduleRegistration.constructor && moduleRegistration.constructor.name
	});
};
