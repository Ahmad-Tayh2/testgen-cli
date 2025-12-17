# TestGen CLI

AI-powered test generation for PHP, JavaScript, and TypeScript. Generate comprehensive unit tests with a single command.

[![npm version](https://badge.fury.io/js/testgen-cli.svg)](https://www.npmjs.com/package/testgen-cli)
[![License](https://img.shields.io/badge/License-Elastic%202.0-blue.svg)](LICENSE)

![Demo](demo.gif)

---

## ✨ No Login Required - Start Generating Tests Instantly!

You can now generate tests **without creating an account or logging in**. Just install and start testing!

---

## Quick Start

```bash
# 1. Install globally
npm install -g testgen-cli

# 2. Generate tests (no login required!)
testgen generate src/your-file.js
```

**That's it!** Start generating tests immediately without any authentication.

**Want early access to premium features?** → [Create an account](https://testorix.dev/register)

---

## Features

- 🤖 **AI-Powered** - Generates intelligent test cases with edge cases
- 🌐 **Multi-Language** - PHP (PHPUnit/Pest), JavaScript (Jest), TypeScript (Jest)
- ⚡ **Fast** - Tests generated in seconds
- 🎨 **Review Before Save** - See a diff and approve changes
- 📊 **Smart Output** - Clean minimal mode, verbose mode with `--verbose`

---

## Installation Options

### Option 1: Global (Recommended)

Install once, use in any project - **no login required**:

```bash
npm install -g testgen-cli
```

Now you can use `testgen` anywhere:

```bash
cd ~/my-project
testgen generate src/api/users.js

cd ~/another-project
testgen generate app/Models/User.php
```

### Option 2: Project-Specific

Install in your project as a dev dependency:

```bash
npm install --save-dev testgen-cli
```

Use with npx:

```bash
npx testgen generate src/components/Button.tsx
```

Or add to your `package.json`:

```json
{
  "scripts": {
    "test:generate": "testgen generate"
  }
}
```

```bash
npm run test:generate src/utils/helpers.js
```

### Option 3: Run Without Installing (Instant Start!)

```bash
npx testgen generate src/your-file.ts
```

> Note: First run downloads the package temporarily - **no account needed!**

---

## Usage Examples

### Generate Test for PHP File

```bash
testgen generate app/Services/PaymentService.php
```

**Output:** `tests/Unit/Services/PaymentServiceTest.php`

### Generate Test for JavaScript File

```bash
testgen generate src/utils/formatters.js
```

**Output:** `src/utils/formatters.test.js`

### Generate Test for TypeScript File

```bash
testgen generate src/hooks/useAuth.ts
```

**Output:** `src/hooks/useAuth.test.ts`

### Custom Output Location

```bash
testgen generate src/api.js --output tests/integration/api.test.js
```

### See Detailed Generation Info

```bash
testgen generate src/calculator.ts --verbose
```

---

## Commands

```bash
testgen generate <file>    # Generate test for a file (no login required!)
testgen login              # (Optional) Login for premium features
testgen status             # Check your usage quota (requires login)
testgen --help             # Show help
testgen --version          # Show version
```

### Generate Command Options

```bash
testgen generate <file> [options]

Options:
  -o, --output <path>    Custom output path for test file
  -v, --verbose          Show detailed generation information
```

---

## Supported Languages

| Language   | Test Framework | File Extensions | Output Location               |
| ---------- | -------------- | --------------- | ----------------------------- |
| PHP        | PHPUnit, Pest  | `.php`          | `tests/Unit/YourFileTest.php` |
| JavaScript | Jest           | `.js`, `.jsx`   | `your-file.test.js`           |
| TypeScript | Jest           | `.ts`, `.tsx`   | `your-file.test.ts`           |

**Limits:**

- File size: 0.5MB max
- Without login: Limited tests (managed by backend)
- With free account: 10 tests per month
- Premium: Early access to premium features

---

## Common Issues

### "Authentication failed"

This only happens if you're logged in. Run login again:

```bash
testgen login
```

Or simply use without login - no authentication required!

### "Monthly limit reached"

You've used your quota. [Create an account](https://testorix.dev/register) or [join waitlist](https://testorix.dev/#beta) for more.

### "Command not found: testgen"

If globally installed but command not found:

```bash
npm install -g testgen-cli
```

Or use without installing:

```bash
npx testgen-cli generate src/file.js
```

### "File too large"

Maximum file size is 0.5MB. Split large files into smaller modules.

---

## What You Get

✅ Comprehensive test coverage
✅ Smart assertions and edge cases
✅ Framework-specific best practices
✅ Mocking and dependency injection
✅ Tests that actually run
✅ **No login required** - Start testing immediately!

**Anonymous usage:** Limited tests (backend-managed)
**Free account:** 10 tests/month
**Premium:** Early access to premium features - [Join the waitlist](https://testorix.dev/#beta)

---

## Links

- **Create Account:** [testorix.dev/register](https://testorix.dev/register)
- **npm Package:** [npmjs.com/package/testgen-cli](https://www.npmjs.com/package/testgen-cli)
- **GitHub:** [github.com/Ahmad-Tayh2/testgen-cli](https://github.com/Ahmad-Tayh2/testgen-cli)
- **Report Issues:** [github.com/Ahmad-Tayh2/testgen-cli/issues](https://github.com/Ahmad-Tayh2/testgen-cli/issues)

---

**License:** [Elastic License 2.0](LICENSE)
