'use strict';

const fs = require('fs');
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
		},
		() => {
			return null;
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
					res.config.stdout.write(line + '\n');
				});
		}
		else {
			res.caption(fotno.getAppInfo().name);
		}

		if (fotno.getAppInfo().version) {
			res.break();
			res.debug(leftAlign(`v${fotno.getAppInfo().version}`, maxLineLength));
		}

		res.break();
		res.notice(`Run "${fotno.getAppInfo().name} --help" to show usage information.`);
	});
};
