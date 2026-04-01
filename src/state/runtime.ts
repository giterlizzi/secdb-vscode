import { Finding, Package } from './../types';

class RuntimeState {

  extensionVersion = '0.0.0';
  clientId = 'SecDB-VSCode/0.0.0';

  private findings = new Map<string, Finding>();
  private packages: Package[] = [];

  clearFindings(): void {
    this.findings.clear();
  }

  putFinding(key: string, f: Finding): void {
    this.findings.set(key, f);
  }

  getFinding(key: string): Finding | undefined {
    return this.findings.get(key);
  }

  setPackages(packages: Package[]): void {
    this.packages = packages;
  }

  getPackages(): Package[] {
    return this.packages;
  }

};

export const runtimeState = new RuntimeState();
