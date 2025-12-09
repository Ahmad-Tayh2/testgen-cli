import fs from 'fs';
import os from 'os';
import path from 'path';

interface ConfigData {
  apiKey?: string;
  email?: string;
  apiUrl?: string;
}

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config: Record<string, any>;

  constructor() {
    this.configDir = path.join(os.homedir(), '.testgen');
    this.configPath = path.join(this.configDir, 'config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): Record<string, any> {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      // If config is corrupted, start fresh
    }
    return {};
  }

  static load(): ConfigData | null {
    const configDir = path.join(os.homedir(), '.testgen');
    const configPath = path.join(configDir, 'config.json');
    try {
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  static save(config: ConfigData): void {
    const configDir = path.join(os.homedir(), '.testgen');
    const configPath = path.join(configDir, 'config.json');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  private save(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(this.config, null, 2),
      'utf-8'
    );
  }

  public get(key: string): any {
    return this.config[key];
  }

  public set(key: string, value: any): void {
    this.config[key] = value;
    this.save();
  }

  public getAll(): Record<string, any> {
    return { ...this.config };
  }

  public clear(): void {
    this.config = {};
    this.save();
  }

  public getConfigPath(): string {
    return this.configPath;
  }
}

export const Config = ConfigManager;
