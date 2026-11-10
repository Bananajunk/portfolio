# Bananajunk

Liam Reid's personal resume website at bananajunk.dev. It expands the one-page resume into a playful, fast, WCAG 2.2 AA site aimed at recruiters and hiring managers.

## Language

**Site**:
The single scrolling page served at bananajunk.dev.
_Avoid_: Portfolio, app, blog

**Resume**:
The one-page HTML document (and its committed PDF) that is the source of truth for facts on the Site.
_Avoid_: CV

**Claim**:
Any factual statement about Liam's work shown on the Site.
_Avoid_: Fact, bullet

**Claim rules**:
The constraints every Claim must satisfy: a number only where verified, no Owner-internal names, "led remediation of" never "fixed" for the accessibility total, Unified Client Cart State never called launched.
_Avoid_: Style guide

**Unverified**:
A Claim marked in its data file as awaiting Liam's confirmation; it must be resolved before launch.
_Avoid_: Draft, TODO

## Content

**Role**:
One employer-and-title entry (Owner, Faire, Shopify, TextNow), shown as a Card.
_Avoid_: Job, position

**Card**:
A pastel colour-block summary of a Role that expands in place to show detail.
_Avoid_: Tile, panel

**Story**:
A case study inlined on the Site with Problem, What I did, Trade-offs and Outcome. There are three: accessibility, Flow 2.0 and Include Utensils.
_Avoid_: Case study page, project

**Before that**:
The timeline of earlier Roles (Microsoft/Yammer, Desire2Learn) and education.
_Avoid_: Early career

## Experience controls

**Calm mode**:
A persisted visitor setting that disables all non-essential motion, on by default when the system requests reduced motion.
_Avoid_: Reduced motion toggle, animation off

**Time of day**:
The theme control, a labelled slider shifting the palette from day through dusk to night, with day, dusk and night presets.
_Avoid_: Dark mode, theme switcher
