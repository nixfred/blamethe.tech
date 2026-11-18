#!/usr/bin/env bash
# Fail on em dashes, leftover placeholders, or missing required files.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/public"
fail=0

for f in "$PUB/index.html" "$PUB/404.html" "$PUB/og.png" "$PUB/favicon.svg" \
         "$PUB/favicon-32.png" "$PUB/apple-touch-icon.png" "$PUB/robots.txt" \
         "$PUB/llms.txt" "$PUB/sitemap.xml" "$PUB/_headers" \
         "$PUB/assets/brand/nixfred-icon.svg" "$PUB/css/site.css" "$PUB/js/site.js"; do
  if [[ ! -e "$f" ]]; then
    echo "missing: $f" >&2
    fail=1
  fi
done

if grep -R -n -P '\x{2014}|\x{2013}' --include='*.html' --include='*.css' --include='*.js' --include='*.txt' --include='*.md' --include='*.xml' "$PUB" "$ROOT/README.md" "$ROOT/scripts" ; then
  echo "em dash or en dash found" >&2
  fail=1
else
  echo "no em/en dashes in copy"
fi

if grep -R -n 'SHARE_TAGS' "$PUB" ; then
  echo "SHARE_TAGS placeholder still present" >&2
  fail=1
fi

if grep -R -n -i 'Daniel Miessler' "$PUB" "$ROOT/README.md" ; then
  echo "forbidden name found" >&2
  fail=1
fi

# logo must match the locked hexroll copy
if ! cmp -s /workspace/games/hexroll/assets/nixfred-icon.svg "$PUB/assets/brand/nixfred-icon.svg"; then
  echo "logo does not match locked source copy" >&2
  fail=1
else
  echo "logo matches locked copy"
fi

exit $fail
