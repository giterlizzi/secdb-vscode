import * as vscode from 'vscode';
import * as fs from 'fs';
import { Finding } from '../types';
import { Commands } from '../constants';
import { htmlEscape } from '../util';
import markdownit from 'markdown-it';
import { buildAnalyzeFindingPrompt } from '../chat';

function renderFindingWebview(context: vscode.ExtensionContext, finding: Finding): vscode.WebviewPanel {

    const panel = vscode.window.createWebviewPanel(
        'secdbFindingDetail',
        `ZEN SecDB: ${finding.advisory}`,
        vscode.ViewColumn.Beside,
        { enableScripts: false }
    );

    const md = markdownit();

    const webviewStyle = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'style.css'));
    const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'finding-detail.html');

    let html = fs.readFileSync(htmlPath.fsPath, 'utf-8');

    html = html.replaceAll('{{style}}', webviewStyle.toString())
        .replaceAll('{{title}}', htmlEscape(finding.title))
        .replaceAll('{{severity}}', htmlEscape(finding.severity?.toLowerCase() ?? 'unknown'))
        .replaceAll('{{advisoryId}}', htmlEscape(finding.advisory))
        .replaceAll('{{summary}}', md.render(finding.summary || ''))
        .replaceAll('{{description}}', md.render(finding.description || ''))
        .replaceAll('{{purl}}', htmlEscape(finding.package.purl))
        .replaceAll('{{dependencyType}}', htmlEscape(finding.package.dependencyType ?? 'unknown'))
        .replaceAll('{{cves}}', htmlEscape(finding.cves?.join(', ') ?? 'N/A'))
        .replaceAll('{{advisoryUrl}}', htmlEscape(finding.url));

    panel.webview.html = html;

    return panel;
}

export function registerFindingActionsCommand(context: vscode.ExtensionContext) {

    vscode.commands.registerCommand(Commands.FindingActions, async (finding: Finding) => {

        const pick = await vscode.window.showQuickPick(
            [
                {
                    label: 'Show finding details',
                    action: 'webviewDetail',
                    detail: 'Show finding details in a new panel'
                },
                {
                    label: 'Write details in chat',
                    action: 'chatDetail',
                    detail: 'Write finding details in the chat panel'
                },
                {
                    label: 'Analyze in chat',
                    action: 'analyzeFinding',
                    detail: 'Analyze the finding in the chat panel'
                },
            ],
            { placeHolder: `ZEN SecDB: Finding helpers for ${finding.advisory}` }
        );

        if (!pick) return;

        switch (pick.action) {

            case 'webviewDetail':
                renderFindingWebview(context, finding);
                break;

            case 'chatDetail':
                vscode.commands.executeCommand('workbench.action.chat.open', {
                    query: `@secdb /info ${finding.advisory}`
                });
                break;

            case 'analyzeFinding':
                vscode.commands.executeCommand('workbench.action.chat.open', {
                    query: buildAnalyzeFindingPrompt(finding)
                });
                break;

        }

    });
}
