import { getGradientStopWeights, hexToRgb, rgbToHex } from "./colors";

describe('hexToRgb', () => {
    it('should convert hex number to rgb components correctly', () => {
        expect(hexToRgb(0)).toEqual([0, 0, 0]);
        expect(hexToRgb(0x808080)).toEqual([128, 128, 128]);
        expect(hexToRgb(0xffffff)).toEqual([255, 255, 255]);
    })
});

describe('rgbToHex', () => {
    it('should convert rgb components to hex number correctly', () => {
        expect(rgbToHex([0, 0, 0])).toEqual(0);
        expect(rgbToHex([128, 128, 128])).toEqual(0x808080);
        expect(rgbToHex([255, 255, 255])).toEqual(0xffffff);
    });
});

describe('getGradientStopWeights', () => {
    it('should weigh correctly at the earlier stop', () => {
        expect(getGradientStopWeights(0, 100, 0)).toBeDeepCloseTo([1, 0]);
        expect(getGradientStopWeights(10, 30, 10)).toBeDeepCloseTo([1, 0]);
    });
    it('should weigh correctly at the later stop', () => {
        expect(getGradientStopWeights(0, 100, 100)).toBeDeepCloseTo([0, 1]);
        expect(getGradientStopWeights(10, 30, 30)).toBeDeepCloseTo([0, 1]);
    });

    it('should weigh correctly in-between stops', () => {
        expect(getGradientStopWeights(0, 100, 20)).toBeDeepCloseTo([0.8, 0.2]);
        expect(getGradientStopWeights(0, 100, 25)).toBeDeepCloseTo([0.75, 0.25]);
        expect(getGradientStopWeights(0, 100, 50)).toBeDeepCloseTo([0.5, 0.5]);
        expect(getGradientStopWeights(0, 100, 75)).toBeDeepCloseTo([0.25, 0.75]);
        expect(getGradientStopWeights(0, 100, 80)).toBeDeepCloseTo([0.2, 0.8]);

        expect(getGradientStopWeights(10, 30, 15)).toBeDeepCloseTo([0.75, 0.25]);
        expect(getGradientStopWeights(10, 30, 20)).toBeDeepCloseTo([0.5, 0.5]);
        expect(getGradientStopWeights(10, 30, 25)).toBeDeepCloseTo([0.25, 0.75]);
    });
});
