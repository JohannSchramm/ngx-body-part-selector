import { DEFAULT_ROTATION_DURATION_MS, RotationStageController } from './rotation-stage-controller';

describe('RotationStageController', () => {
  let controller: RotationStageController;
  let now: number;
  let pendingFrames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;

  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;
  let performanceNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    now = 1000;
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

    controller = new RotationStageController();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
    performanceNowSpy.mockRestore();
  });

  /** Advances the mocked clock and flushes any pending animation frame(s). */
  function advance(ms: number): void {
    now += ms;
    const callbacks = [...pendingFrames.values()];
    pendingFrames.clear();
    for (const cb of callbacks) {
      cb(now);
    }
  }

  describe('animateToPage', () => {
    it('animates page to the target over the given duration', () => {
      controller.animateToPage(2, 200);
      expect(controller.page()).toBe(0);

      advance(100);
      expect(controller.page()).toBeGreaterThan(0);
      expect(controller.page()).toBeLessThan(2);

      advance(100);
      expect(controller.page()).toBe(2);
    });

    it('does nothing if already at the target page', () => {
      advance(0);
      controller.animateToPage(0, 200);
      expect(pendingFrames.size).toBe(0);
      expect(controller.page()).toBe(0);
    });

    it('a new animation cancels an in-flight one', () => {
      controller.animateToPage(4, 200);
      advance(100);
      const midway = controller.page();
      expect(midway).toBeGreaterThan(0);

      controller.animateToPage(1, 200);
      advance(200);
      expect(controller.page()).toBe(1);
    });
  });

  describe('animateToSide', () => {
    it('takes the direct path for a 1-step forward rotation (front -> left)', () => {
      const spy = vi.spyOn(controller, 'animateToPage');
      controller.animateToSide('left');
      expect(spy).toHaveBeenCalledWith(1, DEFAULT_ROTATION_DURATION_MS, expect.any(Function));
    });

    it('takes the direct path for a 2-step rotation (front -> back)', () => {
      const spy = vi.spyOn(controller, 'animateToPage');
      controller.animateToSide('back');
      expect(spy).toHaveBeenCalledWith(2, DEFAULT_ROTATION_DURATION_MS, expect.any(Function));
    });

    it('wraps the shortest way for a 3-step forward rotation (front -> right)', () => {
      const spy = vi.spyOn(controller, 'animateToPage');
      controller.animateToSide('right');
      expect(spy).toHaveBeenCalledWith(-1, DEFAULT_ROTATION_DURATION_MS, expect.any(Function));
    });

    it('is a no-op when already on the target side', () => {
      const spy = vi.spyOn(controller, 'animateToPage');
      controller.animateToSide('front');
      expect(spy).not.toHaveBeenCalled();
    });

    it('wraps the shortest way for the symmetric backward case (fixed vs. the Dart original)', () => {
      // Starting on "right" (index 3) and rotating to "front" (index 0): the
      // Dart original's animateToSide only corrects the +3 forward case, so
      // it would animate 3 steps backward to page 0. This port corrects the
      // symmetric case too, taking the shortest 1-step path to page 4
      // instead (page 4 mod 4 is also "front").
      controller.page.set(3);
      const spy = vi.spyOn(controller, 'animateToPage');
      controller.animateToSide('front');
      expect(spy).toHaveBeenCalledWith(4, DEFAULT_ROTATION_DURATION_MS, expect.any(Function));
    });
  });

  describe('drag', () => {
    it('dragging left (negative deltaX) advances the page forward', () => {
      controller.startDrag(100);
      controller.dragTo(20, 80);
      expect(controller.page()).toBe(1);
    });

    it('dragging right (positive deltaX) moves the page backward', () => {
      controller.startDrag(100);
      controller.dragTo(180, 80);
      expect(controller.page()).toBe(-1);
    });

    it('endDrag snaps to the nearest whole page', () => {
      controller.startDrag(100);
      controller.dragTo(45, 80);
      expect(controller.page()).toBeCloseTo(0.6875);

      controller.endDrag();
      advance(DEFAULT_ROTATION_DURATION_MS);
      expect(controller.page()).toBe(1);
    });

    it('starting a drag cancels any in-flight animation', () => {
      controller.animateToPage(3, 200);
      advance(100);
      const midway = controller.page();

      controller.startDrag(0);
      controller.dragTo(0, 80);
      expect(controller.page()).toBe(midway);
    });
  });

  describe('dispose', () => {
    it('cancels any pending animation frame', () => {
      controller.animateToPage(2, 200);
      expect(pendingFrames.size).toBe(1);

      controller.dispose();
      expect(pendingFrames.size).toBe(0);
    });
  });
});
