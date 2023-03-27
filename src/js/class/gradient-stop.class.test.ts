import { GradientStop } from "./gradient-stop.class";

describe('GradientStop', () => {
    describe('toString', () => {
        it('should stringify regular color values correctly', () => {
            const inputs = ['#000000', '#abcdef', '#6181b8', '#ffffff']
            inputs.forEach(input => {
                expect(new GradientStop(input, 0).toString()).toEqual(input);
            });
        });

        it('should stringify color values with alpha correctly', () => {
            const alpha = Math.random();
            expect(new GradientStop(0, 0).toString(alpha)).toEqual(`rgba(0,0,0,${alpha})`);
            expect(new GradientStop(0xffffff, 0).toString(alpha)).toEqual(`rgba(255,255,255,${alpha})`);
        });
    });
});
