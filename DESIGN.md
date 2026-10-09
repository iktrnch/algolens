---
name: AlgoLens
description: A clear, learner-first visual system for understanding algorithms through worked explanations.
colors:
  study-cobalt: '#2457d6'
  study-cobalt-hover: '#1948bd'
  night-cobalt: '#82a5ff'
  night-cobalt-hover: '#a4bdff'
  cool-paper: '#f7f8f4'
  clear-sheet: '#ffffff'
  ink: '#18212b'
  graphite: '#56616d'
  rule: '#d7dce2'
  cobalt-wash: '#e8eefc'
  code-surface: '#f9faf8'
  night-paper: '#151a21'
  night-sheet: '#1d242d'
  night-ink: '#f1f3ee'
  night-graphite: '#b4bdc8'
  night-rule: '#394451'
  night-wash: '#273653'
  error: '#b42318'
  error-dark: '#ff9b8f'
  warning: '#805600'
  warning-dark: '#e8b44f'
  success: '#247a4a'
  success-dark: '#66c993'
typography:
  display:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, Arial, sans-serif'
    fontSize: 'clamp(2.125rem, 4vw, 2.5rem)'
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, Arial, sans-serif'
    fontSize: '1.75rem'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, Arial, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, Arial, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, Arial, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 650
    lineHeight: 1.25
  code:
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Consolas, monospace'
    fontSize: '0.875rem'
    fontWeight: 450
    lineHeight: 1.6
rounded:
  compact: '4px'
  standard: '6px'
  circular: '50%'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  base: '16px'
  lg: '24px'
  xl: '32px'
  2xl: '48px'
  3xl: '64px'
components:
  button-primary:
    backgroundColor: '{colors.study-cobalt}'
    textColor: '{colors.clear-sheet}'
    typography: '{typography.label}'
    rounded: '{rounded.standard}'
    padding: '10px 18px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.study-cobalt-hover}'
    textColor: '{colors.clear-sheet}'
    rounded: '{rounded.standard}'
  button-secondary:
    backgroundColor: '{colors.clear-sheet}'
    textColor: '{colors.ink}'
    rounded: '{rounded.standard}'
    padding: '10px 18px'
    height: '44px'
  input-code:
    backgroundColor: '{colors.code-surface}'
    textColor: '{colors.ink}'
    typography: '{typography.code}'
    rounded: '{rounded.standard}'
    padding: '16px'
---

# Design System: AlgoLens

## Overview

**Creative North Star: "The Worked Solution"**

AlgoLens feels like the best revision guide a computer-science learner has used: lucid, calm, carefully edited, and built to reveal reasoning one step at a time. It is a teaching surface, not an IDE, terminal, dashboard, or AI product showroom. Pasted code and the resulting explanation read as two parts of one worked solution.

The visual world draws from contemporary educational publishing. A cool paper ground, dark ink, disciplined cobalt emphasis, generous reading measures, and a direct input-to-answer spread provide character without competing with the learner's work. The coordinated dark theme preserves the same hierarchy and material relationships. Motion is restrained to state change and direct feedback.

**Key Characteristics:**

- Clear educational hierarchy with plain-language, sentence-case labels.
- A direct, uninterrupted relationship between the algorithm and its explanation.
- Flat editorial surfaces separated by spacing and selective one-pixel rules.
- Cobalt reserved for action, selection, focus, and instructional emphasis.
- Code and prose treated as equal parts of the learning experience.
- Coordinated light and dark themes with visible focus and reduced-motion support.

## Colors

The palette pairs cool paper and blue-black ink with one disciplined cobalt accent; dark mode changes values, not identity.

### Primary

- **Study Cobalt:** Primary actions, links, focus indicators, selected labels, and complexity values in the light theme.
- **Night Cobalt:** The higher-lightness dark-theme counterpart, used for the same semantic roles without becoming neon.

### Neutral

- **Cool Paper / Night Paper:** Page grounds that establish the study-sheet atmosphere.
- **Clear Sheet / Night Sheet:** Active input surfaces and controls that need one step of tonal separation.
- **Ink / Night Ink:** Primary text and strong interface marks.
- **Graphite / Night Graphite:** Secondary copy, provenance, helper text, and metadata; it remains comfortably readable.
- **Rule / Night Rule:** One-pixel dividers, field borders, and quiet structural boundaries.
- **Code Surface:** A subtly distinct light code-entry ground; dark mode uses a matching deep blue-black surface.
- **Cobalt Wash / Night Wash:** Selected identities and restrained accent-adjacent emphasis.

