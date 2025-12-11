# TestGen CLI

> AI-powered test generation for your codebase. Generate comprehensive unit tests for PHP, JavaScript, and TypeScript with a single command.

[![npm version](https://badge.fury.io/js/testgen-cli.svg)](https://www.npmjs.com/package/testgen-cli)
[![License](https://img.shields.io/badge/License-Elastic%202.0-blue.svg)](LICENSE)

---

## 🚧 TestGen API is Activating...

**You're one of the first early users** — the full service launches in **<48 hours**.

The CLI is ready to install, but test generation will be available once our API backend goes live. We're working around the clock to get everything online!

**What's happening:**
- ✅ CLI package is published and ready
- ⏳ API backend launching within 48 hours
- 🎯 Full test generation will work automatically once live

**Stay updated:** Follow progress at [https://testorix.dev](https://testorix.dev)

Thank you for being an early supporter! 🙏

---

![Demo](demo.gif)

## Features

- 🤖 **AI-Powered**: Leverages advanced LLMs to generate intelligent test cases
- 🌐 **Multi-Language**: Supports PHP (PHPUnit), JavaScript (Jest), and TypeScript (Jest)
- ⚡ **Fast**: Generates tests in seconds
- 📝 **Comprehensive**: Creates thorough test coverage with edge cases
- 🎨 **Review & Edit**: Shows diff before saving, allowing you to review and edit

## Installation

```bash
npm install -g testgen-cli
```

## Getting Started

### 1. Create an Account

Don't have an account yet? Register at:

👉 **[https://testorix.dev/register](https://testorix.dev/register)**

You'll receive your login credentials to use with the CLI.

### 2. Login

Once you have an account, authenticate with the CLI:

```bash
testgen login
```

Enter your email and password when prompted.

## Quick Start

1. **Generate tests for a file:**

```bash
# PHP
testgen generate src/UserService.php

# JavaScript
testgen generate src/utils/helpers.js

# TypeScript
testgen generate src/components/Button.tsx
```

2. **Check your usage:**

```bash
testgen status
```

## Supported Languages & Frameworks

| Language   | Test Framework | File Extensions |
| ---------- | -------------- | --------------- |
| PHP        | PHPUnit        | `.php`          |
| JavaScript | Jest           | `.js`, `.jsx`   |
| TypeScript | Jest           | `.ts`, `.tsx`   |

### Config File

Authentication tokens and preferences are stored in:

```
~/.testgen/config.json
```

This file is automatically created and managed by the CLI.

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

- [npm Package](https://www.npmjs.com/package/testgen-cli)
- [GitHub Repository](https://github.com/Ahmad-Tayh2/testgen-cli)
- [Issue Tracker](https://github.com/Ahmad-Tayh2/testgen-cli/issues)

---

Made with ❤️ by the TestGen team
