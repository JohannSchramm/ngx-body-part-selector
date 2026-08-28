# ngx-body-part-selector workspace

Angular CLI workspace for [`ngx-body-part-selector`](projects/ngx-body-part-selector/README.md),
an Angular port of the Flutter/Dart [`body_part_selector`](https://github.com/timcreatedit/body_part_selector) package.

- `projects/ngx-body-part-selector` — the publishable library. See its
  [README](projects/ngx-body-part-selector/README.md) for usage, API, and a
  list of deliberate differences from the original Flutter package.
- `projects/demo` — a small app (not published) for manually exercising and
  visually verifying both exported components.

## Getting started

```bash
npm install
npx ng serve demo          # open http://localhost:4200
npx ng test ngx-body-part-selector
npx ng build ngx-body-part-selector
```

The demo app resolves `ngx-body-part-selector` from `dist/`, so rebuild the
library (`npx ng build ngx-body-part-selector`) after changing its source
for the demo to pick up the change (or run both in parallel with
`--watch`).
