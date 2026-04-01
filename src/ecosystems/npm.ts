import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PackageURL } from 'packageurl-js';
import { cleanNpmVersionRange, packageDeduplication } from '../util';
import { Package, PackageLockV2, PackageLockV1 } from '../types';
import { NPM_EXCLUDE } from '../constants';

export async function detectNpm(): Promise<Package[]> {

    const packages: Package[] = [];
    const detectedDirs = new Set<string>();

    const pkgLockURIs = await vscode.workspace.findFiles('**/package-lock.json', NPM_EXCLUDE);
    const pkgJsonURIs = await vscode.workspace.findFiles('**/package.json', NPM_EXCLUDE);

    console.log(`Found ${pkgLockURIs.length} package-lock.json and ${pkgJsonURIs.length} package.json files`);

    // Try to detect from package-lock.json first, as it contains more accurate version information.
    // Then use package.json for directories not covered by any package-lock.json 
    for (const uri of pkgLockURIs) {
        detectedDirs.add(path.dirname(uri.fsPath));
        packages.push(...await detectNpmPackageLockFile(uri.fsPath));
    }

    for (const uri of pkgJsonURIs) {
        const dir = path.dirname(uri.fsPath);
        if (detectedDirs.has(dir)) continue;
        packages.push(...await detectNpmPackageFile(uri.fsPath));
    }

    // Deduplicate packages by file and purl, as the same package may be detected multiple times if there are multiple package-lock.json files referencing the same dependency.
    return packageDeduplication(packages);
}

async function detectNpmPackageFile(packageJsonPath: string): Promise<Package[]> {

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

async function detectNpmPackageLockFile(packageLockPath: string): Promise<Package[]> {

    const packages: Package[] = [];
    let directDependencies = new Set<string>();

    const packageJsonPath = path.join(path.dirname(packageLockPath), 'package.json');

    try {

        const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf-8')) as PackageLockV1 & PackageLockV2;

        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            directDependencies = new Set([
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

                let dependencyType = directDependencies.has(name) ? 'direct' : 'transitive';

                if (directDependencies.size < 1) {
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

                let dependencyType = directDependencies.has(name) ? 'direct' : 'transitive';

                if (directDependencies.size < 1) {
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
