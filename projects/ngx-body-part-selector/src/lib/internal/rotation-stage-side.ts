/**
 * The four sides of a {@link RotationStageController}, in clockwise
 * rotation order (front → left → back → right) as viewed by an observer.
 *
 * Mirrors {@link BodySide} 1:1 — kept as a distinct type since the rotation
 * machinery is a generic internal building block, independent of the
 * body-part domain.
 */
export type RotationStageSide = 'front' | 'left' | 'back' | 'right';

export const ROTATION_STAGE_SIDE_ORDER: readonly RotationStageSide[] = [
  'front',
  'left',
  'back',
  'right',
];

/**
 * Returns the {@link RotationStageSide} for the given index, wrapping
 * around for any integer (including negative ones).
 *
 * Uses a true mathematical modulo rather than JS/TS's `%` operator, which
 * returns negative results for negative operands (unlike Dart's `%`) — this
 * matters because the rotation controller's page value can go negative.
 */
export function rotationStageSideForIndex(index: number): RotationStageSide {
  const length = ROTATION_STAGE_SIDE_ORDER.length;
  const wrapped = ((index % length) + length) % length;
  return ROTATION_STAGE_SIDE_ORDER[wrapped];
}

/**
 * Exhaustively maps a {@link RotationStageSide} to a value of type `T`.
 */
export function mapRotationStageSide<T>(
  side: RotationStageSide,
  cases: { front: T; left: T; back: T; right: T },
): T {
  return cases[side];
}
