# Luxury Design System

Black-monochrome luxury design system derived from a luxury-automotive design analysis (`guidelines/DESIGN-source-analysis.md`, provided by the user in the mounted folder `Luxury Design Templatess/`). All naming is original ("Marque", generic models) — **no brand marks are included and none should be added**; render names in plain type wherever a mark would go.

Rules in one breath: pure black canvas; weight 400 everywhere (bold is a violation); uppercase display with +2–4px tracking (wordmark +6px); serif body, mono for buttons/nav/captions; transparent outline pill buttons only; 0px corners except pills; #c3d9f3 ice-blue is the only color; 120px section rhythm.

## Content fundamentals
- Sparse, literary, slow. One considered serif sentence where others write a paragraph.
- Display lines UPPERCASE ("YOUR HEADLINE"); body sentence case; mono metadata ("12. JULY 2026").
- Never exclamation marks, never emoji. No superlative stacking — the photography carries the voltage.
- CTAs are single mono words: "DISCOVER", "ENQUIRE", "CONFIGURE".

## Visual foundations
- **Color**: total monochrome. Canvas #000, surface steps #0d0d0d → #141414 → #1f1f1f; hairlines #262626 / #3a3a3a. Ice-blue #c3d9f3 on inline links ONLY. Semantic warning/success exist but are rare.
- **Type trinity** (weight 400 only, unbreakable split): Display = Saira Condensed (uppercase, +2–4px tracking; wordmark 14px/+6px); Body = Cormorant Garamond serif 16/1.5; Machine = JetBrains Mono for buttons (14/+2.5px), nav (12/+2px), captions (11/+2px). Emphasis = size + tracking + case + family contrast, never weight.
- **Spacing**: 4px base — 4/8/12/16/24/40/64; section rhythm 120px (do not compress); 40px gutters; max content 1280px; photo bands full-bleed.
- **Radii**: binary — 0px everywhere, 9999px pills on buttons only.
- **Depth**: no shadows, no gradients, no glass, no decoration. Depth = photography + hairlines + near-black surface steps.
- **Backgrounds**: pure black; full-bleed photography is the only imagery (16:9 / 21:9, subject in motion). Until real photos are provided, use neutral #0d0d0d SVG placeholders with mono explainer text.
- **Interaction**: buttons are transparent outline pills — never filled. Inputs are underline-only (#3a3a3a → white on focus). Hover on links = ice-blue → white. No documented animations; keep motion to simple opacity fades if needed.
- **Dark only.** There is no light mode.

## Iconography
- No icon font bundled and none in the source. Use minimal unicode glyphs (→, ›, ⌕) as the system does; if more is needed, use a thin-stroke CDN set (Lucide) and flag it.
- No logos exist; render "MARQUE" (or the product name) in wordmark type: display 14px, +6px tracking, uppercase.
- No SVG/PNG icon assets were present in the source to copy.

## Index
- `styles.css` — global CSS entry (imports tokens + fonts)
- `tokens/` — `luxury.css` (all `--lux-*` tokens), `fonts.css` (Google Fonts: Saira Condensed / Cormorant Garamond / JetBrains Mono — substitutes for the proprietary faces)
- `guidelines/` — specimen cards + `DESIGN-source-analysis.md` (full source analysis with the complete component YAML)
- `components/core/` — Button, IconButton, TextLink, TextInput, Tag
- `components/content/` — SpecCell, CalloutCard, ModelCard, ArticleCard, ListingRow
- `components/layout/` — TopNav, HeroBand, CtaBand, SiteFooter
- `ui_kits/luxury/` — full-page starting-point layout
- `SKILL.md` — portable skill entry point

## Intentional additions
- None. Component inventory maps 1:1 to the source analysis `components:` YAML (date-pill + category-tag merged as `Tag`; wordmark folded into `TopNav`).

## Caveats
- Fonts are Google-Fonts substitutes for proprietary faces (documented in the source analysis). Provide real font files to replace `tokens/fonts.css` with `@font-face` rules.
- No real photography or logo assets were provided; all imagery is placeholder.
