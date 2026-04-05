# Reaction Points Tracker

A web-based combat tracker for a homebrew D&D 5e **Reaction Points (RP)** system. Designed to be used by the DM (or shared with players) during sessions on any device with a browser.

## What Are Reaction Points?

Reaction Points expand on 5e's single-reaction-per-round system. Instead of one reaction per turn, creatures get a pool of RP that scales with level/CR, which they can spend on reactions, movement, bonus actions, and even full actions (via Adrenaline Rush). Key concepts:

- **RP Pool** — Scales with level/CR across 7+ tiers. RP carries over between rounds up to a maximum.
- **RP Recovery** — At the start of each round, creatures regain RP (amount scales with tier), capped at their maximum.
- **Adrenaline Rush** — Once per combat (twice for bosses/villains), a creature can interrupt the turn order and gain bonus RP to spend freely. This can temporarily exceed their max RP.
- **Rattled** — A condition that prevents a creature from taking reactions and blocks RP recovery each round.
- **Boss/Villain** — Uses one tier row below their CR for RP calculations and gets two Adrenaline Rush uses per combat.

Full rules are in `Reaction Point Rules.pdf`.

## Features

- **Setup Screen** — Add characters/monsters with name, level/CR, and boss designation
- **Combat Tracker** — Per-character cards showing current/max RP with spend, gain, Adrenaline Rush, and Rattled controls
- **New Round** — One-click RP recovery for all non-rattled characters
- **Undo** — Full state-snapshot undo (up to 50 actions deep)
- **Mid-Combat Add/Remove** — Add or remove creatures during an active combat
- **Party Presets** — Save and load named party configurations for quick setup between sessions
- **Auto-Save** — Combat state persists in the browser via `localStorage`; refreshing the page restores your session
- **Responsive Design** — Works on desktop, tablet, and phone screens
- **D&D Themed UI** — Parchment-style aesthetic with fantasy fonts

## Usage

Open `index.html` in any modern browser. No install, build step, or server required.

1. **Add characters** — Enter name, level/CR, and optionally check "Boss"
2. **Save your party** (optional) — Give the party a name and click "Save Party" to reuse it later
3. **Start Combat** — Transitions to the tracker view
4. **During combat** — Use the buttons on each character card to spend/gain RP, activate Adrenaline Rush, or toggle Rattled
5. **New Round** — Click "New Round" to advance the round counter and recover RP
6. **Undo** — Click "Undo" to revert any accidental action
7. **End Combat** — Returns to the setup screen and clears combat data

## RP Tier Table

| Level/CR | Row | Starting RP | RP/Round | Max RP | Adrenaline Rush |
|----------|-----|-------------|----------|--------|-----------------|
| 1–4      | 1   | 1           | 1        | 2      | +2 RP           |
| 5–10     | 2   | 2           | 1        | 3      | +3 RP           |
| 11–16    | 3   | 2           | 2        | 4      | +3 RP           |
| 17–22    | 4   | 3           | 2        | 5      | +4 RP           |
| 23–28    | 5   | 4           | 3        | 6      | +4 RP           |
| 29–34    | 6   | 6           | 3        | 7      | +5 RP           |
| 35+      | 7   | 7           | 4        | 8      | +5 RP           |

The app extends this logic up to row 10 for edge cases beyond typical play.

## File Structure

- `index.html` — Page markup (setup screen + tracker screen)
- `styles.css` — D&D parchment-themed styles, responsive layout
- `app.js` — All application logic: RP calculations, state management, undo, localStorage persistence, rendering

## Data Storage

All data is stored in the browser's `localStorage`:

- **`rpt-session`** — Active combat state (characters, round counter, undo history). Auto-saved on every action and restored on page load.
- **`rpt-parties`** — Saved party presets (character name/level/boss configurations).

> **Note:** `localStorage` is per-browser, per-device. Data does not sync across different browsers or devices.
