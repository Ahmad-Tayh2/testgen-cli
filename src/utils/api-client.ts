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
    project_context?: {
      framework?: string;
      test_framework?: string;
      project_root: string;
      test_directory?: string;
      dependencies?: string[];
      file_imports?: string[];
      naming_convention?: 'camelCase' | 'snake_case' | 'PascalCase';
    };
  }): Promise<{
    success: boolean;
    test_code?: string;
    test_file_name?: string;
    remaining_requests?: number;
    generation_id?: number;
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

  async submitFeedback(data: {
    generation_id?: number;
    question_type: 'immediate' | 'problem' | 'retention';
    was_useful?: boolean;
    problem_category?: number;
    would_use_again?: boolean;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        config.api.endpoints.feedback,
        data
      );
      return response.data;
    } catch (error) {
      // Fail silently
      return null;
    }
  }

  async getFeedbackStatus(): Promise<{
    has_answered_retention: boolean;
    total_generations: number;
    can_ask_retention: boolean;
  } | null> {
    try {
      const response = await this.client.get(
        config.api.endpoints.feedbackStatus
      );
      return response.data;
    } catch (error) {
      // Fail silently
      return null;
    }
  }
}
