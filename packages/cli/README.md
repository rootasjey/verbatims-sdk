# @verbatims/cli

CLI for the [Verbatims](https://verbatims.cc) quotes API.

## Install

```bash
npm install -g @verbatims/cli
# or use directly
npx @verbatims/cli --help
```

## Usage

```bash
# Configure API key
verbatims config

# List quotes
verbatims quotes list --language fr --limit 10

# Browse interactively
verbatims quotes browse

# Search
verbatims search "love" --type quotes

# See all commands
verbatims --help
```
