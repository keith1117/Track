# English-first localization QA

Plan date: 2026-10-10. Actual execution and browser checks: 2026-10-12.

## Verification evidence

- Baseline 26 tests; after tasks 1–5, 64 tests pass on Node 24.19.0.
- Real browser uses the Codex in-app browser, localhost only. Existing user history is not cleared or modified for test setup.
- Normal server: explicit preview flag off, default English, no locale switcher. English navigation, accessible labels and all seven training entries observed.
- ImageGen copies inspected against both originals before integration. Original hashes are asserted by tests; all six crop rectangles fit actual PNG dimensions.

## Browser regression test: card alignment

Before CSS correction, a read-only DOM assertion failed for all six cards: computed align-items was flex-end and padding-top 14px instead of stretch and at least 32px. The later generic card rule overrode the anatomy rule at equal specificity. This made short status text shift right and allowed the badge to overlap the illustration.

| Before | After | Why |
| --- | --- | --- |
| Anatomy rule had the same specificity as the later generic card rule | Scope it to .body-grid .body-card.anatomy-card | Preserve left-aligned text and reserved badge clearance without changing other cards |

The browser regression assertion checks every .anatomy-card with getComputedStyle: alignItems === 'stretch' and paddingTop === '32px'. After reload this passed for all six cards at 390 CSS pixels. Read-only browser evaluation does not expose parseFloat, so the regression assertion compares the declared 32px clearance directly.

## Input preservation and display regression evidence

Browser input preservation passed: 75.5 kg / 8 reps / completed set survived English→Chinese and Free→Pro; 31 minutes / 5.2 km survived Chinese→English. Saving and completion were exercised only on a separate QA origin, 127.0.0.1:4175, explicitly started with TRACK_LOCALE_PREVIEW=1. Normal preview remains on 4173.

A second browser finding: existing toast text stayed in its previous language after switching. The new test `an existing toast follows a language change without resetting training` failed with the old English text, then passed after keeping its message key and reformatting it on locale changes. The timer is not restarted and training state is unchanged.

Language control visual regression: active and inactive languages initially had the same browser-default background. A real DOM assertion failed, then scoped theme styling was added so the selected language has a distinct surface and border, with 44px controls. This affects only the explicitly enabled bilingual preview/public-language selector.

320px table regression: the English Complete column extended 3px beyond its 44px grid slot. A real DOM assertion failed before correction; the shared header/row slot was increased to 52px, keeping the completion button 44px and input text 16px, without shortening or shrinking the label.

History regression tests failed for `1 sets` and a date-only March 8 bucket displayed as March 7 under America/New_York. Entry summaries now use English one/other forms. Date-only trend labels render the existing UTC calendar bucket; full timestamp display remains local. No aggregation or persisted timestamp was changed.

At 320px the English coach question chips required 52px of horizontal scrolling. The DOM assertion failed first; the question row now wraps naturally, preserves 44px touch targets and does not shrink the text. The Chinese row also remains within its container.

## Browser coverage

221 real browser measurements were collected, including pre-fix failures. The latest measurement for each width/language/page produced 79 layout cases with no remaining page overflow, checked text overflow or broken loaded images. These cover all 18 page IDs, English and Chinese, and 320×740, 390×844 and 430×932 CSS viewports. Full UI tours covered English Free at 320, English Pro at 390, Chinese Free at 390 and Chinese Pro at 430, plus complementary narrow/wide and long exercise name cases. The Free coach entry correctly shows the subscription prototype; the coach itself is checked after the explicitly labeled Pro trial. The automated suite separately covers every view in both plan states.

Normal service at 4173 was navigated to `/?locale=zh-CN`: observed html lang remained en and locale control count was zero. Internal QA service at 4175 permits Chinese only because it was explicitly started in preview mode. Browser console error/warning lists were empty for the final English and Chinese previews.

Viewport override was reset. Previously resized test tabs retained their per-tab sizes, so they were closed and replaced by fresh default-size previews. Both fresh previews measured 1280×720; the English desktop phone frame measured 390×696 at x=445,y=12, with no content overflow. Only task-created test tabs were closed; saved QA fixture records remain on the separate 4175 origin.

## Real screenshots

- English body cards: C:/10_software_dev/Track/docs/qa/screenshots/2026-10-12-en-body.jpg (390×844).
- English monochrome cardio: C:/10_software_dev/Track/docs/qa/screenshots/2026-10-12-en-cardio.jpg (390×844).
- English exercise illustrations: C:/10_software_dev/Track/docs/qa/screenshots/2026-10-12-en-exercises.jpg (390×844).
- Chinese body-card preview: C:/10_software_dev/Track/docs/qa/screenshots/2026-10-12-zh-body.jpg (430×932).

## Explicit limitations

- Direct file opening was attempted, but the browser tool security policy permits only HTTP/HTTPS and blocked file://. No workaround was attempted. Local script ordering, generated messages and assets are checked without JSON fetching, but a real browser file-open result is not claimed.
- Real-phone keyboard, touch, safe-area and browser chrome behavior are not verified by desktop emulation and remain hardware checks.
- Existing exercise illustrations still require the separately requested future professional movement review. No movement anatomy was regenerated in this localization task; edited body copies are not a medical certification.
- Final independent review and GitHub CI results are recorded after task 7.
