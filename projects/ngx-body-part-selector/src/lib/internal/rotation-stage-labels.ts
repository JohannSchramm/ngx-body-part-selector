/** Localizable labels for the four sides shown on the turntable's handle bar. */
export interface RotationStageLabelData {
  readonly front: string;
  readonly left: string;
  readonly right: string;
  readonly back: string;
}

export const ENGLISH_ROTATION_STAGE_LABELS: RotationStageLabelData = {
  front: 'Front',
  left: 'Left',
  right: 'Right',
  back: 'Back',
};
