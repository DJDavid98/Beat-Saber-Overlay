export const getRandomInt = (min: number, max: number) => min + Math.round(Math.random() * (max - min));

export const getRandomBool = (falseChance = 0.5) => Math.random() > falseChance;
