import * as vscode from 'vscode';
import { runtimeState } from '../state/runtime';
import { Commands } from '../constants';

export class SecDBCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(_doc: vscode.TextDocument, _range: vscode.Range, context: vscode.CodeActionContext) {

        const actions: vscode.CodeAction[] = [];

        for (const d of context.diagnostics) {

            if (d.source !== 'ZEN SecDB') continue;
            if (!d.code || typeof d.code !== 'object' || !('value' in d.code)) continue;

            const finding = runtimeState.getFinding(String(d.code.value));
            if (!finding) continue;

            const findingActions = new vscode.CodeAction(`ZEN SecDB: Finding actions for ${d.code.value as string}`, vscode.CodeActionKind.QuickFix);
            findingActions.command = { command: Commands.FindingActions, title: `Finding actions`, arguments: [finding] };
            actions.push(findingActions);

        }

        return actions;

    }
}

export function registerCodeActionsProvider(context: vscode.ExtensionContext, codeActionProvider: vscode.CodeActionProvider) {

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file' },
            codeActionProvider,
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
        )
    );

}
