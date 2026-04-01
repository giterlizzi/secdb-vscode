import * as vscode from 'vscode';
import { Package } from './types';

export function htmlEscape(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function toDiagnosticSeverity(severity?: string): vscode.DiagnosticSeverity {

    if (!severity) return vscode.DiagnosticSeverity.Information;

    switch (severity.toLowerCase()) {
        case 'critical':
        case 'high':
            return vscode.DiagnosticSeverity.Error;
        case 'medium':
        case 'moderate':
            return vscode.DiagnosticSeverity.Warning;
        case 'low':
            return vscode.DiagnosticSeverity.Information;
        default:
            return vscode.DiagnosticSeverity.Information;
    }

}

export function cleanNpmVersionRange(versionRange: string) {
    return versionRange.replace(/^[\^~><=\s]*/g, '');
}

export function packageDeduplication(items: Package[]): Package[] {

    const seen = new Set<string>();
    const out: Package[] = [];

    for (const item of items) {
        const key = `${item.file}|${item.purl}|${item.line ?? 0}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(item);
    }

    return out;
}
