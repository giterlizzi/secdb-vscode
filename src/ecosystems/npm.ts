import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PackageURL } from 'packageurl-js';
import { cleanNpmVersionRange } from '../util';
import { Package, PackageLockV2, PackageLockV1, EcosystemDetector } from '../types';
import { ExcludeDirGlobs } from '../constants';

export class NpmDetector implements EcosystemDetector {

    readonly id = 'npm';

    async detect(): Promise<Package[]> {

        const packages: Package[] = [];
        const detectedDirs = new Set<string>();

        const pkgLockURIs = await vscode.workspace.findFiles('**/package-lock.json', ExcludeDirGlobs.NPM);
        const pkgJsonURIs = await vscode.workspace.findFiles('**/package.json', ExcludeDirGlobs.NPM);
        const yarnLockURIs = await vscode.workspace.findFiles('**/yarn.lock', ExcludeDirGlobs.NPM);

        console.debug(`[${this.id}] Found ${pkgLockURIs.length} package-lock.json and ${pkgJsonURIs.length} package.json files`);

        // Try to detect from package-lock.json first, as it contains more accurate version information.
        // Then use package.json for directories not covered by any package-lock.json 
        for (const uri of pkgLockURIs) {
            detectedDirs.add(path.dirname(uri.fsPath));
            packages.push(...await this.parsePackageLockFile(uri.fsPath));
        }

        for (const uri of pkgJsonURIs) {
            const dir = path.dirname(uri.fsPath);
            if (detectedDirs.has(dir)) continue;
            packages.push(...await this.parsePackageFile(uri.fsPath));
        }

        for (const uri of yarnLockURIs) {
            detectedDirs.add(path.dirname(uri.fsPath));
            packages.push(...await this.parseYarnLockFile(uri.fsPath));
        }

        return packages;

    }

    private async parsePackageFile(packageJsonPath: string): Promise<Package[]> {

        const packages: Package[] = [];

        try {

            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            for (const [name, versionRange] of Object.entries(packageJson.dependencies)) {

                const version = cleanNpmVersionRange(String(versionRange));
                const purl = new PackageURL('npm', undefined, name, version).toString();

                packages.push({
                    ecosystem: 'npm',
                    name: name,
                    version: version,
                    purl: purl,
                    file: packageJsonPath,
                    line: 1,
                    dependencyType: 'direct'
                });

            }

            return packages;

        } catch (e) {
            return [];
        }
    }

    private async parsePackageLockFile(packageLockPath: string): Promise<Package[]> {

        const packages: Package[] = [];
        let directDeps = new Set<string>();

        const packageJsonPath = path.join(path.dirname(packageLockPath), 'package.json');

        try {

            const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf-8')) as PackageLockV1 & PackageLockV2;

            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                directDeps = new Set([
                    ...Object.keys(packageJson.dependencies),
                    ...Object.keys(packageJson.devDependencies)
                ]);
            }

            // package-lock.json v2
            if ('packages' in packageLock && packageLock.packages && Object.keys(packageLock.packages).length > 0) {

                for (const [path, metadata] of Object.entries(packageLock.packages ?? {})) {

                    if (path === '') continue; // Exclude the project

                    const name = path.replace(/^node_modules\//g, '');
                    const version = metadata.version ?? 'unknown';

                    if (version === 'unknown') continue;

                    if (name.includes('/node_modules/')) {
                        console.warn(`[${this.id}] Skipping nested dependency ${name} in ${packageLockPath}`);
                        continue;
                    }

                    let dependencyType = directDeps.has(name) ? 'direct' : 'transitive';

                    if (directDeps.size < 1) {
                        dependencyType = 'direct';
                    }

                    const purl = new PackageURL('npm', undefined, name, version).toString();

                    packages.push({
                        ecosystem: 'npm',
                        name: name,
                        version: version,
                        purl: purl,
                        file: packageLockPath,
                        line: 1,
                        dependencyType: dependencyType
                    });

                }

            }

            // package-lock.json v1
            if ('dependencies' in packageLock && packageLock.dependencies && Object.keys(packageLock.dependencies).length > 0) {

                for (const [name, metadata] of Object.entries(packageLock.dependencies)) {

                    const version = metadata.version ?? 'unknown';

                    if (version === 'unknown') continue;

                    let dependencyType = directDeps.has(name) ? 'direct' : 'transitive';

                    if (directDeps.size < 1) {
                        dependencyType = 'direct';
                    }

                    const purl = new PackageURL('npm', undefined, name, version).toString();

                    packages.push({
                        ecosystem: 'npm',
                        name: name,
                        version: version,
                        purl: purl,
                        file: packageLockPath,
                        line: 1,
                        dependencyType: dependencyType
                    });

                }

            }

            return packages;

        } catch (e) {
            return [];
        }
    }

    private async parseYarnLockFile(yarnLockPath: string): Promise<Package[]> {

        const packages: Package[] = [];

        try {

            const content = fs.readFileSync(yarnLockPath, 'utf8');
            const lines = content.split(/\r?\n/);

            let n = 0;

            let currentPackageName = null;
            let currentPackageVersion = null;

            for (let line of lines) {

                n++;

                if (line.trim() === '' || line.trim().startsWith('#')) continue;

                const packageHeaderMatch = line.match(/^([^\s].*):$/);

                if (packageHeaderMatch) {
                    const currentPackage = packageHeaderMatch[1].replace(/"/g, '').split(',', 1)[0];
                    currentPackageName = currentPackage.split('@').slice(0, -1).join('@');
                    continue;
                }

                if (currentPackageName && line.trim().startsWith('version')) {

                    const versionMatch = line.match(/version\s+"(.*)"/);

                    if (versionMatch) {
                        currentPackageVersion = versionMatch[1];

                        const purl = new PackageURL('npm', undefined, currentPackageName, currentPackageVersion).toString();

                        packages.push({
                            ecosystem: 'npm',
                            name: currentPackageName,
                            version: currentPackageVersion,
                            purl: purl,
                            file: yarnLockPath,
                            line: n,
                            dependencyType: 'direct'
                        });

                        currentPackageName = null;
                        currentPackageVersion = null;
                    }


                }
            }

            return packages;

        } catch (e) {
            return [];
        }

    }

}