### Semantic

- **Error:** Failed analysis and invalid input only, paired with text and a tonal wash.
- **Warning:** Stale-result and recoverable-delay communication only.
- **Success:** Completed or recovered state only, always with a textual status.

**The One Accent Rule.** Cobalt is the only brand accent and should occupy less than ten percent of a typical screen. Semantic colors communicate state; they never decorate.

**The Quiet Paper Rule.** Backgrounds remain nearly neutral. No mesh gradients, glowing color fields, glass effects, grain overlays, or decorative grid lines.

**The Contrast Rule.** Body text, labels, placeholders, helper text, focus indicators, and controls meet WCAG AA in both themes. Muted does not mean faint.

## Typography

**Interface and Reading Font:** Self-hosted Atkinson Hyperlegible Next, with `system-ui`, `Arial`, and `sans-serif` fallbacks.

**Code Font:** Self-hosted JetBrains Mono, with `ui-monospace`, `SFMono-Regular`, `Consolas`, and `monospace` fallbacks.

**Character:** Atkinson Hyperlegible Next is open, direct, and learner-friendly without becoming juvenile. JetBrains Mono creates precise technical contrast for code, complexity notation, shortcuts, and counters.

### Hierarchy

- **Display:** The page introduction only; bold, tightly led, slightly tracked inward, and balanced across lines.
- **Headline:** Work-area, result, empty, running, and error-state headings.
- **Title:** Result-section titles and compact error headings.
- **Body:** Explanation and instructional copy, generally constrained to a readable measure of about 68 characters.
- **Label:** Field labels, status labels, and compact control text; sentence case by default.
- **Code:** Editor content and technical fragments. Complexity values increase to `1.75–2rem` and weight `650` without adopting dashboard scale.

**The Prose First Rule.** Explanations use the interface font. Monospace is reserved for code and notation, never paragraphs, buttons, or navigation.

**The Sentence Case Rule.** Labels and actions use sentence case. Wide-tracked uppercase micro-labels are not part of this system.

**The Self-Hosted Type Rule.** Both variable fonts are served locally with `font-display: swap`; do not replace them with third-party font stylesheets.

## Layout

The page shell is capped at `1280px` with `24px` side gutters on desktop. Above `1100px`, the workspace is a direct `5fr 7fr` worked-solution spread with a `48px` gap: code input and the wider explanation column. Their headings share the same horizontal baseline. The result remains on the page plane and uses a reading measure near `68ch`.

At `1099px` and below, the spread becomes a task-ordered single column capped at `820px`: input, its compact status line, then result. At `767px` and below, page gutters reduce to `16px`, headings and controls tighten, the primary action fills the available width, and complexity values stack internally.

Spacing follows a four-pixel base: `4`, `8`, `12`, `16`, `24`, `32`, `48`, and `64`. Control groups use `8–16px`, work-area separation uses `24–32px`, and only major page transitions use `48–64px`.

**The Input-to-Answer Rule.** Input and answer remain visually adjacent without an intervening rail. Editing the current input visibly marks a completed result as stale.

**The No Dead Panel Rule.** Empty layouts teach the next action and collapse when their space is not useful; mobile never reserves a large blank result panel.

## Elevation & Depth

The system is flat by default. Tonal surfaces, spacing, and one-pixel boundaries create hierarchy. Shadows are absent from the inline workspace and reserved for future elements that genuinely overlay content, such as a menu, popover, or dialog; any such shadow should be soft, neutral, and untinted.

**The Flat Lesson Rule.** Content in the reading flow stays on the page plane. Do not wrap every result section in a card or lift panels on hover.

**The Honest Overlay Rule.** Only true overlays receive shadows. Inline content never pretends to float.

## Shapes

Gently squared geometry is consistent across the interface. Buttons, fields, panels, notices, and menus use the standard `6px` radius. Compact inline marks may use `4px`. The only circular form is a functional progress spinner.

Borders are one pixel and structural. Code input uses the same shape language as every other field; it never acquires fake terminal chrome. Fully pill-shaped controls, decorative capsules, dashed frames, and ornamental brackets are outside the system.

**The One Geometry Rule.** New components inherit the modest `6px` or compact `4px` language instead of inventing a silhouette.

