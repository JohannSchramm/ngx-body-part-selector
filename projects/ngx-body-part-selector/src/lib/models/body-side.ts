/**
 * The four sides of the body that can be displayed.
 *
 * The order (front, left, back, right) represents clockwise rotation order
 * as viewed by an observer, matching the four SVG assets.
 */
export type BodySide = 'front' | 'left' | 'back' | 'right';

export const BODY_SIDE_ORDER: readonly BodySide[] = ['front', 'left', 'back', 'right'];

/**
 * Returns the {@link BodySide} for the given index, wrapping around for any
 * integer (including negative ones).
 */
export function bodySideForIndex(index: number): BodySide {
  const length = BODY_SIDE_ORDER.length;
  const wrapped = ((index % length) + length) % length;
  return BODY_SIDE_ORDER[wrapped];
}

/**
 * Exhaustively maps a {@link BodySide} to a value of type `T`.
 */
export function mapBodySide<T>(
  side: BodySide,
  cases: { front: T; left: T; back: T; right: T },
): T {
  return cases[side];
}
