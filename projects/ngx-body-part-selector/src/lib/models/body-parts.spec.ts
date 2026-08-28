import {
  BODY_PARTS_ALL,
  BodyParts,
  DEFAULT_BODY_PARTS,
  getBodyPart,
  withToggledId,
} from './body-parts';

describe('BodyParts', () => {
  describe('BODY_PARTS_ALL', () => {
    it('equals a manually constructed all-true object', () => {
      const bp: BodyParts = {
        head: true,
        neck: true,
        upperBody: true,
        abdomen: true,
        vestibular: true,
        leftElbow: true,
        leftFoot: true,
        leftHand: true,
        leftKnee: true,
        leftLowerArm: true,
        leftLowerLeg: true,
        leftShoulder: true,
        leftUpperArm: true,
        leftUpperLeg: true,
        lowerBody: true,
        rightElbow: true,
        rightFoot: true,
        rightHand: true,
        rightKnee: true,
        rightLowerArm: true,
        rightLowerLeg: true,
        rightShoulder: true,
        rightUpperArm: true,
        rightUpperLeg: true,
      };
      expect(bp).toEqual(BODY_PARTS_ALL);
    });

    it("doesn't equal any single part turned off", () => {
      for (const key of Object.keys(BODY_PARTS_ALL)) {
        const bp = withToggledId(BODY_PARTS_ALL, key);
        expect(bp).not.toEqual(BODY_PARTS_ALL);
      }
      expect(BODY_PARTS_ALL).toEqual(BODY_PARTS_ALL);
    });
  });

  describe('withToggledId', () => {
    function testIdToggle(id: string): void {
      const bp = DEFAULT_BODY_PARTS;

      expect(getBodyPart(bp, id)).toBe(false);
      expect(getBodyPart(withToggledId(bp, id), id)).toBe(true);
      expect(getBodyPart(withToggledId(withToggledId(bp, id), id), id)).toBe(false);
      expect(getBodyPart(withToggledId(bp, id, true), id)).toBe(true);
      expect(
        getBodyPart(withToggledId(withToggledId(bp, id, true), id, true), id),
      ).toBe(false);
    }

    it('toggling by symmetric IDs works', () => {
      const ids = ['head', 'neck', 'upperBody', 'abdomen', 'vestibular'];
      for (const id of ids) {
        testIdToggle(id);
      }
    });

    it('toggling by asymmetric IDs works', () => {
      const ids = [
        'Shoulder',
        'UpperArm',
        'Elbow',
        'LowerArm',
        'Hand',
        'UpperLeg',
        'Knee',
        'LowerLeg',
        'Foot',
      ];

      function testIds(leftId: string, rightId: string): void {
        testIdToggle(leftId);
        testIdToggle(rightId);
        const bp = DEFAULT_BODY_PARTS;

        expect(getBodyPart(withToggledId(bp, leftId), rightId)).toBe(false);
        expect(getBodyPart(withToggledId(bp, leftId, true), rightId)).toBe(true);
        expect(getBodyPart(withToggledId(bp, rightId), leftId)).toBe(false);
        expect(getBodyPart(withToggledId(bp, rightId, true), leftId)).toBe(true);
        expect(
          getBodyPart(withToggledId(withToggledId(bp, rightId, true), rightId, true), leftId),
        ).toBe(false);
        expect(
          getBodyPart(withToggledId(withToggledId(bp, leftId, true), leftId, true), rightId),
        ).toBe(false);
        expect(
          getBodyPart(withToggledId(withToggledId(bp, leftId), rightId, true), rightId),
        ).toBe(true);
        expect(
          getBodyPart(withToggledId(withToggledId(bp, leftId), leftId, true), rightId),
        ).toBe(false);
        expect(
          getBodyPart(
            withToggledId(withToggledId(withToggledId(bp, rightId), leftId), leftId, true),
            rightId,
          ),
        ).toBe(false);
      }

      for (const partId of ids) {
        const leftId = `left${partId}`;
        const rightId = `right${partId}`;
        testIds(leftId, rightId);
      }
    });
  });
});