## Components

### Buttons

- **Primary:** A solid cobalt action with a `44px` minimum height, `6px` corners, and compact `10px 18px` padding. It shifts to the darker cobalt on hover and becomes a neutral, plainly disabled control when analysis cannot run. Dark mode uses dark ink on Night Cobalt for contrast.
- **Secondary:** A sheet-colored, one-pixel bordered action with the same dimensions. Hover changes its border and text to cobalt without lift.
- **Text action:** Transparent, cobalt, underlined, and at least `40px` tall. It changes color only; it is not presented as a pill or chip.
- **Focus:** The shared focus treatment is a three-pixel cobalt outline with a three-pixel offset.

### Inputs / Fields

- **Language select:** A familiar native select inside a `154px` minimum wrapper, `40px` minimum height, visible label, one-pixel rule border, and a simple inline chevron.
- **Code field:** A vertically resizable editor with a `340px` desktop minimum height, reduced to `280px` on mobile. It uses JetBrains Mono, `16px` internal padding, a visible cobalt caret, and no simulated editor chrome.
- **Disabled:** Running-state fields retain readable content, use a wait cursor, and reduce opacity without becoming illegible.

### Cards / Containers

- **Input surface:** A single sheet-colored bordered container holds language, code, and submission controls. Internal rules communicate grouping; nested cards do not.
- **Status notices:** Error and stale-result notices use a semantic wash, semantic border mix, `6px` radius, and explicit text. Color is never the sole signal.
- **Complexity comparison:** One sheet-colored, bordered container groups the time and space values with their explanation. The values are divided structurally inside that single surface; they are not separate dashboard cards.

### Navigation

- **Header:** A `72px` desktop and `64px` mobile ruled header holds the algorithm-node wordmark, a `40px` square GitHub repository link, and a matching theme toggle.
- **Theme toggle:** Transparent at rest with a rule border; hover applies the cobalt wash and accent border. Its icon and accessible label communicate the destination theme.

### Analysis Status

Status belongs to the input task, directly below its submission controls. It pairs the current state with concise provenance and never occupies space between the algorithm and its explanation. On mobile it becomes a short stacked block while keeping the same information order.

### Worked Solution

The result begins directly with the explanation, then reads through complexity and improvements separated by rules. Complexity is one two-column comparison card with prominent cobalt monospace values and its explanatory sentence attached below. Improvements use restrained zero-padded mono counters instead of cards or badges.

### Loading State

Running feedback uses one small spinner, a concise heading, and plain-language status copy. The `900ms` rotation is the only continuous motion and collapses to effectively static under `prefers-reduced-motion`.

**The Direct Feedback Rule.** State transitions use `180ms ease`; motion confirms interaction or processing and never stages the result as theatre.

## Do's and Don'ts

### Do:

- **Do** keep the algorithm and its explanation directly adjacent on wide screens.
- **Do** keep status and provenance attached to the input action.
- **Do** present explanation, complexity, and improvements as one coherent reading sequence.
- **Do** use standard buttons, selects, textareas, and familiar keyboard behavior.
- **Do** provide visible labels above fields and actionable errors near the failed task.
- **Do** retain `Ctrl+Enter` and `Cmd+Enter` as optional shortcuts while keeping the Run analysis button obvious.
- **Do** use structural skeletons or textual status while analysis is running.
- **Do** keep state transitions at `180ms ease`, honor `prefers-reduced-motion`, and make every state understandable without animation.
- **Do** keep dark mode coordinated with the light system rather than inventing a second identity.

### Don't:

- **Don't** use neon green, purple-blue gradients, glows, mesh backgrounds, glassmorphism, grain, or decorative grids.
- **Don't** imitate terminals, code-editor chrome, command palettes, dashboards, or science-fiction interfaces for atmosphere.
- **Don't** use pulsing dots, perpetual animation beyond the processing spinner, staggered result theatre, or motion that implies backend progress the product cannot report.
- **Don't** use monospace as the default interface voice.
- **Don't** scatter the explanation into equal cards or a generic tile layout.
- **Don't** hide labels inside placeholders or communicate selection through color alone.
- **Don't** use low-contrast gray for helper text, placeholders, character counts, or disabled states.
- **Don't** add claims, scores, confidence percentages, visualizations, rewritten code, or line-linked findings that the product does not produce.
- **Don't** let the visual metaphor override standard controls or the learner's reading order.
