import * as vscode from 'vscode';

class SecretState {

    private secrets?: vscode.SecretStorage;

    init(secrets: vscode.SecretStorage): void {
        this.secrets = secrets;
    }

    async setApiKey(apiKey: string): Promise<void> {
        if (!this.secrets) throw new Error('SecretState not initialized');
        await this.secrets.store('secdb.apiKey', apiKey);
    }

    async getApiKey(): Promise<any> {
        if (!this.secrets) throw new Error('SecretState not initialized');
        return this.secrets.get('secdb.apiKey');
    }

    async clearApiKey(): Promise<void> {
        if (!this.secrets) throw new Error('SecretState not initialized');
        await this.secrets.delete('secdb.apiKey');
    }

}

export const secretState = new SecretState();
