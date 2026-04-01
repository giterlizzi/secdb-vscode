import * as vscode from 'vscode';
import { auditDependencies, scanDependencies } from '../dependencies';
import { Commands } from '../constants';
import { Package } from '../types';

export function registerAuditDependenciesCommand(context: vscode.ExtensionContext, diagnosticCollection: vscode.DiagnosticCollection, dependenciesProvider?: { refresh(): void }) {

    context.subscriptions.push(vscode.commands.registerCommand(Commands.AuditDependencies, async () => {
        await auditDependencies(diagnosticCollection);
        dependenciesProvider?.refresh();
    }));

}

export function registerOpenDependencyCommand(context: vscode.ExtensionContext) {

    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.OpenDependency, async (pkg: Package) => {
            const uri = vscode.Uri.file(pkg.file);
            const doc = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(doc, { preview: false });

            const line0 = Math.max(0, (pkg.line ?? 1) - 1);
            const pos = new vscode.Position(line0, 0);

            editor.selection = new vscode.Selection(pos, pos);
            editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        })
    );

}

export function registerScanDependenciesCommand(context: vscode.ExtensionContext, dependenciesProvider?: { refresh(): void }) {

    context.subscriptions.push(vscode.commands.registerCommand(Commands.ScanDependencies, async () => {
        await scanDependencies();
        dependenciesProvider?.refresh();
    }));

}

export function registerDependenciesFilterCommands(context: vscode.ExtensionContext, dependenciesProvider ?: { setDependencyTypeFilter(filter: 'all' | 'direct' | 'transitive'): void }) {

    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.DependenciesFilterAll, () => {
            dependenciesProvider?.setDependencyTypeFilter('all');
        }),
        vscode.commands.registerCommand(Commands.DependenciesFilterDirect, () => {
            dependenciesProvider?.setDependencyTypeFilter('direct');
        }),
        vscode.commands.registerCommand(Commands.DependenciesFilterTransitive, () => {
            dependenciesProvider?.setDependencyTypeFilter('transitive');
        }),
    );

}

