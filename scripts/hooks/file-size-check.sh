#!/bin/sh
# Fail the commit if any staged file (excluding public/) exceeds 1MB.
large=$(git diff --cached --name-only --diff-filter=ACMR -- ':!public/*' ':!**/public/*' | xargs -I{} find {} -maxdepth 0 -size +1M 2>/dev/null)
if [ -n "$large" ]; then
  echo "A staged file exceeds 1MB:"
  echo "$large"
  exit 1
fi
