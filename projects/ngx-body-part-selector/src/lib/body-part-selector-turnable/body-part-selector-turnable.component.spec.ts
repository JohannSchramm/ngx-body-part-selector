import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyPartSelectorTurnableComponent } from './body-part-selector-turnable.component';
import { DEFAULT_BODY_PARTS } from '../models/body-parts';

describe('BodyPartSelectorTurnableComponent', () => {
  let fixture: ComponentFixture<BodyPartSelectorTurnableComponent>;

  let now: number;
  let pendingFrames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;
  let performanceNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    now = 0;
    pendingFrames = new Map();
    nextFrameId = 1;

    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;

    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number => {
      const id = nextFrameId++;
      pendingFrames.set(id, cb);
      return id;
    }) as typeof requestAnimationFrame;

    globalThis.cancelAnimationFrame = ((id: number): void => {
      pendingFrames.delete(id);
    }) as typeof cancelAnimationFrame;

    performanceNowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);

    await TestBed.configureTestingModule({
      imports: [BodyPartSelectorTurnableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BodyPartSelectorTurnableComponent);
    fixture.componentRef.setInput('bodyParts', DEFAULT_BODY_PARTS);
    fixture.detectChanges();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
    performanceNowSpy.mockRestore();
  });

  /** Flushes enough animation frames to fully settle any in-flight rotation animation. */
  function settle(): void {
    now += 600;
    const callbacks = [...pendingFrames.values()];
    pendingFrames.clear();
    for (const cb of callbacks) {
      cb(now);
    }
    fixture.detectChanges();
  }

  function activeSide(): string | null {
    const panels: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('ngx-rotation-stage-content .panel'),
    );
    const interactive = panels.filter((panel) => panel.style.pointerEvents !== 'none');
    expect(interactive.length).toBe(1);
    return interactive[0].querySelector('svg')?.getAttribute('aria-label') ?? null;
  }

  function handleButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button.handle'));
  }

  function clickHandle(label: string): void {
    const button = handleButtons().find((b) => b.textContent?.trim() === label);
    if (!button) {
      throw new Error(`No handle button found for label "${label}"`);
    }
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('shows the front side by default, and only the front side', () => {
    expect(activeSide()).toBe('front');
  });

  it('renders a handle for all four sides, with Front active by default', () => {
    const buttons = handleButtons();
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toEqual(expect.arrayContaining(['Front', 'Left', 'Back', 'Right']));

    const front = buttons.find((b) => b.textContent?.trim() === 'Front');
    expect(front?.classList.contains('active')).toBe(true);
  });

  it.each([
    ['Left', 'left'],
    ['Back', 'back'],
    ['Right', 'right'],
    ['Front', 'front'],
  ])('tapping the %s handle rotates to and shows only that side', (label, side) => {
    clickHandle(label);
    settle();

    expect(activeSide()).toBe(side);

    const active = handleButtons().find((b) => b.textContent?.trim() === label);
    expect(active?.classList.contains('active')).toBe(true);
  });
});
