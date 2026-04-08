# ZEN SecDB

[![Version][version_badge]][version_link]
[![Marketplace Downloads][downloads_badge]][marketplace]
[![Open VSX Downloads][openvsx_downloads_badge]][openvsx]
[![License][license_badge]][license]

[Marketplace] | [OpenVSX] | [Releases]

Dependency discovery, dependency audit, and vulnerability intelligence for Visual Studio Code.

ZEN SecDB helps you detect project dependencies, audit them using [NTT DATA ZEN SecDB Portal][zen_secdb], surface advisories directly in VS Code, and analyze findings through built-in chat workflows.

## Features

- Detect dependencies from supported project files
- Generate PURLs (Package URL) for discovered packages
- Audit dependencies using [ZEN SecDB Portal][zen_secdb]
- Show findings in the **Problems** panel
- Browse detected dependencies in a dedicated **Tree View**
- Open advisory details directly from VS Code
- Open AI chat workflows for finding analysis
- Configure the **ZEN SecDB MCP server** from VS Code
- Use a **chat participant** for finding info workflows

## Supported ecosystems

Current support includes:

- **npm**
  - `package.json`
  - `package-lock.json`
  - `yarn.lock`
- **Python**
  - `requirements.txt`
  - `requirements-*.txt`
- **Go**
  - `go.mod`
- **Ruby**
  - `Gemfile.lock`

## What the extension does

ZEN SecDB currently supports two main workflows:

### Dependency scan

This detects project dependencies and populates the dependency view without performing a vulnerability audit.

Use this when you want to verify:

- what the extension detected
- which files were parsed
- which package versions and PURLs were generated

### Dependency audit

This detects dependencies, sends their PURLs to SecDB, and returns matching advisories and CVEs.

Findings are surfaced directly in:

- the **Problems** panel
- contextual actions
- advisory details views

## Commands

### Dependency commands

| Command | Description |
|---|---|
| **SecDB: Scan Dependencies** | Detect dependencies in the current workspace without running an audit. |
| **SecDB: Audit Dependencies** | Detect dependencies and audit them using [ZEN SecDB Portal API][zen_secdb]. |

### MCP commands

| Command | Description |
|---|---|
| **SecDB: MCP Actions** | Open MCP-related actions for the SecDB MCP server. |

### AI and chat workflows

The extension currently supports chat-based workflows such as:

| Workflow | Description |
|---|---|
| **Info** | Retrieve structured information for a finding through the chat participant. |
| **Analyze** | Open the VS Code chat with a prefilled prompt for finding analysis. |

## Views

### SecDB Dependencies

The dependency view shows detected packages grouped by source file.

Each dependency can include:

- ecosystem
- name
- version
- PURL (Package URL)
- advisory count, when available

This view is useful both for normal usage and for troubleshooting dependency detection.

## Quick start

1. Open a workspace containing supported dependency files
2. Run `SecDB: Scan Dependencies` (detection only) or `SecDB: Audit Dependencies` command (or use the buttons in **Dependencies (ZEN SecDB)** panel):
3. Review:

- the **Dependencies (ZEN SecDB)** view

  ![Dependencies View](images/dependencies-view.png)

  ![Dependencies Filter](images/dependencies-filter.png)

  ![Dependency Detail](images/dependency-detail.png)

- the **Problems** panel

  ![Problems Panel](images/problems-panel.png)

- the problem entry

  ![Finding Problem](images/finding-problem.png)

- finding details actions

  ![Finding Actions - Menu](images/finding-actions-menu.png)

  ![Finding Actions - Quick Pick](images/finding-actions-quick-pick.png)

  ![Finding Details](images/finding-detail.png)


## MCP integration

ZEN SecDB automatically configure the [ZEN SecDB MCP server][zen_secdb_mcp_server] inside VS Code.

  ![MCP Tools](images/mcp-tools.png)

This is useful as a foundation for future MCP-driven workflows and server-side prompt integrations.

At the moment, the extension focuses on:

- MCP server configuration
- MCP-related actions from VS Code

For more information, please refer to the [MCP Server][zen_secdb_mcp_doc] documentation on the [ZEN SecDB Portal][zen_secdb].

## Chat integration

ZEN SecDB currently supports two chat-oriented workflows:

### Analyze

The extension can open the VS Code chat with a prefilled prompt based on the selected finding, so you can analyze it with the currently selected model using the tools exposed by ZEN SecDB MCP Server.

