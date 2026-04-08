import * as vscode from 'vscode';
import { PythonDetector, NpmDetector, RubyDetector, GoDetector } from './ecosystems';
import { runtimeState } from './state/runtime';
import { secretState } from './state/secret';
import { Package, Finding, AuditResult, EcosystemDetector } from './types';
import { packageDeduplication, toDiagnosticSeverity } from './util';
import { FINDING_MAX_DESCRIPTION_LENGTH } from './constants';

const config = vscode.workspace.getConfiguration('secdb');

export async function scanDependencies() {

    return await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'ZEN SecDB: Scan dependencies in workspace...' }, async () => {

        const detectors: EcosystemDetector[] = [
            new PythonDetector(),
            new NpmDetector(),
            new GoDetector(),
            new RubyDetector()
        ];

        const results = await Promise.all(
            detectors.map(async detector => {
                try {

                    console.debug(`[${detector.id}] detection started`);
                    const packages = await detector.detect();
                    console.debug(`[${detector.id}] detection completed (found ${packages.length} packages)`);

                    return packages;

                } catch (err) {
                    console.error(`[${detector.id}] failed`, err);
                    return [];
                }
            })
        );

        const packages = packageDeduplication(results.flat());

        console.log(`Detected ${packages.length} packages in workspace`);
        runtimeState.setPackages(packages);

        return packages;

    });

}

export async function refreshDependencies(provider?: { refresh(): void }) {
    await scanDependencies();
    provider?.refresh();
}

export async function auditDependencies(collection: vscode.DiagnosticCollection) {

    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return;

    const dependencies = await scanDependencies();
    const findings: Finding[] = [];
    const baseURL = (vscode.workspace.getConfiguration('secdb').get('baseURL') as string).replace(/\/$/, '');
    const purlWithAdvisories = new Map<string, number>();

    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'ZEN SecDB: Audit dependencies in workspace...' }, async () => {

        if (dependencies.length === 0) {
            vscode.window.setStatusBarMessage('ZEN SecDB: no dependencies found in workspace', 5000);
            collection.clear();
            return;
        }

        let auditResults: AuditResult[] = await callAuditAPI(config, dependencies);

        for (const audit of auditResults) {

            const dependency = dependencies.find(d => d.purl === audit.package);
            const totalAdvisories = (audit.advisories ?? []).length;

            purlWithAdvisories.set(audit.package, totalAdvisories);

            for (const advisory of audit.advisories) {

                findings.push({
                    package: dependency!,
                    advisory: advisory.id,
                    title: advisory.title ?? 'Security Advisory',
                    summary: advisory.summary,
                    description: advisory.description,
                    severity: advisory.severity,
                    cves: advisory.cves ?? [],
                    url: `${baseURL}/security-advisory/detail/${advisory.id}`,
                });

            }
        }

        const enrichedDeps = dependencies.map(dependency => {
            const totalAdvisories = purlWithAdvisories.get(dependency.purl) ?? 0;
            return {
                ...dependency,
                totalAdvisories: totalAdvisories,
                isVulnerable: totalAdvisories > 0
            };
        });

        runtimeState.setPackages(enrichedDeps);

        runtimeState.clearFindings();
        for (const f of findings) runtimeState.putFinding(f.advisory, f);

        publishDiagnostics(findings, collection);
        vscode.window.showInformationMessage(`ZEN SecDB: ${findings.length} finding(s)`);

    });

}

async function callAuditAPI(config: vscode.WorkspaceConfiguration, packages: Package[]) {

    const baseURL = (config.get('baseURL') as string).replace(/\/$/, '');
    const apiKey = await secretState.getApiKey();
    const url = new URL('/api/v1/audit/purl', baseURL).toString();

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-SecDB-Client': runtimeState.clientId,
                ...(apiKey ? { 'X-API-KEY': apiKey } : {})
            },
            body: JSON.stringify({ purls: packages.map(p => (p.purl)) })
        });

        console.debug(`[ZEN SecDB] HTTP ${response.status}`);

        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            vscode.window.showWarningMessage(`ZEN SecDB: rate limit (429). Retry-After: ${retryAfter ?? 'unknown'}s`);
            return [];
        }

        if (!response.ok) {
            vscode.window.showErrorMessage(`ZEN SecDB: error ${response.status}`);
            return [];
        }

        return await response.json() as AuditResult[];

    } catch (e: any) {
        vscode.window.showErrorMessage(e?.message ?? 'ZEN SecDB: request failed');
        return [];
    }

}

function publishDiagnostics(findings: Finding[], collection: vscode.DiagnosticCollection) {

    const diagnosticFiles = new Map<string, vscode.Diagnostic[]>();

    for (const f of findings) {

        const line0 = Math.max(0, (f.package.line ?? 1) - 1);
        const range = new vscode.Range(line0, 0, line0, 999);
        const cves = f.cves.length ? f.cves.join(', ') : 'N/A';
        const message = `${f.advisory} (${f.severity}) - ${f.title} (${cves})`;
        const severity = toDiagnosticSeverity(f.severity);

        const desc = f.description
            ? (f.description.length > FINDING_MAX_DESCRIPTION_LENGTH ? f.description.slice(0, FINDING_MAX_DESCRIPTION_LENGTH) + '...' : f.description)
            : undefined;

        const d = new vscode.Diagnostic(range, message, severity);

        d.source = 'ZEN SecDB';

        d.code = {
            value: f.advisory,
            target: vscode.Uri.parse(f.url),
        };

        if (desc) {
            d.relatedInformation = [
                new vscode.DiagnosticRelatedInformation(
                    new vscode.Location(vscode.Uri.file(f.package.file), range),
                    desc
                )
            ];
        }

        (diagnosticFiles.get(f.package.file) ?? diagnosticFiles.set(f.package.file, []).get(f.package.file)!)!.push(d);

    }

    collection.clear();

    for (const [file, diagnostic] of diagnosticFiles) {
        collection.set(vscode.Uri.file(file), diagnostic);
    }

}
