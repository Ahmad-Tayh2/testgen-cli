import chalk from 'chalk';
import ora from 'ora';
import { ApiClient } from '../utils/api-client';
import { Config } from '../utils/config';

export async function statusCommand(): Promise<void> {
  try {
    // Load config (optional for authentication)
    const config = Config.load();

    const spinner = ora('Fetching usage statistics...').start();
    const apiClient = new ApiClient(config?.apiKey);

    try {
      const stats = await apiClient.getUsageStats();
      spinner.succeed('Usage statistics');

      console.log();
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.cyan.bold('  TestGen Usage Statistics'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();

      // Account info
      if (config?.email) {
        console.log(chalk.bold('Account:'), config.email);
      }
      if (stats.is_premium) {
        console.log(chalk.bold('Plan:'), chalk.green('Premium ✨'));
      } else {
        console.log(chalk.bold('Plan:'), chalk.gray('Free'));
      }
      console.log();

      // Usage stats
      console.log(
        chalk.bold('Total Tests Generated:'),
        chalk.green(stats.total_tests_generated)
      );
      if (stats.failed_generations > 0) {
        console.log(
          chalk.bold('Failed Generations:'),
          chalk.red(stats.failed_generations)
        );
      }
      console.log();

      // Monthly quota
      if (!stats.is_premium) {
        const percentage = (stats.monthly_used / stats.monthly_limit) * 100;
        const remaining = stats.remaining_requests;

        console.log(chalk.bold('Monthly Quota:'));
        console.log(
          chalk.gray('  Used:'),
          `${stats.monthly_used}/${stats.monthly_limit}`
        );
        console.log(
          chalk.gray('  Remaining:'),
          chalk[remaining <= 5 ? 'yellow' : 'green'](remaining)
        );

        // Progress bar
        const barLength = 30;
        const filled = Math.round((percentage / 100) * barLength);
        const empty = barLength - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        console.log(
          chalk.gray('  Progress:'),
          bar,
          `${percentage.toFixed(1)}%`
        );

        if (stats.reset_date) {
          const resetDate = new Date(stats.reset_date);
          console.log(chalk.gray('  Resets:'), resetDate.toLocaleDateString());
        }
        console.log();

        if (remaining <= 5) {
          console.log(chalk.yellow('⚠ Running low on requests!'));
          console.log(chalk.gray('  Upgrade to premium for unlimited access'));
          console.log();
        }
      } else {
        console.log(chalk.green('✓ Unlimited test generation'));
        console.log();
      }

      // Language breakdown
      if (Object.keys(stats.usage_by_language).length > 0) {
        console.log(chalk.bold('Tests by Language:'));
        Object.entries(stats.usage_by_language).forEach(([lang, count]) => {
          console.log(chalk.gray(`  ${lang.toUpperCase()}:`), count);
        });
        console.log();
      }

      // Last activity
      if (stats.last_request_at) {
        const lastRequest = new Date(stats.last_request_at);
        console.log(chalk.bold('Last Activity:'), lastRequest.toLocaleString());
        console.log();
      }

      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    } catch (error: any) {
      spinner.fail('Failed to fetch statistics');

      // Check if it's an invalid API key error
      if (
        error.response?.status === 401 ||
        error.message?.includes('Invalid API key, try logging in again')
      ) {
        console.log(chalk.yellow('\n⚠ Authentication failed\n'));
        console.log(
          chalk.gray(
            'Your session may have expired or your API key is invalid.'
          )
        );
        console.log(
          chalk.gray('Please login again:'),
          chalk.cyan('testgen login')
        );
        console.log(
          chalk.gray('Or register at:'),
          chalk.cyan.underline('https://testorix.dev/register')
        );
        console.log();
      } else if (error.response?.data?.error) {
        console.error(chalk.red('Error:'), error.response.data.error);
      } else {
        console.error(chalk.red('Error:'), error.message);
      }
      process.exit(1);
    }
  } catch (error: any) {
    console.error(chalk.red('✗'), error.message);
    process.exit(1);
  }
}
