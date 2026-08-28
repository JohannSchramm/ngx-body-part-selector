import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * A single toggle chip in the turntable's bottom handle bar, representing
 * one side. Direct port of the Dart package's `RotationStageHandle` — no
 * special animation logic here beyond what {@link RotationStageBarComponent}
 * already computes for its opacity.
 */
@Component({
  selector: 'ngx-rotation-stage-handle',
  standalone: true,
  templateUrl: './rotation-stage-handle.component.html',
  styleUrl: './rotation-stage-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotationStageHandleComponent {
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly backgroundTransparent = input(false);

  readonly handleTap = output<void>();
}
