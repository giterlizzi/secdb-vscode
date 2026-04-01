import * as vscode from 'vscode';
import * as path from 'path';
import { runtimeState } from '../state/runtime';
import { Package } from '../types';
import { Commands } from '../constants';

type DependencyNode = DependencyFileNode | DependencyItemNode;
type DependencyTypeFilter = 'all' | 'direct' | 'transitive';

class DependencyFileNode extends vscode.TreeItem {
  constructor(
    public readonly filePath: string,
    public readonly count: number
  ) {
    super(`${path.basename(filePath)} (${count})`, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = filePath;
    this.contextValue = 'secdbDependencyFile';
    this.iconPath = new vscode.ThemeIcon('package');
  }
}

class DependencyItemNode extends vscode.TreeItem {
  constructor(public readonly pkg: Package) {

    super(`${pkg.name} ${pkg.version}`, vscode.TreeItemCollapsibleState.None);

    const advisoryCount = pkg.totalAdvisories ?? 0;

    this.description = (advisoryCount > 0) ? `${pkg.ecosystem} [${advisoryCount}]` : pkg.ecosystem;

    this.tooltip = new vscode.MarkdownString(
      [
        `**Name:** ${pkg.name}`,
        `**Version:** ${pkg.version}`,
        `**Ecosystem:** ${pkg.ecosystem}`,
        `**Dependency Type:** ${pkg.dependencyType ?? 'unknown'}`,
        `**PURL:** \`${pkg.purl}\``,
        `**File:** ${pkg.file}`,
        (advisoryCount > 0) ? `**Advisories:** ${advisoryCount}` : undefined
      ].join('\n\n')
    );

    this.contextValue = 'secdbDependencyItem';

    this.iconPath = advisoryCount > 0
      ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('problemsWarningIcon.foreground'))
      : new vscode.ThemeIcon('info', new vscode.ThemeColor('descriptionForeground'));

    this.command = {
      command: Commands.OpenDependency,
      title: 'Open Dependency',
      arguments: [pkg]
    };

  }
}

export class SecDBDependenciesProvider implements vscode.TreeDataProvider<DependencyNode> {

  private _onDidChangeTreeData = new vscode.EventEmitter<DependencyNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private dependencyTypeFilter: DependencyTypeFilter = 'all';

  setDependencyTypeFilter(filter: DependencyTypeFilter) {
    this.dependencyTypeFilter = filter;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: DependencyNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DependencyNode): DependencyNode[] {

    let packages = runtimeState.getPackages();

    if (this.dependencyTypeFilter !== 'all') {
      packages = packages.filter(pkg => pkg.dependencyType === this.dependencyTypeFilter);
    }

    if (!element) {

      const files = new Map<string, Package[]>();

      for (const pkg of packages) {
        const pkgs = files.get(pkg.file) ?? [];
        pkgs.push(pkg);
        files.set(pkg.file, pkgs);
      }

      return [...files.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([file, pkgs]) => new DependencyFileNode(file, pkgs.length));

    }

    if (element instanceof DependencyFileNode) {
      return packages
        .filter(pkg => pkg.file === element.filePath)
        .sort((a, b) => {
          const av = b.totalAdvisories ?? 0;
          const bv = a.totalAdvisories ?? 0;
          if (av !== bv) return av - bv;
          return a.name.localeCompare(b.name);
        })
        .map(pkg => new DependencyItemNode(pkg));
    }

    return [];
  }
}

export function registerDependenciesProvider(context: vscode.ExtensionContext, dependenciesProvider: vscode.TreeDataProvider<DependencyNode>) {
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('secdbDependenciesView', dependenciesProvider)
  );
}