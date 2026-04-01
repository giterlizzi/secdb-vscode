import * as vscode from 'vscode';

import {
    SecDBCodeActionProvider,
    SecDBDependenciesProvider,

    registerCodeActionsProvider,
    registerDependenciesProvider,
    registerMcpProvider
} from './providers';

import {
    registerApiKeyActionsCommand,
    registerAuditDependenciesCommand,
    registerDependenciesFilterCommands,
    registerFindingActionsCommand,
    registerMcpActionsCommand,
    registerOpenDependencyCommand,
    registerScanDependenciesCommand,
} from './commands';

import { refreshDependencies } from './dependencies';
import { secretState } from './state/secret';
import { runtimeState } from './state/runtime';
import { createChatParticipant } from './chat';
import { register } from 'module';

export function activate(context: vscode.ExtensionContext) {

    console.log('Extension "secdb-vscode" is now activated!');

    runtimeState.extensionVersion = context.extension.packageJSON.version ?? '0.0.0';
    runtimeState.clientId = `SecDB-VSCode/${runtimeState.extensionVersion}`;

    secretState.init(context.secrets);

    const mcpDidChangeEmitter = new vscode.EventEmitter<void>();
    context.subscriptions.push(mcpDidChangeEmitter);

    const codeActionProvider = new SecDBCodeActionProvider();
    const dependenciesProvider = new SecDBDependenciesProvider();

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('secdb');
    context.subscriptions.push(diagnosticCollection);

    registerDependenciesProvider(context, dependenciesProvider);
    registerMcpProvider(context, mcpDidChangeEmitter);
    registerCodeActionsProvider(context, codeActionProvider);

    registerAuditDependenciesCommand(context, diagnosticCollection, dependenciesProvider);
    registerOpenDependencyCommand(context);
    registerScanDependenciesCommand(context, dependenciesProvider);
    registerDependenciesFilterCommands(context, dependenciesProvider);
    registerFindingActionsCommand(context);
    registerApiKeyActionsCommand(context);
    registerMcpActionsCommand(context, mcpDidChangeEmitter);

    refreshDependencies(dependenciesProvider);

    createChatParticipant();

}

export function deactivate() { }
