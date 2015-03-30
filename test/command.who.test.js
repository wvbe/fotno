'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const outputHelper = require('./helpers/output');

const App = require('../index');

const CONFIG_FILE_NAME = '.fotnotestrc';

const cwd = path.resolve(__dirname, 'app');
const testStdout = outputHelper.createTestStdout();
const app = new App([cwd], CONFIG_FILE_NAME, { stdout: testStdout, appName: 'fotno-test' });

function cleanupAppDir () {
	return new Promise((response, reject) => fs.remove(path.join(cwd, CONFIG_FILE_NAME), (err) => err ? reject(err) : response()));
}

before(cleanupAppDir);

describe('who command', () => {
	before(() => app.run(['module', '-a', path.join(cwd, 'test-module-1')]));

	beforeEach(testStdout.resetOutput);

	it('is able to output context information', () => {
		return app.cli.interpret(['who'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				assert.ok(testStdout.outputContains('test context informer'), 'Not outputtin test context informer');
			});
	});

	it('is shows when no external modules are loaded', () => {
		return app.cli.interpret(['module', '-r', path.join(cwd, 'test-module-1')], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => app.cli.interpret(['who'], null, app.logger))
			.then(request => request.execute(app.logger))
			.then(() => {
				assert.ok(testStdout.outputContains('No external modules loaded.'), 'No message show');
			});
	});
});

after(cleanupAppDir);
