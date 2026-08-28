import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  BodyPartSelectorComponent,
  BodyPartSelectorTurnableComponent,
  BodySide,
  DEFAULT_BODY_PARTS,
} from 'ngx-body-part-selector';

@Component({
  imports: [BodyPartSelectorComponent, BodyPartSelectorTurnableComponent, JsonPipe],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly turnableBodyParts = signal(DEFAULT_BODY_PARTS);
  protected readonly staticBodyParts = signal(DEFAULT_BODY_PARTS);

  protected readonly side = signal<BodySide>('front');
  protected readonly mirrored = signal(false);

  protected readonly sides: BodySide[] = ['front', 'left', 'back', 'right'];
}
