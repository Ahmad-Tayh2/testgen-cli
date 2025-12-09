# TestGen CLI

AI-powered test generation for your codebase. Generate comprehensive unit tests for PHP, JavaScript, and TypeScript with a single command.

[![npm version](https://badge.fury.io/js/%40testgen%2Fcli.svg)](https://www.npmjs.com/package/@testgen/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🤖 **AI-Powered**: Leverages advanced LLMs to generate intelligent test cases
- 🌐 **Multi-Language**: Supports PHP (PHPUnit), JavaScript (Jest), and TypeScript (Jest)
- ⚡ **Fast**: Generates tests in seconds
- 📝 **Comprehensive**: Creates thorough test coverage with edge cases
- 🎨 **Review & Edit**: Shows diff before saving, allowing you to review and edit

## Installation

```bash
npm install -g @testgen/cli
```

## Quick Start

1. **Login to your account:**

```bash
testgen login
```

2. **Generate tests for a file:**

```bash
# PHP
testgen generate src/UserService.php

# JavaScript
testgen generate src/utils/helpers.js

# TypeScript
testgen generate src/components/Button.tsx
```

3. **Check your usage:**

```bash
testgen status
```

## Commands

### `testgen login`

Authenticate with your TestGen account. You'll need to provide your email and password.

```bash
testgen login
```

### `testgen generate <file>`

Generate unit tests for a file. The language and test framework are automatically detected from the file extension.

```bash
testgen generate src/UserService.php
testgen generate src/utils/helpers.js
testgen generate src/components/Button.tsx
```

**Options:**
- File must exist and be readable
- Supported extensions: `.php`, `.js`, `.ts`, `.jsx`, `.tsx`
- Maximum file size: 5MB

### `testgen status`

View your account usage statistics and remaining requests.

```bash
testgen status
```

Shows:
- Requests used this month
- Requests remaining
- Account tier
- Next reset date

## Supported Languages & Frameworks

| Language   | Test Framework | File Extensions        |
|------------|----------------|------------------------|
| PHP        | PHPUnit        | `.php`                 |
| JavaScript | Jest           | `.js`, `.jsx`          |
| TypeScript | Jest           | `.ts`, `.tsx`          |

## Configuration

### Environment Variables

- `TESTGEN_API_URL`: API endpoint (default: `http://localhost:8000/api`)

For production:
```bash
export TESTGEN_API_URL=https://api.testgen.dev/api
```

See [.env.example](.env.example) for more details.

### Config File

Authentication tokens and preferences are stored in:
```
~/.testgen/config.json
```

This file is automatically created and managed by the CLI.

## Examples

### Generate tests for a PHP service

```bash
testgen generate app/Services/UserService.php
```

Output:
```
tests/Unit/Services/UserServiceTest.php
```

### Generate tests for a TypeScript utility

```bash
testgen generate src/utils/validators.ts
```

Output:
```
src/utils/__tests__/validators.test.ts
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

### Quick Start for Development

```bash
# Clone the repository
git clone https://github.com/Ahmad-Tayh2/testgen-cli.git
cd testgen-cli

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link

# Use locally
testgen --help
```

## Troubleshooting

### "Failed to connect to API"

1. Check if `TESTGEN_API_URL` is set correctly
2. Verify the API is running and accessible
3. Check your internet connection

### "Authentication failed"

1. Run `testgen login` again
2. Ensure your credentials are correct
3. Check if your account is active

### "File too large"

The maximum file size is 5MB. Consider breaking down large files into smaller modules.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)

## Support

- 🐛 [Report bugs](https://github.com/Ahmad-Tayh2/testgen-cli/issues)
- 💡 [Request features](https://github.com/Ahmad-Tayh2/testgen-cli/issues)
- 📖 [Documentation](https://github.com/Ahmad-Tayh2/testgen-cli#readme)

## Links

- [npm Package](https://www.npmjs.com/package/@testgen/cli)
- [GitHub Repository](https://github.com/Ahmad-Tayh2/testgen-cli)
- [Issue Tracker](https://github.com/Ahmad-Tayh2/testgen-cli/issues)

---

Made with ❤️ by the TestGen team
