# velosym-forge

Anti-Slop Linter — scans codebases for AI-generated code smell and enforces brutalist code standards.

## Rules

- **no-redundant-comment**: Flags comments that restate what the code does (`// This function returns the value`)
- **no-slop-markers**: Catches `TODO: implement`, `auto-generated`, `eslint-disable` patterns
- **no-excessive-comments**: Flags files where >40% of lines are comments

## Usage

```bash
npx velosym-forge "src/**/*"
```

## CI

Add `.github/workflows/slop-linter.yml` to run on PRs automatically.
