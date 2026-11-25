# Changelog

All notable changes to grain-skill are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-11-25

The listing pass. Adds the two install surfaces a marketplace expects and a
machine-readable index, without touching the direction library.

### Added

- `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json`, so the
  repo installs in Claude Code with `/plugin marketplace add pt-act/grain-skill`
  and `/plugin install grain@grain-skill`.
- `.codex-plugin/marketplace.json` and `.codex-plugin/plugin.json`, so the
  repo installs in Codex with `codex plugin marketplace add pt-act/grain-skill`.
- `llms.txt` and `scripts/llms.mjs` (with `--check`), a machine-readable index
  of the three skills and the script surface. CI fails when the index drifts.
- README install section for the marketplace paths.

### Changed

- `library/version.js` is now `0.1.2`.

## [0.1.1] - 2026-11-25

The public-release pass. The direction library is unchanged; this release
fixes the gate, the picture search, the examples and CI so the repository can
be published and the examples pass the checks they claim to pass.

### Fixed

- `inspect.mjs` crashed during cleanup with `ENOTEMPTY` while the browser was
  still writing its profile, losing the gate result and exiting 2. Cleanup is
  now best-effort and the result is always printed.
- `inspect.mjs` counted any `background-image` (including a real photograph)
  as a gradient. It now counts only `gradient()` backgrounds.
- `inspect.mjs` measured the smallest paragraph as the body size, so every
  page with a 13–15px caption failed `body-size`. It now measures the body
  font and checks running text separately, excluding captions, credits,
  marginal notes, annotations and buttons.
- `inspect.mjs` counted motion by tag/class, so identical elements collapsed
  into one and pages with many moving parts undercounted. It now counts each
  element once.
- `inspect.mjs` could read empty counters on the first viewport because a
  stale `Page.loadEventFired` from `about:blank` resolved the load wait early.
  It now polls `document.readyState`.
- `inspect.mjs` now emulates `prefers-reduced-motion` and fails a page whose
  `[data-motion]` content stays hidden, as `references/motion.md` already
  claimed.
- `inspect.mjs` now passes `--no-sandbox` when run as root, and finds Brave
  alongside Chrome, Edge and Chromium.
- `assets.mjs` accepted CC BY-NC and CC BY-ND licences despite documenting
  that only commercial-use licences are kept. The filter now excludes them.
- `assets.mjs --get <ref>` on its own printed usage and exited; it now
  resolves against the last search in the folder.
- `assets.mjs --video` searched the images endpoint and could never find a
  clip. It now searches Wikimedia Commons for video files.
- `assets.mjs` now writes the `.credit.json` sidecar its usage text promised.
- `draw.mjs --help` printed the sector error instead of usage; `--show` now
  warns when the stored sheet came from a different library version.
- The examples failed their own gate: captions tripped `body-size`, the
  motion count was under eight, and the clean fixture overflowed at 390px.
  All three examples and the fixture now pass `lint.mjs` and `inspect.mjs`.
- The CI workflow used `browser-actions/setup-chrome@v4` (the action is at
  v2), watched `main` while the default branch is `master`, and never told
  the inspector where Chrome was installed. It now runs on both branches and
  passes `GRAIN_BROWSER` from the action's `chrome-path` output.
- Added `package.json` with `"type": "module"` so the library's `.js` files
  load as ES modules without Node's reparse warning.

### Changed

- `library/version.js` is now `0.1.1`.
- The examples' viewport meta tags used `initial-scale-1`; corrected to
  `initial-scale=1`.
- The examples' credits now list only the pictures actually on the page.

## [0.1.0] - 2026-11-25

The first versioned release. The skill itself is unchanged from the 16 October
2026 content; this release pins a version to it so listings and installs can
name what they are getting.

### Added

- `CHANGELOG.md` and a single source of truth for the library version
  (`skills/grain/library/version.js`, `0.1.0`). `draw.mjs` records the
  version in `.grain/build-state.json` when it deals a direction, and
  `tokens.mjs` prints it in the tokens header, so a built page can always say
  which library version dealt it.

### Fixed

- `grain-quiet` and `grain-redesign` frontmatter: their `description` values
  contained unquoted colons, which GitHub reported as "Error in user YAML"
  and which can break skill loaders and marketplace ingestion. Both
  descriptions are now quoted; all three `SKILL.md` files parse as valid YAML.
- README install line: the `npx skills add` example contained a literal
  `<your-fork>` placeholder. It now points at the real repository,
  `https://github.com/pt-act/grain-skill`.

### Notes

- The internal remediation plan (Tier 1 surface completeness, Tier 2 breadth)
  remains open; it is kept outside the public repository.
