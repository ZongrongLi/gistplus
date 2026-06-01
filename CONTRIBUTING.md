# Contributing to Gist Plus

We love your input! We want to make contributing to Gist Plus as easy and transparent as possible.

## 🤝 Ways to Contribute

- Report bugs
- Propose new features
- Improve documentation
- Submit code improvements
- Build integrations and examples

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI 1.16+
- Anchor 0.29+
- Python 3.10+ (for Python packages)

### Setup

```bash
# Clone the repo
git clone https://github.com/gistplusxyz/gistplus.git
cd gistplus

# Install dependencies
npm install

# Build all packages
npm run build

# Run all tests
npm test
```

## 📦 Project Structure

```
CORE/
├── packages/
│   ├── core/          # Protocol schemas and types
│   ├── client/        # Client SDK
│   ├── server/        # Server middleware
│   ├── solana/        # Solana programs
│   ├── gateway/       # Verification gateway
│   └── indexer/       # Analytics indexer
├── examples/          # Working examples
└── docs/              # Documentation
```

## 🔨 Making Changes

### 1. Fork and Create a Branch

```bash
git checkout -b feature/my-new-feature
```

### 2. Make Your Changes

- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific package tests
cd packages/core/typescript
npm test

# Test Solana programs
cd packages/solana
anchor test
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add amazing new feature"
git push origin feature/my-new-feature
```

### 5. Create a Pull Request

- Describe your changes
- Link related issues
- Add screenshots if applicable

## 📝 Code Style

### TypeScript

- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs

```typescript
/**
 * Create a new Intent
 * 
 * @param options - Intent creation options
 * @returns Intent object
 * @throws InvalidIntentError if parameters are invalid
 */
export function createIntent(options: CreateIntentOptions): Intent {
  // ...
}
```

### Rust

- Follow Rust standard style (rustfmt)
- Use meaningful variable names
- Add documentation comments

```rust
/// Initialize a new Session on-chain
/// 
/// # Arguments
/// * `ctx` - Program context
/// * `session_id` - Unique session identifier
pub fn initialize_session(
    ctx: Context<InitializeSession>,
    session_id: String,
) -> Result<()> {
    // ...
}
```

## 🧪 Testing

### Unit Tests

Tests live in `packages/core/typescript/src/__tests__/`. Run the full suite from the repo root:

```bash
npm test
```

Or run tests for a specific package:

```bash
npx jest --selectProjects @gistplus/core
```

### Integration Tests

```typescript
describe('E2E Flow', () => {
  it('should complete full protocol flow', async () => {
    // 1. Create Intent
    const intent = client.createIntent(...);
    
    // 2. Negotiate Offer
    const offer = await client.negotiate(...);
    
    // 3. Create Session
    const session = await client.createSession(...);
    
    // 4. Execute Request
    const result = await client.executeRequest(...);
    
    expect(result.receipt).toBeDefined();
  });
});
```

## 📚 Documentation

### When to Update Docs

- Adding new public APIs
- Changing existing behavior
- Adding new features
- Fixing bugs that affect usage

### Documentation Locations

- **API Docs**: In code as JSDoc/RustDoc comments
- **Guides**: In `docs/` directory
- **Examples**: In `examples/` directory
- **README**: Package-specific readmes

## 🐛 Reporting Bugs

### Before Submitting

1. Check existing issues
2. Try latest version
3. Gather reproduction steps

### Bug Report Template

```markdown
**Description**
Clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., macOS 13]
- Node: [e.g., 18.0.0]
- Package Version: [e.g., 0.1.0]

**Additional Context**
Any other relevant information.
```

## 💡 Proposing Features

### Feature Request Template

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Any mockups, examples, or references.
```

## 🚀 Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm/PyPI
5. Deploy Solana programs (if changed)
6. Announce on Discord/Twitter

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

## 🙏 Recognition

| Contributions are tracked by GitHub and listed on the [Insights > Contributors](https://github.com/gistplusxyz/gistplus/graphs/contributors) page.

## 💬 Questions?

- **GitHub Issues:** [github.com/gistplusxyz/gistplus/issues](https://github.com/gistplusxyz/gistplus/issues) — use for bugs, features
- **X (Twitter):** [@gistplus](https://x.com/gistplus)

**Thank you for contributing to Gist Plus!**

