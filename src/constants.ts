export const FINDING_MAX_DESCRIPTION_LENGTH = 512;

export const GO_EXCLUDE = '**/{vendor,node_modules,dist,build,.git}/**';
export const NPM_EXCLUDE = '**/{node_modules,dist,build,.next,coverage,out,tmp,.git}/**';
export const PYTHON_EXCLUDE = '**/{.venv,venv,env,site-packages,dist,build,.git,__pycache__}/**';

export const Commands = {
    ScanDependencies: 'secdb.dependencies.scan',
    AuditDependencies: 'secdb.dependencies.audit',

    OpenDependency: 'secdb.dependency.open',

    ApiKeyActions: 'secdb.apiKey.actions',
    McpActions: 'secdb.mcp.actions',
    FindingActions: 'secdb.finding.actions',

    DependenciesFilterAll: 'secdb.dependencies.filter.all',
    DependenciesFilterDirect: 'secdb.dependencies.filter.direct',
    DependenciesFilterTransitive: 'secdb.dependencies.filter.transitive',
} as const;

