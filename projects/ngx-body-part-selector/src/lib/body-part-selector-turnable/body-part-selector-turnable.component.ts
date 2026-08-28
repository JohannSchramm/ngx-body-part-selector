import { ChangeDetectionStrategy, Component, input, model, OnDestroy } from '@angular/core';

import { BodyParts } from '../models/body-parts';
import { RotationStageBarComponent } from '../internal/rotation-stage-bar.component';
import { RotationStageContentComponent } from '../internal/rotation-stage-content.component';
import { RotationStageController } from '../internal/rotation-stage-controller';
import {
  ENGLISH_ROTATION_STAGE_LABELS,
  RotationStageLabelData,
} from '../internal/rotation-stage-labels';

/**
 * Wraps {@link BodyPartSelectorComponent} in a 4-sided "turntable" UI: drag
 * or tap the bottom bar to rotate between front/left/back/right, with a
 * 3D-flip transition between sides.
 *
 * Port of the Dart package's `BodyPartSelectorTurnable`, which composed a
 * separate `rotation_stage` package's generic `RotationStage` widget. Here
 * that machinery is folded in as a non-exported internal implementation
 * detail (`../internal/*`) — this component is the only public surface for
 * it, per the decision to ship a single library with no internal
 * sub-packages and a body-part-specific public API only.
 */
@Component({
  selector: 'ngx-body-part-selector-turnable',
  standalone: true,
  imports: [RotationStageContentComponent, RotationStageBarComponent],
  templateUrl: './body-part-selector-turnable.component.html',
  styleUrl: './body-part-selector-turnable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyPartSelectorTurnableComponent implements OnDestroy {
  readonly bodyParts = model.required<BodyParts>();
  readonly mirrored = input(false);

  readonly selectedColor = input<string | undefined>(undefined);
  readonly unselectedColor = input<string | undefined>(undefined);
  readonly selectedOutlineColor = input<string | undefined>(undefined);
  readonly unselectedOutlineColor = input<string | undefined>(undefined);

  /** Caller-provided outer padding around each side's content; matches the Dart default of none. */
  readonly padding = input('0');
  readonly labelData = input<RotationStageLabelData>(ENGLISH_ROTATION_STAGE_LABELS);
  readonly barInteractable = input(true);
  readonly barHeight = input('64px');

  protected readonly controller = new RotationStageController();

  ngOnDestroy(): void {
    this.controller.dispose();
  }
}
