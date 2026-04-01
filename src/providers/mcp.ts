import * as vscode from 'vscode';
import { runtimeState } from '../state/runtime';
import { secretState } from '../state/secret';

const config = vscode.workspace.getConfiguration('secdb');

export function registerMcpProvider(context: vscode.ExtensionContext, didChangeEmitter: vscode.EventEmitter<void>) {

    context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('secdbMcpProvider', {
        onDidChangeMcpServerDefinitions: didChangeEmitter.event,
        provideMcpServerDefinitions: async () => {

            let servers: vscode.McpServerDefinition[] = [];

            const baseURL = (config.get('baseURL') as string).replace(/\/$/, '');
            const mcpURL = new URL('/mcp', baseURL);

            const apiKey = await secretState.getApiKey();
            const headers = {
                'X-SecDB-Client': runtimeState.clientId,
                ...(apiKey ? { 'X-API-KEY': apiKey } : {})
            };

            servers.push(new vscode.McpHttpServerDefinition('ZEN SecDB', vscode.Uri.parse(mcpURL.toString()), headers, '1.0.0'));
            return servers;

        },
        resolveMcpServerDefinition: async (server: vscode.McpServerDefinition) => {
            return server;
        }
    }));
}
