import * as vscode from 'vscode';
import { Commands } from '../constants';
import { secretState } from '../state/secret';

export function registerApiKeyActionsCommand(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand(Commands.ApiKeyActions, async () => {

        const pick = await vscode.window.showQuickPick(
            [
                { label: 'Set API key', action: 'set' },
                { label: 'Reset API key', action: 'clear' },
            ],
            { placeHolder: 'ZEN SecDB: API Key' }
        );

        if (!pick) return;

        switch (pick.action) {

            case 'set':

                const apiKey = await vscode.window.showInputBox({
                    prompt: 'Enter ZEN SecDB API key',
                    password: true,
                    ignoreFocusOut: true,
                    placeHolder: "ZEN SecDB API key"
                });

                if (apiKey) {
                    secretState.setApiKey(apiKey);
                    vscode.window.showInformationMessage('ZEN SecDB: API key added');
                }

                break;

            case 'clear':
                await secretState.clearApiKey();
                vscode.window.showInformationMessage('ZEN SecDB: API key removed');
                break;
        }

    }));

}
