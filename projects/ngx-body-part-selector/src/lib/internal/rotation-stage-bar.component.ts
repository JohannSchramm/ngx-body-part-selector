import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
} from '@angular/core';

import { EASE } from './easing';
import { RotationStageHandleComponent } from './rotation-stage-handle.component';
import {
  ENGLISH_ROTATION_STAGE_LABELS,
  RotationStageLabelData,
} from './rotation-stage-labels';
import {
  mapRotationStageSide,
  ROTATION_STAGE_SIDE_ORDER,
  RotationStageSide,
} from './rotation-stage-side';
import { RotationStageController } from './rotation-stage-controller';

/** Matches the Dart original's default `RotationStageController(viewportFraction: 0.2)`. */
const VIEWPORT_FRACTION = 0.2;
const MIN_HANDLE_OPACITY = 0;

interface BarHandle {
  readonly side: RotationStageSide;
  readonly label: string;
  readonly index: number;
  readonly opacity: number;
  readonly active: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function labelForSide(data: RotationStageLabelData, side: RotationStageSide): string {
  return mapRotationStageSide(side, {
    front: data.front,
    left: data.left,
    back: data.back,
    right: data.right,
  });
}

/**
 * The turntable's bottom handle strip. Renders a chip per side and is the
 * only place pointer drag handling lives — the content area above
 * deliberately has no gesture handling of its own, matching the design
 * intent stated in the Dart `rotation_stage` package's README ("the top
 * part is purposefully not swipeable").
 *
 * Deviation from the Dart original: there, `barInteractable: false` only
 * makes the handle chips visually transparent — the bar remains swipeable
 * regardless of the flag, which reads as an oversight. Here, `false` also
 * disables the drag handlers (tap-to-select via a handle click still
 * works either way, matching the original).
 */
@Component({
  selector: 'ngx-rotation-stage-bar',
  standalone: true,
  imports: [RotationStageHandleComponent],
  templateUrl: './rotation-stage-bar.component.html',
  styleUrl: './rotation-stage-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationStageBarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly controller = input.required<RotationStageController>();
  readonly labelData = input<RotationStageLabelData>(ENGLISH_ROTATION_STAGE_LABELS);
  readonly barInteractable = input(true);

  protected readonly backgroundTransparent = computed(() => !this.barInteractable());

  protected readonly handles = computed<BarHandle[]>(() => {
    const page = this.controller().page();
    const labels = this.labelData();
    const sideCount = ROTATION_STAGE_SIDE_ORDER.length;
    const activeSide = ROTATION_STAGE_SIDE_ORDER[((Math.round(page) % sideCount) + sideCount) % sideCount];
    const visOffset = 0.5 / VIEWPORT_FRACTION;

    return ROTATION_STAGE_SIDE_ORDER.map((side, index) => {
      // `page` is unbounded (it can wrap past the fixed 0..3 handle
      // indices, e.g. page = -1 also represents index 3 / "right"), so
      // distance is measured to whichever repetition of this handle's
      // index (index, index ± 4, index ± 8, ...) is nearest to `page`.
      const nearestIndex = index + sideCount * Math.round((page - index) / sideCount);
      const offset = clamp(Math.abs(page - nearestIndex), 0, visOffset) / visOffset;
      const opacityRaw = lerp(MIN_HANDLE_OPACITY, 1, 1 - offset);
      return {
        side,
        label: labelForSide(labels, side),
        index,
        opacity: EASE(opacityRaw),
        active: side === activeSide,
      };
    });
  });

  private dragging = false;
  private pxPerPage = 0;

  protected onHandleTap(side: RotationStageSide): void {
    this.controller().animateToSide(side);
  }

  @HostListener('pointerdown', ['$event'])
  protected onPointerDown(event: PointerEvent): void {
    if (!this.barInteractable()) {
      return;
    }
    this.dragging = true;
    this.pxPerPage = this.elementRef.nativeElement.clientWidth * VIEWPORT_FRACTION;
    (event.target as Element | null)?.setPointerCapture?.(event.pointerId);
    this.controller().startDrag(event.clientX);
  }

  @HostListener('pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.controller().dragTo(event.clientX, this.pxPerPage);
  }

  @HostListener('pointerup')
  @HostListener('pointercancel')
  protected onPointerUp(): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    this.controller().endDrag();
  }
}
