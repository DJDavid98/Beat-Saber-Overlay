import { weightedColorMixerFactory } from "./weighted-color-mix";
import { GradientStop } from "../class/gradient-stop.class";

describe('weightedColorMix', () => {
    it('should return single stop correctly', () => {
        const mixer = weightedColorMixerFactory([new GradientStop(0, 0), new GradientStop(0xffffff, 100)]);
        const actual = mixer(0);
        expect(actual).toEqual('#000000');
    });

    it('should return multiple stops correctly', () => {
        const mixer = weightedColorMixerFactory([new GradientStop(0, 0), new GradientStop(0xffffff, 100)]);
        const actual = mixer(50);
        expect(actual).toEqual('#808080');
    });

    it('should return multiple stops correctly', () => {
        const mixer = weightedColorMixerFactory([
            new GradientStop('#ff0000', 0),
            new GradientStop('#00ff00', 2),
            new GradientStop('#0000ff', 4)
        ]);
        expect(mixer(1)).toEqual('#808000');
        expect(mixer(3)).toEqual('#008080');
    });
});
