import { signal, WritableSignal } from '@angular/core';

import { EASE, EasingFn } from './easing';
import { ROTATION_STAGE_SIDE_ORDER, RotationStageSide } from './rotation-stage-side';

/**
 * Default rotation animation duration. Slower than the Dart original's
 * `kThemeAnimationDuration` (200ms) -- on the web, at typical viewing sizes,
 * 200ms reads as an abrupt snap rather than a visible flip.
 */
export const DEFAULT_ROTATION_DURATION_MS = 500;

/**
 * Drives the current fractional "page" position of a rotation stage (the
 * turntable UI backing {@link BodyPartSelectorTurnableComponent}), and
 * animates between pages/sides.
 *
 * Port of the Dart package's `RotationStageController`. Differs from the
 * original in two deliberate ways:
 *
 * - There is no `kInfiniteScrollStartPage` offset: the Dart controller
 *   starts its internal page counter at 500 purely to work around
 *   Flutter's `PageController` not accepting negative indices. This
 *   controller has no such constraint, so `page` starts at 0 and can go
 *   negative; `rotationStageSideForIndex` handles the wraparound correctly.
 * - `animateToSide`'s shortest-path calculation is symmetric in both
 *   directions. The Dart original only corrects the "+3 steps forward"
 *   wraparound case (`difference > 2`), not the symmetric "-3 steps
 *   backward" case, which meant rotating backward across that boundary
 *   took a needlessly long 3-step animation instead of the shortest
 *   1-step one. This is very likely an oversight rather than an
 *   intentional design choice, so the fix is applied here.
 *
 * There is also no direct equivalent of Flutter's `PageController`
 * fling/snap-to-page physics on the web, so drag handling here is
 * hand-rolled: `startDrag`/`dragTo`/`endDrag` update `page` live from
 * pointer deltas, and `endDrag` snaps to the nearest whole page via
 * `animateToPage`. `page` is driven by `requestAnimationFrame` (not CSS
 * transitions) so that dependent visual computations (the 3D flip
 * transform, the handle bar opacity) can read a live interpolated number
 * every frame via a plain signal.
 */
export class RotationStageController {
  readonly page: WritableSignal<number> = signal(0);

  private animationFrameId: number | null = null;
  private dragging = false;
  private dragStartClientX = 0;
  private dragStartPage = 0;

  animateToPage(
    targetPage: number,
    durationMs = DEFAULT_ROTATION_DURATION_MS,
    easing: EasingFn = EASE,
  ): void {
    this.cancelAnimation();

    const startPage = this.page();
    if (startPage === targetPage) {
      return;
    }

    const startTime =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

    const step = (now: number): void => {
      const elapsed = now - startTime;
      const t = durationMs <= 0 ? 1 : Math.min(1, elapsed / durationMs);
      const eased = easing(t);
      this.page.set(startPage + (targetPage - startPage) * eased);

      if (t < 1) {
        this.animationFrameId = requestAnimationFrame(step);
      } else {
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  animateToSide(
    side: RotationStageSide,
    durationMs = DEFAULT_ROTATION_DURATION_MS,
    easing: EasingFn = EASE,
  ): void {
    const sideCount = ROTATION_STAGE_SIDE_ORDER.length;
    const currentIndex = ((Math.round(this.page()) % sideCount) + sideCount) % sideCount;
    const targetIndex = ROTATION_STAGE_SIDE_ORDER.indexOf(side);

    let difference = targetIndex - currentIndex;
    if (difference > sideCount / 2) {
      difference -= sideCount;
    } else if (difference < -(sideCount / 2)) {
      difference += sideCount;
    }

    const targetPage = Math.round(this.page()) + difference;
    if (targetPage === this.page()) {
      return;
    }

    this.animateToPage(targetPage, durationMs, easing);
  }

  startDrag(clientX: number): void {
    this.cancelAnimation();
    this.dragging = true;
    this.dragStartClientX = clientX;
    this.dragStartPage = this.page();
  }

  dragTo(clientX: number, pxPerPage: number): void {
    if (!this.dragging || pxPerPage <= 0) {
      return;
    }
    const deltaX = clientX - this.dragStartClientX;
    this.page.set(this.dragStartPage - deltaX / pxPerPage);
  }

  endDrag(): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    this.animateToPage(Math.round(this.page()));
  }

  dispose(): void {
    this.cancelAnimation();
  }

  private cancelAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
