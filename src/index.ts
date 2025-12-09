#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { generateCommand } from './commands/generate';
import { loginCommand } from './commands/login';
import { statusCommand } from './commands/status';

const program = new Command();

program
  .name('testgen')
  .description('AI-powered test generation CLI')
  .version('0.1.0');

program
  .command('login')
  .description('Authenticate with your TestGen account')
  .action(loginCommand);

program
  .command('generate <file>')
  .description('Generate unit tests for a file')
  .action(generateCommand);

program
  .command('status')
  .description('Show your account usage and remaining quota')
  .action(statusCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
