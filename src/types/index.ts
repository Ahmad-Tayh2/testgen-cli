export interface Config {
  apiKey: string;
  email: string;
  apiUrl?: string;
}

export interface ApiResponse {
  success: boolean;
  test_code?: string;
  test_file_name?: string;
  remaining_requests?: number;
  error?: string;
  message?: string;
  limit?: number;
  used?: number;
  reset_date?: string;
}

export interface UsageStats {
  total_tests_generated: number;
  failed_generations: number;
  last_request_at: string | null;
  usage_by_language: Record<string, number>;
  monthly_limit: number;
  monthly_used: number;
  remaining_requests: number;
  is_premium: boolean;
  reset_date: string | null;
}

export interface LoginResponse {
  api_key: string;
  email: string;
  name: string;
}
