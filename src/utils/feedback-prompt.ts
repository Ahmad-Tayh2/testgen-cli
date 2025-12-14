import prompts from 'prompts';
import { ApiClient } from './api-client';
import { Config } from './config';

/**
 * Check if the retention question should be asked and ask it if eligible
 * This is called before command execution (except for skip commands)
 */
export async function checkAndAskRetentionQuestion(
  skipCommands: string[] = []
): Promise<void> {
  try {
    // Load config
    const config = Config.load();
    if (!config?.apiKey) {
      return; // Not logged in
    }

    // Check if already answered (cached locally)
    if (config.retentionQuestionAnswered) {
      return;
    }

    // Call API to check status
    const apiClient = new ApiClient(config.apiKey);
    const status = await apiClient.getFeedbackStatus();

    if (!status) {
      return; // API call failed, fail silently
    }

    // Check if user is eligible for retention question
    if (!status.can_ask_retention || status.has_answered_retention) {
      // Update local cache to avoid future API calls
      if (status.has_answered_retention) {
        Config.save({ ...config, retentionQuestionAnswered: true });
      }
      return;
    }

    // Ask retention question (Q3)
    console.log(); // Add spacing
    const response = await prompts(
      {
        type: 'text',
        name: 'answer',
        message:
          'If TestGen produced better tests, would you use it again? (y/n) [Enter to skip]',
        initial: '',
      },
      {
        onCancel: () => {
          return { answer: '' };
        },
      }
    );

    const answer = response.answer?.toLowerCase().trim();

    if (answer === 'y' || answer === 'n') {
      // Submit feedback
      await apiClient.submitFeedback({
        question_type: 'retention',
        would_use_again: answer === 'y',
      });
    }

    // Update local config to mark as answered (even if skipped)
    Config.save({ ...config, retentionQuestionAnswered: true });
  } catch (error) {
    // Fail silently - never block CLI
  }
}

/**
 * Ask immediate feedback after test generation (Q1 and Q2)
 */
export async function askImmediateFeedback(
  generationId: number,
  apiKey: string
): Promise<void> {
  try {
    console.log(); // Add spacing

    // Question #1: Was this output useful?
    const q1Response = await prompts(
      {
        type: 'text',
        name: 'useful',
        message: 'Was this output useful? (y/n) [Enter to skip]',
        initial: '',
      },
      {
        onCancel: () => {
          return { useful: '' };
        },
      }
    );

    const useful = q1Response.useful?.toLowerCase().trim();

    if (!useful) {
      return; // User skipped
    }

    const apiClient = new ApiClient(apiKey);

    if (useful === 'y') {
      // Submit positive feedback
      await apiClient.submitFeedback({
        generation_id: generationId,
        question_type: 'immediate',
        was_useful: true,
      });
      return;
    }

    if (useful === 'n') {
      // Ask Question #2: What was the main problem?
      const q2Response = await prompts(
        {
          type: 'select',
          name: 'problem',
          message: 'What was the main problem?',
          choices: [
            { title: "Tests don't run", value: 1 },
            { title: 'Logic is wrong', value: 2 },
            { title: 'Missing imports/setup', value: 3 },
            { title: 'Hard to understand', value: 4 },
            { title: 'Other', value: 5 },
          ],
          initial: 0,
        },
        {
          onCancel: () => {
            return { problem: null };
          },
        }
      );

      if (q2Response.problem !== null && q2Response.problem !== undefined) {
        // Submit problem feedback
        await apiClient.submitFeedback({
          generation_id: generationId,
          question_type: 'problem',
          problem_category: q2Response.problem,
        });
      }
    }
  } catch (error) {
    // Fail silently - never block CLI
  }
}
