import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { EcosystemDetector, Package } from '../types';
import { PackageURL } from 'packageurl-js';
import { ExcludeDirGlobs, SPEC_DEPENDENCY_REGEX, CHILD_DEPENDENCY_REGEX} from '../constants';

export class RubyDetector implements EcosystemDetector {

    readonly id = 'ruby';

    async detect(): Promise<Package[]> {

        const lockURIs = await vscode.workspace.findFiles('**/Gemfile.lock', ExcludeDirGlobs.RUBY);
        const packages: Package[] = [];

        console.debug(`[${this.id}] Found ${lockURIs.length} Ruby Gemfile.lock files`);

        for (const uri of lockURIs) {
            packages.push(...await this.parseGemfileLock(uri.fsPath));
        }

        return packages;

    }

    private async parseGemfileLock(lockFilePath: string): Promise<Package[]> {

        const content = await fs.readFile(lockFilePath, 'utf-8');
        const lines = content.split(/\r?\n/);

        const packages: Package[] = [];
        let inSpecs = false;
        let n = 0;

        for (let line of lines) {

            n++;

            if (line.trim() === 'specs:') {
                inSpecs = true;
                continue;
            }

            if (line.match(/^$/)) {
                inSpecs = false;
                continue;
            }

            if (inSpecs) {
                if (line.match(SPEC_DEPENDENCY_REGEX)) {

                    const matches = line.match(SPEC_DEPENDENCY_REGEX);
                    const [, name, version] = matches || [];
                    const purl = new PackageURL('gem', undefined, name, version).toString();

                    packages.push({
                        ecosystem: 'gem',
                        file: lockFilePath,
                        line: n,
                        name: name,
                        version: version,
                        purl: purl,
                        dependencyType: 'direct'
                    });

                }
            }

        }

        return packages;
    }

}

