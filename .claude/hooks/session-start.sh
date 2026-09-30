#!/bin/bash
set -euo pipefail

# Claude Code on the web clones this repo fresh into each new container, and that clone never
# sets refs/remotes/origin/HEAD. Several built-in commands (e.g. /security-review) diff against
# origin/HEAD..., so without this they fail immediately with "fatal: ambiguous argument
# 'origin/HEAD...': unknown revision or path not in the working tree." Fix it once per session.
git remote set-head origin -a
