'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const App = require('../index');

const CONFIG_FILE_NAME = '.fotnotestrc';

const cwd = path.resolve(__dirname, 'app');
const app = new App([cwd], CONFIG_FILE_NAME, { silent: true, appName: 'fotno-test' });

function cleanupAppDir () {
	return new Promise((response, reject) => fs.remove(path.join(cwd, CONFIG_FILE_NAME), (err) => err ? reject(err) : response()));
}

before(cleanupAppDir);

describe('module command', () => {
	// @NOTE: Doesn't look like anything is actually being tested here, missing asserts ~wybe
	xit('does nothing if no add, remove, or list switches are specified', () => {
		return app.run(['module']);
	});

	describe('is able to install more modules', () => {
		before(() => app.run(['module', '-a', path.join(cwd, 'test-module-1')]));

		it('has the module registered', () => {
			assert.ok(app.modules.some(c => c.getInfo().name === 'test-module-1'));
		});

		it('contains the test-command-1 command', () => {
			assert.ok(app.cli.children.some(c => c.name === 'test-command-1'));
		});

		it('has context informers', () => {
			assert.ok(app.modules.some(c => c.getContextInformers().length));
		});

		it('has test-configuration', () => {
			assert.strictEqual(app.config['test-configuration'], 'test');
		});

		it('created a ' + CONFIG_FILE_NAME, () => {
			assert.ok(fs.existsSync(path.join(cwd, CONFIG_FILE_NAME)));
		});

		it('is able to be booted with modules', () => {
			assert.strictEqual(new App([cwd], CONFIG_FILE_NAME, { silent: true }).modules.filter(m => m.getInfo().name === 'test-module-1').length, 1);
		});

		it('ignores non existing modules', () => {
			return app.run(['module', '-a', 'non-existing-module']);
		});
	});

	describe('is able to list installed modules', () => {
		it('is able to list installed modules', () => {
			return app.run(['module', '-l']);
		});

		it('is able to verbose list installed modules', () => {
			return app.run(['module', '-l', '-v']);
		});
	});

	describe('is able to uninstall modules', () => {
		before(() => app.run(['module', '-r', path.join(cwd, 'test-module-1')]));

		it('does not have the module registered', () => {
			assert.ok(app.modules.every(c => c.name !== 'test-module-1'));
		});

		it('ignores non existing modules', () => {
			return app.run(['module', '-r', 'non-existing-module']);
		});
	});
});

after(cleanupAppDir);
