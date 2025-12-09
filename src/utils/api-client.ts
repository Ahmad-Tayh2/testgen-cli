import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.baseURL = config.api.baseUrl;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<{ api_key: string; email: string }> {
    const response = await this.client.post(config.api.endpoints.login, {
      email,
      password,
    });
    return response.data;
  }

  async generateTest(data: {
    file_content: string;
    file_name: string;
    language?: string;
  }): Promise<{
    success: boolean;
    test_code?: string;
    test_file_name?: string;
    remaining_requests?: number;
    error?: string;
    message?: string;
    limit?: number;
    used?: number;
    reset_date?: string;
  }> {
    const response = await this.client.post(
      config.api.endpoints.generate,
      data
    );
    return response.data;
  }

  async getUsageStats(): Promise<{
    total_tests_generated: number;
    failed_generations: number;
    last_request_at: string | null;
    usage_by_language: Record<string, number>;
    monthly_limit: number;
    monthly_used: number;
    remaining_requests: number;
    is_premium: boolean;
    reset_date: string | null;
  }> {
    const response = await this.client.get(config.api.endpoints.usage);
    return response.data;
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ api_key: string; email: string; name: string }> {
    const response = await this.client.post(config.api.endpoints.register, {
      name,
      email,
      password,
    });
    return response.data;
  }
}
