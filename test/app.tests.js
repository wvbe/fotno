'use strict';

const AskNicely = require('ask-nicely');
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const outputHelper = require('./helpers/output');

const App = require('../index');

const CONFIG_FILE_NAME = '.fotnotestrc';

const cwd = path.resolve(__dirname, 'app');
const testStdout = outputHelper.createTestStdout();
const app = new App([cwd], CONFIG_FILE_NAME, { stdout: testStdout, appName: 'fotno-test' });

function cleanupDir (dir) {
	return new Promise((response, reject) => fs.remove(dir, (err) => err ? reject(err) : response()));
}

function cleanupAppDir () {
	return Promise.all([
		cleanupDir(path.join(cwd, CONFIG_FILE_NAME)),
		cleanupDir(path.join(cwd, 'lvl-1'))
	]);
}

before(cleanupAppDir);

describe('initial setup', () => {
	beforeEach(testStdout.resetOutput);

	it('can be configured with a custom app name', () => {
		assert.strictEqual(app.name, 'fotno-test');
	});

	it('is able to skip a mallformed config file', () => {
		assert.ok(new App([path.join(cwd, 'test-module-1')], 'index.js', { silent: true, appName: 'fotno-test' }));
	});

	it('throws an error when no config files are specified', () => {
		assert.throws(() => {
			new App([], CONFIG_FILE_NAME, { silent: true, appName: 'fotno-test' });
		});
	});

	it('throws when a loaded module is not an function', () => {
		const appForInvalidModule = new App([cwd], CONFIG_FILE_NAME, { silent: true, appName: 'fotno-test' });
		assert.throws(() => {
			appForInvalidModule.enableBuiltInModule(path.join(cwd, 'invalid-module-1'));
		});
	});

	it('throws an error when a command does not exist', (done) => {
		app.cli.interpret(['non-existing-command'], null, app.logger)
			.then(request => request.execute(app.logger))
			.then(() => {
				done(new Error('Should have thrown'));
			})
			.catch((_error) => {
				done();
			});
	});

	describe('is able to handle any thrown errors', () => {
		it('is able to handle any thrown errors', () => {
			const exitEventListeners = process.listeners('exit');
			return app.run(['non-existing-command', 'test param space'])
				.then(() => {
					process.removeAllListeners('exit');
					exitEventListeners.forEach(exitEventListener => process.on('exit', exitEventListener));

					assert.ok(testStdout.outputContains('Input error'), 'Not outputting header');
					assert.ok(testStdout.outputContains('Could not find a match for input "non-existing-command"'), 'Not outputting error message');
				})
				.catch(() => {
					process.removeAllListeners('exit');
					exitEventListeners.forEach(exitEventListener => process.on('exit', exitEventListener));
				});
		});

		it('is able to handle any thrown error without a message', () => {
			app.error('testfail', { stack: 'test trace' });
			assert.ok(testStdout.outputContains('testfail'), 'Not outputting header');
			assert.ok(testStdout.outputContains('test trace'), 'Not outputting error trace');
		});

		it('is able to handle any thrown error with debug variables', () => {
			app.error('testfail', 'test text error with debug variables', { test: 'test debug variable' });
			assert.ok(testStdout.outputContains('testfail'), 'Not outputting header');
			assert.ok(testStdout.outputContains('test debug variable'), 'Not outputting debug variables');
		});

		it('is able to handle any string error', () => {
			app.error('testfail', 'test text error');
			assert.ok(testStdout.outputContains('testfail'), 'Not outputting header');
			assert.ok(testStdout.outputContains('test text error'), 'Not outputting error message');
		});

		it('is able to handle any InputError', () => {
			app.error('testfail', new app.cli.InputError('Test input message', 'Test solution'));
			assert.ok(testStdout.outputContains('Input error'), 'Not outputting header');
			assert.ok(testStdout.outputContains('Test input message'), 'Not outputting error message');
			assert.ok(testStdout.outputContains('Test solution'), 'Not outputting solution');
			assert.ok(testStdout.outputContains('You might be able to fix this, use the "--help" flag for usage info.'), 'Not outputting "run with --help flag" message');
		});
	});

	describe('comes with core module installed', () => {
		it('has a help option', () => {
			assert.strictEqual(app.cli.options.find(c => c instanceof AskNicely.IsolatedOption).name, 'help');
		});
	});

	describe('can read from multiple configuration files', () => {
		const configurationLevelTestDirs = [
				{ 'lvl-1': 'one' },
				{ 'lvl-2': 'two' },
				{ 'lvl-1': 'three', 'lvl-2': 'three', 'lvl-3': 'three' }
			].map((content, level) => {
				let file = cwd,
					lvl = 0;

				while (lvl < level) {
					file = path.join(file, 'lvl-' + (++lvl));
				}

				return {
					level,
					file: path.join(file, CONFIG_FILE_NAME),
					content
				};
			}),
			levelDirs = configurationLevelTestDirs.map(cLTD => cLTD.file);

		before(() => configurationLevelTestDirs.forEach(configurationLevelTestDir => {
			fs.ensureFileSync(configurationLevelTestDir.file);
			fs.writeFileSync(configurationLevelTestDir.file, JSON.stringify(configurationLevelTestDir.content), 'utf8');
		}));

		it('together', () => {
			const appForConfig = new App(levelDirs.slice(0, 2), CONFIG_FILE_NAME, { silent: true });

			// Must not have read the top-most (unspecified) config file
			assert.strictEqual(appForConfig.config['lvl-0'], undefined);

			assert.strictEqual(appForConfig.config['lvl-1'], 'one');
			assert.strictEqual(appForConfig.config['lvl-2'], 'two');

			// Confirm that there is no lvl-3 loaded
			assert.strictEqual(appForConfig.config['lvl-3'], undefined);
		});

		it('giving priority to earliest reads', () => {
			const appForConfig = new App(levelDirs.slice(0, 3), CONFIG_FILE_NAME, { silent: true });

			// Confirm 1 and 2 have not been overwritten by "three"
			assert.strictEqual(appForConfig.config['lvl-1'], 'one');
			assert.strictEqual(appForConfig.config['lvl-2'], 'two');

			// Confirm 3 is also present
			assert.strictEqual(appForConfig.config['lvl-3'], 'three');
		});
	});

	describe('is able to install built-in modules', () => {
		const appWithBuiltInModule = new App([cwd], CONFIG_FILE_NAME, { silent: true, appName: 'fotno-test' });

		it('can enable built-in modules', () => {
			appWithBuiltInModule.enableBuiltInModule(path.join(cwd, 'test-module-1'));
			assert.strictEqual(appWithBuiltInModule.modules.filter(m => m.getInfo().name === 'test-module-1').length, 1);
		});

		it('contains the test-command-1 command', () => {
			assert.ok(appWithBuiltInModule.cli.children.some(c => c.name === 'test-command-1'));
		});

		it('throws when trying to add the same module twice', () => {
			assert.throws(() => {
				appWithBuiltInModule.enableBuiltInModule(path.join(cwd, 'test-module-1'));
				appWithBuiltInModule.enableBuiltInModule(path.join(cwd, 'test-module-1'));
			});
		});
	});
});

after(cleanupAppDir);
