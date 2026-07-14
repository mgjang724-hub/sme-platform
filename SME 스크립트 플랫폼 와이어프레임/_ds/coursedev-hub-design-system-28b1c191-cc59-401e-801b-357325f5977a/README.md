# CourseDev Hub — Design System

Internal design system for **CourseDev Hub**, the e-learning course-development
management workspace for **i-Scream / i-Scream 원격교육연수원 (Remote Education
Training Center)**.

CourseDev Hub is an **internal SaaS workspace** that helps e-learning training PMs
coordinate a course from kickoff to LMS porting: instructors, instructional
designers, development vendors, files, schedules, approvals, feedback, and
deliverables — all in one lightweight control center. The guiding UX principle is
the **5-second rule**: a PM opens the dashboard and understands the whole work
situation (what's in progress, what stage, what's at risk, what's missing, who
owns it, what to do next) within five seconds.

It deliberately is **not** a marketing homepage, a public course marketplace, a
student LMS, or a heavy enterprise PM tool. It inherits the warm, friendly,
educational i-Scream brand mood but dresses it as a calm, professional internal
dashboard.

---

## Brand identity

The visual identity is inherited from the **i-Scream 원격교육연수원** wordmark
(`assets/logo-iscream-full.png`):

- A pinwheel/propeller mark split between **coral orange** and **warm gray**.
- "아이스크림" set in orange, "원격교육연수원" in warm gray.
- Literal sampled colors: orange `#F06020`, warm gray `#6E5F60`.

The product **primary action color** is a slightly warmer coral-orange (`#FF6B4A`)
tuned for UI legibility on white. Orange is reserved for primary actions, the
active nav item, selected tabs, notification badges, and key highlights — never
large fills.

---

## Sources provided

- `uploads/연수원 로고파일.png` — the i-Scream Remote Education Training Center
  logo (562×127 PNG, transparent). Copied to `assets/logo-iscream-full.png`.
- A detailed written brief describing product goals, UX principles, navigation,
  color system, typography, components, and do/don't guidance. The brief is the
  authoritative spec; this README distills and operationalizes it.

No codebase or Figma file was provided — the UI kit is built from the written
brief and brand mark, following the brief's explicit token values.

---

## CONTENT FUNDAMENTALS

How copy is written across CourseDev Hub.

- **Language:** Korean-first UI, with English allowed for established product/tech
  terms (LMS, QA, PM, Storyboard). Latin numerals throughout.
- **Tone:** Warm, calm, and helpful — a supportive colleague, not a stern system.
  Friendly but never childish or cute. Professional but never cold or clinical.
- **Voice / person:** Address the PM directly and lightly. Greetings use the
  user's name ("정수님, 오늘 처리할 일이 5건 있어요"). System messages are plain and
  reassuring, not alarmist.
- **Casing:** Korean has no case; English labels use **Title Case for nav/section
  labels** (Dashboard, Approvals) and sentence case for helper text.
- **Endings:** Friendly polite Korean (해요체) for guidance and empty states
  ("아직 등록된 피드백이 없어요"); concise noun-phrase labels for buttons and chips
  ("승인 요청", "마감 임박", "파일 누락").
- **Numbers & dates:** Korean date format `2026.06.02` or `6월 2일 (화)`;
  relative time for recent activity ("3시간 전", "어제"). Counts are plain
  numerals with Korean counters ("진행 3건", "지연 2건").
- **Status copy pairs color WITH text** — never color alone. A delayed item is a
  red-tinted chip that also reads "지연".
- **Emoji:** Not used in the working dashboard. Small line icons carry meaning
  instead. (A single friendly illustration is allowed only in empty states.)
- **Microcopy vibe examples:**
  - Next action button: "대본 검토 요청하기", "스토리보드 확인", "파일 요청"
  - Risk note: "촬영 일정 2일 지연 — 강사 일정 재확인 필요"
  - Empty state: "처리할 승인 요청이 없어요. 깔끔하네요! 🎉" *(emoji only here)*

---

## VISUAL FOUNDATIONS

**Color vibe.** Light, warm, and quiet. A near-white page (`#F7F8FA`) with white
cards; warmth comes from the single coral-orange accent and soft pastel status
chips. The interface stays calm — orange is a seasoning, not a sauce. No dark
mode in MVP.

**Type.** Pretendard for all Korean + Latin UI (Noto Sans KR / Apple SD Gothic Neo
as system fallbacks); Inter for tabular numerals and dense English labels.
Hierarchy is built from **size + weight**, not color. Headings are semibold/bold
(600–700), never decorative. Page title 24–28/700, section 18–20/600–700, card
title 16–18/600, body 14–15/400–500, meta 12–13/400. Letter-spacing is tightened
slightly (-0.01em) on large headings only.

