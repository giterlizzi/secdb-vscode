import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { EcosystemDetector, Package } from '../types';
import { PackageURL } from 'packageurl-js';
import { ExcludeDirGlobs } from '../constants';

export class GoDetector implements EcosystemDetector {

    readonly id = 'golang';

    async detect(): Promise<Package[]> {

        const packages: Package[] = [];
        const detectedDirs = new Set<string>();

        const goModURIs = await vscode.workspace.findFiles('**/go.mod', ExcludeDirGlobs.GO);

        console.debug(`[${this.id}] Found ${goModURIs.length} go.mod files`);

        for (const uri of goModURIs) {
            const dir = path.dirname(uri.fsPath);
            if (detectedDirs.has(dir)) continue;
            detectedDirs.add(dir);
            packages.push(...await this.parseGoModFile(uri.fsPath));
        }

        return packages;
    }

    private async parseGoModFile(goModPath: string): Promise<Package[]> {

        const packages: Package[] = [];

        try {

            const content = await fs.readFile(goModPath, 'utf8');
            const lines = content.split(/\r?\n/);
            let inRequireBlock = false;

            let n = 0;

            for (let line of lines) {

                n++;

                line = line.trim();

                if (!line || line.startsWith('//')) continue;

                const matchSingleRequire = line.match(/^require\s+([A-Za-z0-9._\-\/]+)\s+([\w.\-]+)?/);
                const matchRequireBlock = line.match(/^require\s*\(\s*$/);

                if (matchRequireBlock) {
                    inRequireBlock = true;
                    continue;
                }

                if (inRequireBlock) {

                    if (line === ')') {
                        inRequireBlock = false;
                        continue;
                    }

                    const matchInRequireBlock = line.match(/^([A-Za-z0-9._\-\/]+)\s+([\w.\-]+)?/);

                    if (matchInRequireBlock) {

                        let [, module, version] = matchInRequireBlock;

                        if (!version) continue;

                        const dependencyType = line.includes('// indirect') ? 'transitive' : 'direct';
                        const parts = module.split('/');
                        const name = parts.pop()!;
                        const namespace = parts.join('/');

                        version = version.replace(/^v/, '');

                        const purl = new PackageURL('golang', namespace, name, version).toString();
                        packages.push({
                            ecosystem: 'golang',
                            name: module,
                            version: version,
                            purl: purl,
                            file: goModPath,
                            line: n,
                            dependencyType: dependencyType
                        });

                    }
                }

                if (matchSingleRequire) {

                    let [, module, version] = matchSingleRequire;

                    if (!version) continue;

                    const parts = module.split('/');
                    const name = parts.pop()!;
                    const namespace = parts.join('/');
                    version = version.replace(/^v/, '');

                    const purl = new PackageURL('golang', namespace, name, version).toString();
                    packages.push({ ecosystem: 'golang', name: module, version: version, purl: purl, file: goModPath, line: n });

                }



            }

            return packages;

        } catch (e) {
            return [];
        }
    }

}