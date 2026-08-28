import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyPartSelectorComponent } from './body-part-selector.component';
import { DEFAULT_BODY_PARTS } from '../models/body-parts';

describe('BodyPartSelectorComponent', () => {
  let fixture: ComponentFixture<BodyPartSelectorComponent>;
  let component: BodyPartSelectorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyPartSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BodyPartSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bodyParts', DEFAULT_BODY_PARTS);
    fixture.componentRef.setInput('side', 'front');
    fixture.detectChanges();
  });

  function pathElement(id: string): SVGPathElement {
    const el = fixture.nativeElement.querySelector(`#${id}`) as SVGPathElement | null;
    if (!el) {
      throw new Error(`No path with id "${id}" found`);
    }
    return el;
  }

  function click(el: Element): void {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  it('renders the neck path for the front side, unselected by default', () => {
    const neck = pathElement('neck');
    expect(neck.classList.contains('selected')).toBe(false);
  });

  it('clicking a path toggles it on and updates the bodyParts model', () => {
    click(pathElement('head'));
    fixture.detectChanges();

    expect(component.bodyParts().head).toBe(true);
    expect(pathElement('head').classList.contains('selected')).toBe(true);
  });

  it('clicking a selected path toggles it back off', () => {
    fixture.componentRef.setInput('bodyParts', { ...DEFAULT_BODY_PARTS, head: true });
    fixture.detectChanges();

    click(pathElement('head'));
    fixture.detectChanges();

    expect(component.bodyParts().head).toBe(false);
  });

  it('mirrored mode syncs the counterpart part when toggling', () => {
    fixture.componentRef.setInput('mirrored', true);
    fixture.detectChanges();

    click(pathElement('leftShoulder'));
    fixture.detectChanges();

    const bp = component.bodyParts();
    expect(bp.leftShoulder).toBe(true);
    expect(bp.rightShoulder).toBe(true);
  });

  it('does not mirror when mirrored is false', () => {
    click(pathElement('leftShoulder'));
    fixture.detectChanges();

    const bp = component.bodyParts();
    expect(bp.leftShoulder).toBe(true);
    expect(bp.rightShoulder).toBe(false);
  });
});