**Spacing.** 4px base scale (4/8/12/16/20/24/32/40/48). Cards use generous
internal padding (20–24px). Layout is roomy and scannable — whitespace does the
organizing, not borders.

**Backgrounds.** Flat light gray/white. **No photographic backgrounds, no
full-bleed imagery, no gradients on surfaces.** Permitted decoration is subtle and
brand-tied: pale orange circles or a faint orange wash behind a hero number,
always low-contrast. Empty states may show one small friendly line illustration.

**Cards.** The core surface. White (`#FFFFFF`), `1px solid #E5E7EB` border,
`16px` radius, and a single subtle shadow `0 4px 12px rgba(17,24,39,0.06)`.
Generous padding. Project cards carry: course title, current stage chip, progress
bar/%, due date, owner avatar+name, latest update, risk/delay indicator, and a
next-action button.

**Radii.** Buttons/inputs `10px`, chips `12px`/pill, cards `16px`, large panels
`20px`. Nothing sharp; nothing fully circular except avatars and pill chips.

**Shadows / elevation.** Three soft levels only: card resting
(`0 4px 12px /6%`), popover/menu (`0 8px 24px /10%`), and a hairline xs for
inputs. No hard or colored drop shadows. Focus uses a 3px orange ring
(`rgba(255,107,74,0.22)`).

**Borders.** Hairline `#E5E7EB` everywhere; `#D6D9DE` for input edges and stronger
dividers. Table rows use light dividers, not full grids.

**Hover states.** Buttons darken (primary → `#F45A38`); secondary buttons tint to
`#FFF4EF` with the border warming to orange; list rows wash to `#F2F3F5`; cards
lift one shadow step and the border warms slightly. Transitions are quick
(120–160ms ease-out).

**Press states.** Subtle scale-down (`0.98`) and a one-step-darker color
(primary → `#E24E2F`). No bounce.

**Animation.** Restrained and functional. Fades and small slides (8–12px),
120–200ms, `ease-out` / `cubic-bezier(0.2,0.8,0.2,1)`. Progress bars ease their
width on change. Side panels slide in from the right (~220ms). **No infinite
loops, no decorative motion, respects `prefers-reduced-motion`.**

**Transparency / blur.** Used sparingly — modal scrims at `rgba(17,24,39,0.32)`;
optional light backdrop-blur behind a sticky header. Chips and cards are solid.

**Imagery.** Minimal. Avatars (initials or photo, circular), small line icons, and
one optional empty-state illustration per surface. No stock photography, no
mascots in the working dashboard.

**Layout rules.** Fixed left sidebar (collapsible), sticky top page header with
search + quick actions, card-based main column. Avoid deep nesting, excess tabs,
and dense ERP tables as the primary experience. Urgent items (delays, missing
files, pending approvals) live on the surface, never buried in menus.

---

## ICONOGRAPHY

- **Icon set:** [**Lucide**](https://lucide.dev) — 1.5–2px stroke, rounded line
  icons. Loaded from CDN (`lucide@latest`). Their friendly-but-practical rounded
  geometry matches the brand's warm-yet-professional tone better than sharp/filled
  sets. *(Substitution flagged: no project icon assets were provided; Lucide is the
  chosen CDN match — swap if the team has a house set.)*
- **Style:** Outline only, `1.75px` stroke, `currentColor` so icons inherit text
  color. Icons sit at 18–20px in nav/buttons, 16px inline with meta text.
- **Color:** Icons are neutral (`--fg-3`) by default; orange only when they sit
  inside a primary control or mark an active nav item.
- **Status:** Status is carried by **chip + text**, with a small leading icon
  (e.g. `alert-triangle` for delay, `clock` for due-soon) — never icon-only.
- **Emoji:** Not used in the working UI. A single celebratory emoji is permitted in
  positive empty states only.
- **Logo:** `assets/logo-iscream-full.png` (full wordmark). Use the mark on the
  sidebar header; never recolor it.

---

## Index — files in this system

- `colors_and_type.css` — all color, type, radius, shadow, spacing tokens
  (base + semantic). Import this first in any artifact.
- `assets/` — `logo-iscream-full.png` (i-Scream wordmark) and brand assets.
- `preview/` — small specimen cards that populate the Design System tab
  (colors, type, spacing, components).
- `ui_kits/coursedev-hub/` — high-fidelity recreation of the CourseDev Hub
  workspace: `index.html` (interactive click-thru) + JSX components.
- `SKILL.md` — Agent Skill manifest for using this system in Claude Code.

This README is the high-level brand + content + visual reference; the CSS file is
the source of truth for tokens.
