export const FINDING_MAX_DESCRIPTION_LENGTH = 512;

export const GO_EXCLUDE = '**/{vendor,node_modules,dist,build,.git}/**';
export const NPM_EXCLUDE = '**/{node_modules,dist,build,.next,coverage,out,tmp,.git}/**';
export const PYTHON_EXCLUDE = '**/{.venv,venv,env,site-packages,dist,build,.git,__pycache__}/**';
export const RUBY_EXCLUDE = '**/{vendor/bundle,.bundle,dist,build,.git}/**';

export const ExcludeDirGlobs = {
    GO: GO_EXCLUDE,
    NPM: NPM_EXCLUDE,
    PYTHON: PYTHON_EXCLUDE,
    RUBY: RUBY_EXCLUDE
} as const;

export const SPEC_DEPENDENCY_REGEX = /^\s{4}([A-Za-z0-9_\-.]+)\s\(([^)]+)\)$/;
export const CHILD_DEPENDENCY_REGEX = /^\s{6}([A-Za-z0-9_\-.]+)\s\(([^)]+)\)$/;

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

