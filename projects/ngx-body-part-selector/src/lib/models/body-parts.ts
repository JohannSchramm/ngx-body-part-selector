/**
 * The different parts of the body that can be selected, and whether they
 * are.
 *
 * `vestibular` has no corresponding path in any of the four body SVGs — it
 * exists for API/data completeness only and is never visually rendered or
 * clickable by {@link BodyPartSelectorComponent}. It can still be toggled
 * programmatically via {@link withToggledId} or by constructing a
 * {@link BodyParts} object directly.
 */
export interface BodyParts {
  head: boolean;
  neck: boolean;
  leftShoulder: boolean;
  leftUpperArm: boolean;
  leftElbow: boolean;
  leftLowerArm: boolean;
  leftHand: boolean;
  rightShoulder: boolean;
  rightUpperArm: boolean;
  rightElbow: boolean;
  rightLowerArm: boolean;
  rightHand: boolean;
  upperBody: boolean;
  lowerBody: boolean;
  leftUpperLeg: boolean;
  leftKnee: boolean;
  leftLowerLeg: boolean;
  leftFoot: boolean;
  rightUpperLeg: boolean;
  rightKnee: boolean;
  rightLowerLeg: boolean;
  rightFoot: boolean;
  abdomen: boolean;
  vestibular: boolean;
}

/** A {@link BodyParts} selection with every part unselected. */
export const DEFAULT_BODY_PARTS: BodyParts = {
  head: false,
  neck: false,
  leftShoulder: false,
  leftUpperArm: false,
  leftElbow: false,
  leftLowerArm: false,
  leftHand: false,
  rightShoulder: false,
  rightUpperArm: false,
  rightElbow: false,
  rightLowerArm: false,
  rightHand: false,
  upperBody: false,
  lowerBody: false,
  leftUpperLeg: false,
  leftKnee: false,
  leftLowerLeg: false,
  leftFoot: false,
  rightUpperLeg: false,
  rightKnee: false,
  rightLowerLeg: false,
  rightFoot: false,
  abdomen: false,
  vestibular: false,
};

/** A {@link BodyParts} selection with every part selected. */
export const BODY_PARTS_ALL: BodyParts = {
  head: true,
  neck: true,
  leftShoulder: true,
  leftUpperArm: true,
  leftElbow: true,
  leftLowerArm: true,
  leftHand: true,
  rightShoulder: true,
  rightUpperArm: true,
  rightElbow: true,
  rightLowerArm: true,
  rightHand: true,
  upperBody: true,
  lowerBody: true,
  leftUpperLeg: true,
  leftKnee: true,
  leftLowerLeg: true,
  leftFoot: true,
  rightUpperLeg: true,
  rightKnee: true,
  rightLowerLeg: true,
  rightFoot: true,
  abdomen: true,
  vestibular: true,
};

/**
 * Returns whether the body part identified by `id` is selected in
 * `bodyParts`. Returns `false` for an `id` that isn't a valid body part.
 */
export function getBodyPart(bodyParts: BodyParts, id: string): boolean {
  return (bodyParts as unknown as Record<string, boolean>)[id] ?? false;
}

/**
 * Returns a copy of `bodyParts` with the part identified by `id` toggled.
 *
 * If `id` doesn't represent a valid body part, `bodyParts` is returned
 * unchanged. If `mirror` is true, and the body part is one that exists on
 * both sides (e.g. knee), the other side is set to match the new value of
 * the toggled part (a sync, not an independent toggle).
 */
export function withToggledId(bodyParts: BodyParts, id: string, mirror = false): BodyParts {
  if (!(id in bodyParts)) {
    return bodyParts;
  }

  const next: Record<string, boolean> = { ...bodyParts };
  next[id] = !next[id];

  if (mirror) {
    if (id.includes('left')) {
      const mirroredId = id.replaceAll('left', 'right').replaceAll('Left', 'Right');
      next[mirroredId] = next[id];
    } else if (id.includes('right')) {
      const mirroredId = id.replaceAll('right', 'left').replaceAll('Right', 'Left');
      next[mirroredId] = next[id];
    }
  }

  return next as unknown as BodyParts;
}
