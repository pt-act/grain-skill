#!/usr/bin/env bash
# install.sh — symlink the skills into an agent's skill folder, so git pull
# updates them in place. Run from the repo root.
#
#   ./install.sh            Claude Code
#   ./install.sh --codex    Codex
#   ./install.sh --all      both
#   ./install.sh --list     every install name, no changes

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="$(basename "$REPO")"

list_skills() {
  for d in "$REPO"/skills/*/; do
    skill="$(basename "$d")"
    skill_md="$d/SKILL.md"
    [ -f "$skill_md" ] || continue
    install_name="$(awk '/^name:/{print $2; exit}' "$skill_md")"
    echo "$install_name  ($skill)"
  done
}

link_skill() {
  local target_root="$1" skill="$2" link_name="$3"
  local dest="$target_root/$link_name"
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  ln -s "$REPO/skills/$skill" "$dest"
  echo "linked $skill -> $link_name"
}

case "${1:-claude}" in
  --list) list_skills; exit 0 ;;
  --codex)
    for s in "$REPO"/skills/*/; do
      skill="$(basename "$s")"
      install_name="$(awk '/^name:/{print $2; exit}' "$s/SKILL.md")"
      [ -n "$install_name" ] || continue
      link_skill "${CODEX_HOME:-$HOME/.codex}" "$skill" "$install_name"
    done
    ;;
  --all)
    "$0" claude
    "$0" --codex
    ;;
  claude|*)
    DEST="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
    mkdir -p "$DEST"
    for s in "$REPO"/skills/*/; do
      skill="$(basename "$s")"
      install_name="$(awk '/^name:/{print $2; exit}' "$s/SKILL.md")"
      [ -n "$install_name" ] || continue
      link_skill "$DEST" "$skill" "$install_name"
    done
    ;;
esac

echo "done. Start a new session so the skills load."
