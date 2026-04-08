import * as assert from 'assert';
import * as vscode from 'vscode';

import { NpmDetector, GoDetector } from '../ecosystems';

suite('Ecosystem Detection Test Suite', () => {
	test('Detect ecosystems', async () => {

		const npmResult = await new NpmDetector().detect();
		const goResult = await new GoDetector().detect();

		assert.strictEqual(Array.isArray(npmResult), true, 'NPM: Result should be an array');
		assert.strictEqual(Array.isArray(goResult), true, 'Go: Result should be an array');

	});
});
