import { weightedColorMixerFactory } from './weighted-color-mix';
import { GradientStop } from '../class/gradient-stop.class';

describe('weightedColorMix', () => {
    it('should return exact stop correctly', () => {
        const firstStop = new GradientStop(0, 0);
        const mixer = weightedColorMixerFactory([firstStop, new GradientStop(0xffffff, 100)]);
        const actual = mixer(firstStop.position);
        expect(actual).toEqual(firstStop);
    });

    it('should return multiple stops correctly', () => {
        const mixer = weightedColorMixerFactory([new GradientStop(0, 0), new GradientStop(0xffffff, 100)]);
        const actual = mixer(50);
        expect(actual).toEqual(new GradientStop('#808080', 50));
    });

    it('should return multiple stops correctly', () => {
        const mixer = weightedColorMixerFactory([
            new GradientStop('#ff0000', 0),
            new GradientStop('#00ff00', 2),
            new GradientStop('#0000ff', 4)
        ]);
        expect(mixer(1)).toEqual(new GradientStop('#808000', 1));
        expect(mixer(3)).toEqual(new GradientStop('#008080', 3));
    });

    it('should return earlier stop when smoothing is disabled', () => {
        const firstStop = new GradientStop('#ff0000', 0);
        const secondStop = new GradientStop('#00ff00', 2);
        const mixer = weightedColorMixerFactory([
            firstStop,
            secondStop,
            new GradientStop('#0000ff', 4)
        ], false);
        expect(mixer(1)).toEqual(firstStop);
        expect(mixer(3)).toEqual(secondStop);
    });
});
