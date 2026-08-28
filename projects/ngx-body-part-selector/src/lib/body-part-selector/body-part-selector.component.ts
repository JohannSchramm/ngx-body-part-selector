import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { svgForSide } from '../assets/svg-path-data';
import { BodySide } from '../models/body-side';
import { BodyParts, getBodyPart, withToggledId } from '../models/body-parts';

/**
 * Renders a tappable body silhouette for a single {@link BodySide}, letting
 * the user toggle the selection of individual body parts.
 *
 * Fully controlled: this component holds no selection state of its own —
 * `bodyParts` is a two-way `model()` binding owned by the caller.
 */
@Component({
  selector: 'ngx-body-part-selector',
  standalone: true,
  templateUrl: './body-part-selector.component.html',
  styleUrl: './body-part-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyPartSelectorComponent {
  readonly bodyParts = model.required<BodyParts>();
  readonly side = input.required<BodySide>();
  readonly mirrored = input(false);

  readonly selectedColor = input<string | undefined>(undefined);
  readonly unselectedColor = input<string | undefined>(undefined);
  readonly selectedOutlineColor = input<string | undefined>(undefined);
  readonly unselectedOutlineColor = input<string | undefined>(undefined);

  protected readonly svgData = computed(() => svgForSide(this.side()));

  protected isSelected(id: string): boolean {
    return getBodyPart(this.bodyParts(), id);
  }

  protected toggle(id: string): void {
    this.bodyParts.set(withToggledId(this.bodyParts(), id, this.mirrored()));
  }
}
