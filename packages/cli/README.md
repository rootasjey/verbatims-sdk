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

# Filter quotes by reference and inspect provenance
verbatims quotes list --reference 42
verbatims quotes get 123 --format json

# Create a quote with a source
verbatims quotes create --source-type book --source-url https://example.com/edition

# Browse interactively
verbatims quotes browse

# Search
verbatims search "love" --type quotes

# List social platforms with queue stats
verbatims social platforms

# List the social queue (defaults to platform x)
verbatims social queue list --platform bluesky --status queued

# Add approved quotes to the queue
verbatims social queue add 42 57 --platform bluesky

# Publish the next eligible queued item immediately
verbatims social queue run-now --platform bluesky

# See all commands
verbatims --help
```

### Social commands

```bash
verbatims social platforms                                # list platforms + queue stats
verbatims social posts [--platform <p>] [--status <s>]    # audit trail of published posts
verbatims social queue list [--platform <p>] [--status <s>] [--search <q>] [--limit <n>]
verbatims social queue get <id>                           # single queue item
verbatims social queue add <ids...> [--platform <p>] [--scheduled-for <iso>]
verbatims social queue random [--platform <p>] [--count <n>] [--language <lang>]
verbatims social queue remove <id> [--yes]
verbatims social queue requeue <id>                       # reset a failed item to queued
verbatims social queue reorder <id> [--direction up|down] [--before <id>]
verbatims social queue clear [--platform <p>] [--scope all|finished] [--yes]
verbatims social queue run-now [--platform <p>]           # publish immediately (1/min)
```

Platforms: `x`, `bluesky`, `instagram`, `threads`, `facebook`, `pinterest`.
Queue statuses: `queued`, `processing`, `posted`, `failed`, `active`.
Requires an API key with the `social:read` / `social:write` permissions.
