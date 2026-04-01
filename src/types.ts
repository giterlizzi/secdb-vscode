export interface Finding {
    package: Package
    advisory: string;
    severity?: string;
    title: string;
    description?: string;
    summary?: string;
    cves: Array<string>;
    url: string;
}

export interface AuditAdvisory {
  id: string;
  title?: string;
  severity?: string;
  cves?: string[];
  url?: string;
  description?: string;
  summary?: string;
  cvss?: Array<{ base_score?: number; base_severity?: string }>;
}

export interface AuditResult {
  package: string;
  advisories: AuditAdvisory[];
  cves?: string[];
}


export interface Package {
    ecosystem: string;
    name: string;
    version: string;
    purl: string;
    file: string;
    line?: number;
    totalAdvisories?: number;
    isVulnerable?: boolean;
    dependencyType?: string;
}

export interface PackageJSON {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

export interface PackageLockV2 {
    packages?: Record<string, { version?: string }>;
}

export interface PackageLockV1 {
    dependencies?: Record<string, { version?: string }>;
}
