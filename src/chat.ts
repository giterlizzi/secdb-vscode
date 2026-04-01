import * as vscode from 'vscode';
import { Finding } from './types';
import { runtimeState } from './state/runtime';

export function createChatParticipant(): void {

    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ) => {

        if (request.command === "info") {

            const advisoryId = request.prompt.trim();
            const finding = runtimeState.getFinding(advisoryId);

            if (!finding) {
                stream.markdown(`No finding found for advisory ID ${advisoryId}`);
                return;
            }

            const info = renderFindingInfo(finding);
            stream.markdown(info);

        };
    };

    vscode.chat.createChatParticipant("zen-secdb.secdb", handler);
}

export function renderFindingInfo(finding: Finding): string {

    const info: string[] = [
        `## ${finding.title}`,
        '',
        `**Advisory ID:** ${finding.advisory}`,
        `**Severity:** ${finding.severity || 'N/A'}`,
        `**PURL:** \`${finding.package.purl}\``,
        `**CVEs:** ${finding.cves?.join(', ') ?? 'N/A'}`,
        '',
        `### Summary`,
        finding.summary || 'N/A',
        '',
        `### Description`,
        finding.description || 'N/A',
        '',
        `### Advisory URL`,
        finding.url || 'N/A'
    ];

    return info.join('\n');

}

export function buildAnalyzeFindingPrompt(finding: Finding): string {

    const prompt: string[] = [
        'Using **ZEN SecDB MCP server**, analyze the following finding.',
        '',
        'Finding context:',
        `- Advisory: ${finding.advisory}`,
        `- Title: ${finding.title}`,
        `- Severity: ${finding.severity || 'N/A'}`,
        `- PURL: \`${finding.package.purl}\``,
        `- CVEs: ${finding.cves?.join(', ') ?? 'N/A'}`,
        `- Summary: ${finding.summary || 'N/A'}`,
        `- Description: ${finding.description}`,
        '',
        'Please provide:',
        '- A detailed analysis of the finding.',
        '- Related CVE details',
        '- Known sightings or exploitation evidence, if available.',
        '- The potential impact of this vulnerability on the affected package and its users.',
        '- Possible remediation steps to address this vulnerability.',
        '- Any relevant information that could help in understanding and addressing this issue.',
        '- If the MCP tool fails to provide a useful answer, try to understand the reason and provide a useful answer anyway.',
    ];

    return prompt.join('\n');

}
