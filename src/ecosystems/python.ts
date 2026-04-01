import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PackageURL } from 'packageurl-js';
import { packageDeduplication } from '../util';
import { Package } from '../types';
import { PYTHON_EXCLUDE } from '../constants';

export async function detectPython(): Promise<Package[]> {
    const packages: Package[] = [];

    const reqTxtURIs = await vscode.workspace.findFiles(`**/requirements*.txt`, PYTHON_EXCLUDE);

    console.log(`Found ${reqTxtURIs.length} Python requirements files`);

    for (const uri of reqTxtURIs) {
        packages.push(...await detectPythonRequirementsFile(uri.fsPath));
    }

    return packageDeduplication(packages);
}

async function detectPythonRequirementsFile(requirementsPath: string, detectedDirs = new Set<string>()): Promise<Package[]> {

    try {

        const packages: Package[] = [];
        const currentDir = path.dirname(requirementsPath);

        if (detectedDirs.has(currentDir)) return [];
        detectedDirs.add(currentDir);

        const content = await fs.readFile(requirementsPath, 'utf8');
        const lines = content.split(/\r?\n/);

        let n = 0;

        for (let line of lines) {

            n++;

            line = line.trim();

            if (!line || line.startsWith('#')) continue;

            if (line.startsWith('-r')) {
                const reference = line.slice(2).trim();
                const refPath = path.resolve(path.dirname(currentDir), reference);
                const refPackages = await detectPythonRequirementsFile(refPath, detectedDirs);
                packages.push(...refPackages);

                continue;
            }

            const match = line.match(/^([A-Za-z0-9._\-]+)\s*([=<>!~]+)?\s*([\w.\-]+)?/);

            if (match) {

                const [, name, operator, version] = match;
                const purl = new PackageURL('pypi', undefined, name, version).toString();

                packages.push({
                    ecosystem: 'pypi',
                    file: requirementsPath,
                    line: n,
                    name: name,
                    version: version,
                    purl: purl,
                    dependencyType: 'direct'
                });
            }
        }

        return packages;

    } catch (e) {
        return [];
    }
}