import * as assert from 'assert';
import * as vscode from 'vscode';

import { detectNpm, detectGo, detectPython } from '../ecosystems';

suite('Ecosystem Detection Test Suite', () => {
	test('Detect ecosystems', async () => {

		const npmResult = await detectNpm();
		const goResult = await detectGo();
		const pythonResult = await detectPython();

		assert.strictEqual(Array.isArray(npmResult), true, 'NPM: Result should be an array');
		assert.strictEqual(Array.isArray(goResult), true, 'Go: Result should be an array');
		assert.strictEqual(Array.isArray(pythonResult), true, 'Python: Result should be an array');

	});
});
