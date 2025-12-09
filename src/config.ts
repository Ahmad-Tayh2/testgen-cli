/**
 * CLI Configuration
 * Centralized configuration for API endpoints
 */

export const config = {
  /**
   * API Configuration
   * Defaults to production API
   * Set TESTGEN_API_URL environment variable to override
   */
  api: {
    baseUrl: process.env.TESTGEN_API_URL || 'https://api.testgen.io/api',
    endpoints: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      generate: '/generate-test',
      usage: '/usage',
      user: '/user',
      health: '/health',
    },
  },

  /**
   * CLI Settings
   */
  app: {
    name: 'TestGen',
    version: '1.0.0',
  },

  /**
   * File Validation
   */
  validation: {
    maxFileSize: 0.5 * 1024 * 1024, // 0.5MB
    supportedExtensions: ['.php', '.js', '.ts', '.jsx', '.tsx'],
  },
};

/**
 * Helper function to build full API URLs
 */
export function getApiUrl(endpoint: keyof typeof config.api.endpoints): string {
  // Remove /api suffix from baseUrl if endpoint already includes it
  const baseUrl = config.api.baseUrl.replace(/\/api$/, '');
  return `${baseUrl}${config.api.endpoints[endpoint]}`;
}
