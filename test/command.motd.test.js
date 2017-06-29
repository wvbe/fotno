'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const outputHelper = require('./helpers/output');

const App = require('../index');

const CONFIG_FILE_NAME = '.fotnotestrc';

const cwd = path.resolve(__dirname, 'app');

function cleanupAppDir () {
	return new Promise((response, reject) => fs.remove(path.join(cwd, CONFIG_FILE_NAME), (err) => err ? reject(err) : response()));
}

before(cleanupAppDir);

describe('motd command', () => {
	// Failsafe if normal logic fails, you might lose some output of one test if this happens; but the test will fail.
	afterEach(outputHelper.stopCaptureStdout);

	it('is able to output a logo when run without any arguments', () => {
		outputHelper.startCaptureStdout();
		const appForLogo = new App([cwd], CONFIG_FILE_NAME);
		return appForLogo.run([])
			.then(outputHelper.stopCaptureStdout)
			.then(() => {
				assert.ok(outputHelper.stdoutContains('/:/_/:/  /  /:/__/ \\:\\__\\'), 'Not outputting logo');
				assert.ok(!outputHelper.stdoutContains('v'), 'Should not output version');
			})
			.catch(outputHelper.catchStdout);
	});

	it('is able to output the app name if no logos are set', () => {
		const testStdout = outputHelper.createTestStdout();
		const appForLogo = new App([cwd], CONFIG_FILE_NAME, { stdout: testStdout, appName: 'fotno-no-logo-test' });
		appForLogo.config.logo.logos = [];
		return appForLogo.run([])
			.then(() => {
				assert.ok(!testStdout.outputContains('/:/_/:/  /  /:/__/ \\:\\__\\'), 'Should not output logo');
				assert.ok(testStdout.outputContains('fotno-no-logo-test'), 'Not outputting caption');
			});
	});

	it('is able to output the app version', () => {
		const testStdout = outputHelper.createTestStdout();
		const appVersion = '1.2.3-rc4';
		const appForLogo = new App([cwd], CONFIG_FILE_NAME, { stdout: testStdout, appName: 'fotno-test', appVersion: appVersion });
		return appForLogo.run([])
			.then(() => {
				assert.ok(testStdout.outputContains('v' + appVersion), 'Outputting app version');
			});
	});
});

after(cleanupAppDir);
