# @verbatims/cli

CLI for the [Verbatims](https://verbatims.cc) quotes API.

Version 1 uses normalized provenance options for quote creation and updates.

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

# Manage provenance (moderator/admin API key)
verbatims quotes attributions list 123
verbatims quotes attributions create 123 --author-id 1 --reference-id 2 --status manually_verified --primary
verbatims quotes sources list 123
verbatims quotes sources create 123 --attribution-id 7 --source-type book --source-url https://example.com/edition --status externally_verified
verbatims quotes sources update 123 7 --translator-name "Jane Doe"

# Structured author dates (era can be bce or ce)
verbatims authors create --name "Hypatia" --birth-year 350 --birth-era ce --birth-approximate
verbatims authors update 12 --death-year 415 --death-era ce --death-approximate

# Create a quote with a source
verbatims quotes create --name "Alea jacta est" --author-id 1 --source-type book --source-url https://example.com/edition

Use `--author-id` or `--reference-id` to create the required primary attribution. Sources always require `--attribution-id`; use the dedicated `quotes attributions` and `quotes sources` commands for additional or edited provenance.

# Browse interactively
verbatims quotes browse

# Search
verbatims search "love" --type quotes

# Manage collections
verbatims collections list --limit 20
verbatims collections get 12 --page 1 --limit 20
verbatims collections create --name "Favorite quotes" --public
verbatims collections update 12 --name "Reading notes" --private
verbatims collections add 12 123
verbatims collections remove 12 123
verbatims collections delete 12 --yes

# Apply a reproducible theme manifest (safe to preview first)
verbatims themes apply ./theme.json --dry-run
verbatims themes apply ./theme.json

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

Theme manifests use `schema_version: 1`, a stable `slug`, a `name`, and an explicit `filters` array. Optional translations (including homepage copy), language, priority, description, and config are validated before a write. Applying the same manifest reconciles filters by type/value, retaining IDs for unchanged filters; translations reconcile by language, and omitted homepage copy is preserved. Activation and default status are left unchanged. Keep manifests in version control to review theme changes before applying them. See [`examples/themes/quiet-courage.json`](examples/themes/quiet-courage.json).

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
