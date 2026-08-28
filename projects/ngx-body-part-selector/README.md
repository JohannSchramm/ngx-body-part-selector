# ngx-body-part-selector

A tappable human body silhouette for selecting body parts, for Angular.

This is an Angular port of the Flutter/Dart [`body_part_selector`](https://github.com/timcreatedit/body_part_selector)
package (front/left/back/right silhouettes, ~24 selectable regions, and a
4-sided "turntable" rotation UI). It ships as a single library — the
original's separate `rotation_stage` subpackage is folded in as an internal
implementation detail here, not a public API.

## Installation

```bash
npm install ngx-body-part-selector
```

## Usage

Two standalone components are exported: `BodyPartSelectorComponent` (a
single fixed side) and `BodyPartSelectorTurnableComponent` (all four sides,
with drag-to-rotate / tap-to-rotate). Both are fully controlled — they take
no internal state, only a two-way `bodyParts` binding.

```ts
import { Component, signal } from '@angular/core';
import {
  BodyPartSelectorTurnableComponent,
  DEFAULT_BODY_PARTS,
} from 'ngx-body-part-selector';

@Component({
  selector: 'app-root',
  imports: [BodyPartSelectorTurnableComponent],
  template: `<ngx-body-part-selector-turnable [(bodyParts)]="bodyParts" />`,
})
export class AppComponent {
  protected readonly bodyParts = signal(DEFAULT_BODY_PARTS);
}
```

For a single fixed side, use `BodyPartSelectorComponent` directly:

```html
<ngx-body-part-selector [(bodyParts)]="bodyParts" side="front" />
```

### `BodyParts`

A plain object with 24 boolean fields (`head`, `neck`, `leftShoulder`,
`rightShoulder`, `abdomen`, `leftFoot`, `rightFoot`, ...). Use
`DEFAULT_BODY_PARTS` (all `false`) or `BODY_PARTS_ALL` (all `true`) as a
starting point, and `withToggledId(bodyParts, id, mirror?)` to toggle a part
by its string id — the same ids used as `<path id>` in the rendered SVG, so
this is also what you'd use to build your own custom UI against the same
model.

`mirror: true` also syncs the opposite side's counterpart to match (e.g.
toggling `leftKnee` with `mirror: true` also sets `rightKnee` to the same
new value) — this is what the `mirrored` input on both components enables
for user-driven clicks.

> **Note:** `vestibular` is part of the `BodyParts` model for API
> completeness (matching the original package), but has no corresponding
> region in the body silhouette — it's never rendered or clickable. It can
> still be set programmatically.

### `BodyPartSelectorComponent` inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `bodyParts` | `model<BodyParts>()` | *required* | Two-way selection state. |
| `side` | `BodySide` (`'front' \| 'left' \| 'back' \| 'right'`) | *required* | Which side to render. |
| `mirrored` | `boolean` | `false` | Sync left/right counterparts on click. |
| `selectedColor` | `string \| undefined` | theme default | Fill color for selected parts. |
| `unselectedColor` | `string \| undefined` | theme default | Fill color for unselected parts. |
| `selectedOutlineColor` | `string \| undefined` | theme default | Outline color for selected parts. |
| `unselectedOutlineColor` | `string \| undefined` | theme default | Outline color for unselected parts. |

### `BodyPartSelectorTurnableComponent` inputs

All of the above (except `side`, which cycles automatically) plus:

| Input | Type | Default | Description |
|---|---|---|---|
| `padding` | `string` | `'0'` | Outer CSS padding around each side's content. |
| `labelData` | `RotationStageLabelData` | English | `{ front, left, back, right }` label strings for the handle bar. |
| `barInteractable` | `boolean` | `true` | When `false`, the handle bar is no longer draggable (tap-to-select still works). |
| `barHeight` | `string` | `'64px'` | CSS height of the bottom handle bar. |

### Theming

Colors default to a built-in palette and can be overridden per-instance via
the inputs above, or globally via CSS custom properties on
`ngx-body-part-selector`:

```css
ngx-body-part-selector {
  --npbs-selected-color: #6750a4;
  --npbs-selected-outline-color: #4a3b78;
  --npbs-unselected-color: #ddd7e6;
  --npbs-unselected-outline-color: #a89fb8;
}
```

The outline color is a darker shade of its matching fill color in both
states, so the boundary between adjacent regions stays visible.

## Differences from the original Flutter package

This is a port, not a 1:1 transliteration — a few things were deliberately
changed for the web:

- **Rendering**: real inline SVG (`<svg><path>`) with native click handling
  and CSS transitions, instead of a `CustomPainter` + manual canvas
  hit-testing. Selection-change animation is now per-part (only the changed
  region's fill/stroke transitions), not a whole-scene crossfade.
- **No async SVG loading**: the silhouettes are bundled with the library and
  render synchronously — no loading spinner.
- **Rotation physics**: hand-rolled (pointer events + `requestAnimationFrame`)
  since there's no web equivalent of Flutter's `PageController` fling/snap
  behavior. The 3D flip's rotation direction is also mirrored relative to
  the Dart original's `Matrix4` transform — Flutter and CSS disagree on
  which way is "positive" around the Y axis for this kind of screen-space
  fake-3D rotation, so a literal sign port looked backwards.
- **Shortest-path rotation fix**: the original's `animateToSide` only
  corrected the "3 steps forward" wraparound case, not the symmetric "3
  steps backward" one, causing an unnecessarily long spin in one direction.
  This port corrects both directions.
- **`barInteractable`**: in the original, this only made the handle bar's
  chips visually transparent — the bar remained draggable regardless. Here
  it also disables the drag gesture.
- **API shape**: a two-way `bodyParts` model binding (`[(bodyParts)]`)
  instead of a separate value + change-callback pair.

## Development

This library lives in an Angular CLI workspace alongside a `demo` app used
for manual verification. From the workspace root:

```bash
npm install
npx ng test ngx-body-part-selector   # unit tests
npx ng build ngx-body-part-selector  # build the library
npx ng serve demo                    # run the demo app
```
