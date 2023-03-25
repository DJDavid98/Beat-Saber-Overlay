export const getRandomInt = (min: number, max: number) => min + Math.round(Math.random() * (max - min));

export const getRandomBool = () => Math.random() > 0.5;
