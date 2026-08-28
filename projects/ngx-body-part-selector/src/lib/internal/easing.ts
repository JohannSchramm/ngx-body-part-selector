export type EasingFn = (t: number) => number;

/**
 * Port of Flutter's `Curves.easeOutExpo`. Used for the content panels'
 * opacity during rotation — has an exact closed form, unlike the generic
 * cubic-bezier curves.
 */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Builds a cubic-bezier easing function equivalent to CSS's `cubic-bezier`
 * timing function / Flutter's `Cubic` curve, evaluated at control points
 * (p1x, p1y) and (p2x, p2y) (the curve always starts at (0,0) and ends at
 * (1,1)).
 *
 * Resolves x -> t via Newton-Raphson (falling back to bisection), then
 * evaluates y(t) — the standard approach used by browsers and easing
 * libraries for CSS timing functions.
 */
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number): EasingFn {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t: number): number {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t: number): number {
    return ((ay * t + by) * t + cy) * t;
  }

  function sampleCurveDerivativeX(t: number): number {
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  function solveCurveX(x: number): number {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t) - x;
      if (Math.abs(x2) < 1e-6) {
        return t;
      }
      const d2 = sampleCurveDerivativeX(t);
      if (Math.abs(d2) < 1e-6) {
        break;
      }
      t -= x2 / d2;
    }

    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const x2 = sampleCurveX(t);
      if (Math.abs(x2 - x) < 1e-6) {
        return t;
      }
      if (x > x2) {
        lo = t;
      } else {
        hi = t;
      }
      t = (hi - lo) / 2 + lo;
    }
    return t;
  }

  return (x: number): number => {
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }
    return sampleCurveY(solveCurveX(x));
  };
}

/**
 * Port of Flutter's default animation curve, `Curves.ease`
 * (`Cubic(0.25, 0.1, 0.25, 1.0)`), identical to CSS's `ease` keyword.
 */
export const EASE: EasingFn = cubicBezier(0.25, 0.1, 0.25, 1.0);
