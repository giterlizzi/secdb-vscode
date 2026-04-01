import * as vscode from 'vscode';
import { Commands } from '../constants';

export function registerMcpActionsCommand(context: vscode.ExtensionContext, emitter: vscode.EventEmitter<void>) {

    context.subscriptions.push(vscode.commands.registerCommand(Commands.McpActions, async () => {

        const pick = await vscode.window.showQuickPick(
            [
                { label: 'Open MCP servers list (native)', action: 'open' },
                { label: 'Refresh ZEN SecDB MCP Server definition', action: 'refresh' },
            ],
            { placeHolder: 'ZEN SecDB: MCP Server' }
        );

        if (!pick) return;

        switch (pick.action) {
            case 'refresh':
                emitter.fire();
                vscode.window.showInformationMessage('ZEN SecDB: MCP server definition reloaded');
                break;
            case 'open':
                try {
                    vscode.window.showInformationMessage('ZEN SecDB: Select "ZEN SecDB" and "Start Server"');
                    await vscode.commands.executeCommand('workbench.mcp.listServer');

                } catch (e: any) {
                    vscode.window.showWarningMessage('ZEN SecDB: Unable to open the MCP servers list. Open command palette and run: "MCP: List Servers"');
                    console.error(e);
                }
                break;
        }

    }));

}
