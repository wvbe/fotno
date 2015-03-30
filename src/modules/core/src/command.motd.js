'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

function leftAlign (text, lineWidth) {
	if (text.length < lineWidth) {
		text = '\xa0'.repeat(lineWidth - text.length) + text;
	}
	return text;
}

module.exports = (fotno, app, opts) => {
	const logoConfig = fotno.registerConfiguration(
		'logo', {
			logoIndex: 0
		});

	app.cli.setController(function logoController (_req, res) {
		let logos = logoConfig.logos;

		if (!logos) {
			const logosFileContents = fs.readFileSync(path.resolve(__dirname, 'logos.txt')).toString().split(os.EOL);
			logos = logosFileContents
				.reduce((all, line) => {
					if (line) {
						all[0].push(line);
					}
					else if (all[0].length) {
						all.unshift([]);
					}
					return all;
				}, [[]])
				.filter(lines => lines.length)
				.reverse();
		}

		res.break();
		let maxLineLength = 0;
		if (logos.length && !opts.silent) {
			logos[(logoConfig.logoIndex || 0) % logos.length]
				.map(line => {
					if (maxLineLength < line.length) {
						maxLineLength = line.length;
					}
					return '  ' + line;
				})
				.forEach(line => {
					console.log(line); // eslint-disable-line no-console
				});
		}
		else {
			res.caption(fotno.getAppInfo().name);
		}

		res.break();
		if (fotno.getAppInfo().name === 'fotno') {
			res.debug(leftAlign(`v${fotno.getAppInfo().fotnoVersion}`, maxLineLength));
		}
		else {
			res.debug(leftAlign(`Powered by fotno v${fotno.getAppInfo().fotnoVersion}`, maxLineLength));
		}

		res.break();
		res.notice(`Run "${fotno.getAppInfo().name} --help" to show usage information.`);
	});
};