### Chat participant

A chat participant (`@secdb`) is available for info workflows, allowing structured retrieval of finding details from inside chat.

![Chat Partecipant](images/chat-partecipant.png)

## Troubleshooting

**No dependencies detected**

Check that:
- the workspace contains supported dependency files
- the files are not excluded by your workspace layout
- versions can be resolved from the detected files

**No findings are shown after audit**

Check that:
- the ZEN SecDB API service is reachable
- the detected dependencies produced valid PURLs
- the ZEN SecDB instance contains matching advisory data

**MCP server is visible but not behaving as expected**

Check that:
- the ZEN SecDB MCP server is correctly registered in VS Code
- the server can start successfully
- the expected tools are exposed by the server

## Privacy and security

This extension may send dependency metadata such as package names, versions, and PURLs to ZEN SecDB Portal.

Before using the extension in sensitive environments, review:
- what dependency metadata is sent
- how your MCP and chat workflows are configured
- whether your environment requires stricter controls for external services

## Roadmap

Planned or possible future improvements include:
- support for additional ecosystems
- richer advisory details views
- deeper MCP-assisted investigation workflows
- MCP server-side prompt workflows
- expanded chat participant capabilities

## Development

**Run locally**

1. Clone the repository
2. Install dependencies
3. Open the project in VS Code
4. Press `F5` to launch an Extension Development Host

**Build**

```bash
npm install
npm run compile
```

**Watch mode**

```bash
npm run watch
```

## ZEN SecDB Portal

- Daily Dashboard: https://secdb.nttzen.cloud
- Vulnerabilities: https://secdb.nttzen.cloud/cve
- Advisories: https://secdb.nttzen.cloud/security-advisory
- Utility:
  - PURL Audit: https://secdb.nttzen.cloud/pkg/audit/purl
  - Linux Audit: https://secdb.nttzen.cloud/pkg/audit/linux
  - CVSS Calculator: https://secdb.nttzen.cloud/cvss
- Documentations & Integrations: https://secdb.nttzen.cloud/docs
- API
  - URL: https://secdb.nttzen.cloud/api/v1
  - Documentation: https://secdb.nttzen.cloud/docs/api/openapi
- MCP Server:
  - Server URL: https://secdb.nttzen.cloud/mcp
  - Documentation: https://secdb.nttzen.cloud/docs/integrations/mcp
- Social:
  - Telegram Bot: https://t.me/secdbportal_bot
  - Telegram Channel: https://t.me/secdbportal_feed
  - Mastodon: https://infosec.exchange/@secdb
- About: https://secdb.nttzen.cloud/about

## License
MIT, See [LICENSE](LICENSE.txt) for more information.

<!-- Badges -->
[version_badge]: https://img.shields.io/github/v/release/giterlizzi/secdb-vscode?include_prereleases&style=flat-square
[version_link]: https://github.com/giterlizzi/secdb-vscode/releases/latest
[downloads_badge]: https://img.shields.io/visual-studio-marketplace/d/gdt.zen-secdb?style=flat-square
[installs_badge]: https://img.shields.io/visual-studio-marketplace/i/gdt.zen-secdb?style=flat-square
[workflow_status_badge]: https://img.shields.io/github/actions/workflow/status/giterlizzi/secdb-vscode/build.yml?style=flat-square
[workflow_status_link]: https://github.com/giterlizzi/secdb-vscode/actions
[license_badge]: https://img.shields.io/github/license/giterlizzi/secdb-vscode?style=flat-square
[openvsx_downloads_badge]: https://img.shields.io/open-vsx/dt/gdt/zen-secdb?color=purple&label=Open%20VSX%20Downloads&style=flat-square

<!-- Links -->
[zen_secdb]: https://secdb.nttzen.cloud
[zen_secdb_mcp_server]: https://secdb.nttzen.cloud/mcp
[zen_secdb_mcp_doc]: https://secdb.nttzen.cloud/docs/integrations/mcp
[vscode]: https://code.visualstudio.com
[marketplace]: https://marketplace.visualstudio.com/items?itemName=gdt.zen-secdb
[openvsx]: https://open-vsx.org/extension/gdt/zen-secdb
[releases]: https://github.com/giterlizzi/secdb-vscode/releases
[changelog]: CHANGELOG.md
[license]: LICENSE.txt
