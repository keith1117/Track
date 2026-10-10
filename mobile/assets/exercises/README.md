# Exercise illustrations

Generated with the built-in ImageGen tool, not an API/CLI fallback.

## Sources and display

- `chest-preview.png`: exact approved eight-exercise mockup. `chestIllustrationCrops` in `app.js` maps the eight exercise IDs to distinct illustration rectangles. CSS displays just those regions without editing the source bitmap. Names, weights, badges and percentages remain real HTML.
- `cardio-runner.png`: edited from the approved cardio preview to remove green highlighting and UI, retaining monochrome silver contour line art.
- The other 31 `<exercise-id>.png` files: individual transparent-background renders matched to the approved chest style. Each exercise has its own generated illustration, no generic letter placeholders. Cardio apparatus/mannequins are monochrome.
- All illustrations are decorative: their wrapping controls already carry the exercise name. Empty alt text avoids repeated screen-reader labels. Fixed thumbnail slots reserve layout space; images in lists load lazily.

`prompts.json` records the final prompts and generation mode. The original generated files remain in the Codex image directory; the application references only these workspace copies.

## Status

User approved implementation before refining all pose/apparatus details. These are prototype visuals, not certified training instructions or measured activation diagrams. Keep the existing disclaimer on participation percentages. Future corrections can replace an individual asset without changing the exercise ID or workout logic.
