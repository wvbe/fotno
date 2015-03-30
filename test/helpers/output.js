let stdoutIsCapturing = false;
let stdoutOutput;
let stdoutWrite;

function stdoutWriteOverride (line) {
	stdoutOutput.push(line);
}

function outputContains (output, value) {
	if (!output || !output.length) {
		return false;
	}

	return output.some((line) => {
		if (value instanceof RegExp) {
			return value.test(line);
		}

		return line.indexOf(value) !== -1;
	});
}

function getStdout () {
	return (stdoutOutput || []).slice();
}

function startCaptureStdout () {
	stdoutOutput = [];

	if (stdoutIsCapturing) {
		return;
	}

	stdoutWrite = process.stdout.write;
	process.stdout.write = stdoutWriteOverride;
	stdoutIsCapturing = true;
}

function stdoutContains (value) {
	return outputContains(stdoutOutput, value);
}

function stopCaptureStdout () {
	if (!stdoutIsCapturing) {
		return;
	}

	process.stdout.write = stdoutWrite;
	stdoutWrite = null;
	stdoutIsCapturing = false;
}

function stdoutCatch (error) {
	stopCaptureStdout();
	throw error;
}

function createTestStdout () {
	let output = [];
	return {
		getOutput: () => output.slice(),
		outputContains: (line) => outputContains(output, line),
		resetOutput: () => output = [],
		write: (line) => output.push(line)
	};
}

module.exports = {
	getStdout,
	startCaptureStdout,
	stdoutCatch,
	stdoutContains,
	stopCaptureStdout,

	createTestStdout
};
