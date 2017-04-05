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

describe('help command', () => {
	before(() => app.run(['module', '-a', path.join(cwd, 'test-module-1')]));

	beforeEach(testStdout.resetOutput);

	it('is able to output usage information', () => {
		return app.cli.interpret(['--help'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				assert.ok(testStdout.outputContains('fotno-test --help'), 'Not outputting header');
				assert.ok(testStdout.outputContains('Child commands'), 'Not outputting child commands');
				assert.ok(testStdout.outputContains('test-command-1'), 'Not listing test-command-1');
				assert.ok(testStdout.outputContains('Options'), 'Not listing options');
			});
	});

	it('is able to output usage information for the module command', () => {
		return app.cli.interpret(['module', '--help'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				assert.ok(testStdout.outputContains('help for the module command'), 'Not outputting header');
				assert.ok(testStdout.outputContains('Tool\'s module management'), 'Not outputting command description');
				assert.ok(testStdout.outputContains('--add'), 'Not listing --add argument');
				assert.ok(testStdout.outputContains('--dry'), 'Not listing --ry argument');
				assert.ok(testStdout.outputContains('--list'), 'Not listing --list argument');
				assert.ok(testStdout.outputContains('--remove'), 'Not listing --remove argument');
				assert.ok(testStdout.outputContains('--verbose'), 'Not listing --verbose argument');
				assert.ok(testStdout.outputContains('--add ./anywhere'), 'Not listing examples');
			});
	});

	it('is able to output usage information for the who command', () => {
		return app.cli.interpret(['who', '--help'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				assert.ok(testStdout.outputContains('help for the who command'), 'Not outputting header');
				assert.ok(testStdout.outputContains('whoami'), 'Not outputting aliases');
				assert.ok(testStdout.outputContains('what you are'), 'Not outputting command description');
			});
	});

	it('is able to output usage information for the test command', () => {
		return app.cli.interpret(['test-command-1', '--help'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				assert.ok(testStdout.outputContains('help for the test-command-1 command'), 'Not outputting header');
				assert.ok(testStdout.outputContains('Test command is used for test cases.'), 'Not outputting long description');
				assert.ok(testStdout.outputContains('Parameters'), 'Not outputting parameters');
				assert.ok(testStdout.outputContains(/tp1.+A parameter for testing/), 'Not listing tp1 parameter');
				assert.ok(testStdout.outputContains(/tp2.+\<no description\>.+\[required\]/), 'Not listing tp2 parameter');
				assert.ok(testStdout.outputContains('Options'), 'Not outputting options');
				assert.ok(testStdout.outputContains(/-t.+--to1.+A option for testing/), 'Not listing to1 option');
				assert.ok(testStdout.outputContains(/--.+--to2.+\<no description\>.+\[required\]/), 'Not listing to2 option');
			});
	});

	it('throws when trying to output usage information for an non existing command', (done) => {
		app.cli.interpret(['non-existing-command', '--help'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				done(new Error('Should have thrown'));
			})
			.catch((_error) => {
				done();
			});
	});
});

after(cleanupAppDir);
