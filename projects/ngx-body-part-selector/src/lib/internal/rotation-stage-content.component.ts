import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { BodyPartSelectorComponent } from '../body-part-selector/body-part-selector.component';
import { BodySide } from '../models/body-side';
import { BodyParts } from '../models/body-parts';
import { easeOutExpo } from './easing';
import { mapRotationStageSide, rotationStageSideForIndex } from './rotation-stage-side';
import { RotationStageController } from './rotation-stage-controller';

interface ContentPanel {
  readonly index: number;
  readonly bodySide: BodySide;
  readonly opacity: number;
  readonly transform: string;
  readonly interactive: boolean;
}

/**
 * Renders the "3D flip" body silhouette stack, driven by the live
 * fractional page position of a {@link RotationStageController}.
 *
 * Port of the Dart package's `RotationStageContent`. Only the currently
 * centered (rounded) panel is pointer-interactive; a mid-transition
 * neighbor panel is rendered but not interactive, matching the original's
 * `IgnorePointer(ignoring: i != index)`. The Y-axis rotation + perspective
 * + eased-opacity fade replicate the original's `Matrix4` transform, using
 * CSS `perspective()`/`rotateY()` instead — the perspective px value has no
 * exact mathematical equivalent to Flutter's unitless matrix perspective
 * term, so it's tuned empirically to look right.
 *
 * Deviation: the rotation angle's sign is the opposite of the Dart
 * original's `rotateY(-diff * pi/2)`. Flutter's `Matrix4`/`vector_math`
 * and CSS's `rotateY()` disagree on which way is "positive" around the Y
 * axis for this kind of screen-space fake-3D transform, so a literal sign
 * port produced a visually mirrored (backwards) rotation on the web.
 */
@Component({
  selector: 'ngx-rotation-stage-content',
  standalone: true,
  imports: [BodyPartSelectorComponent],
  templateUrl: './rotation-stage-content.component.html',
  styleUrl: './rotation-stage-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationStageContentComponent {
  readonly controller = input.required<RotationStageController>();
  readonly bodyParts = model.required<BodyParts>();
  readonly mirrored = input(false);
  /** Caller-provided outer padding; a fixed 16px inner padding is always applied too. */
  readonly padding = input('0');

  readonly selectedColor = input<string | undefined>(undefined);
  readonly unselectedColor = input<string | undefined>(undefined);
  readonly selectedOutlineColor = input<string | undefined>(undefined);
  readonly unselectedOutlineColor = input<string | undefined>(undefined);

  protected readonly panels = computed<ContentPanel[]>(() => {
    const page = this.controller().page();
    const centerIndex = Math.round(page);
    // The two panels bracketing a fractional page are always the integers
    // immediately below and above it (e.g. page 0.3 -> [0, 1]) -- NOT
    // centerIndex +/- 1, which would skip the current side entirely and
    // instead show two unrelated, two-steps-apart sides.
    const indices = Number.isInteger(page)
      ? [centerIndex]
      : [Math.floor(page), Math.floor(page) + 1];

    return indices.map((i) => {
      const diff = i - page;
      const opacityRaw = Math.min(1, Math.max(0, 1 - Math.abs(diff)));
      const opacity = easeOutExpo(opacityRaw);
      const rotateYDeg = diff * 90;
      const side = rotationStageSideForIndex(i);
      const bodySide = mapRotationStageSide<BodySide>(side, {
        front: 'front',
        left: 'left',
        back: 'back',
        right: 'right',
      });

      return {
        index: i,
        bodySide,
        opacity,
        transform: `perspective(1200px) rotateY(${rotateYDeg}deg)`,
        interactive: i === centerIndex,
      };
    });
  });
}
