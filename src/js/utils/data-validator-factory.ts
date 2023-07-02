import Joi from 'joi';

export const dataValidatorFactory = <ExpectedType>(schema: Joi.Schema<ExpectedType>) => (data: unknown): ExpectedType | null => {
    if (data === null) return null;
    const validation = schema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
    });
    if (validation.error) {
        console.error(validation.error);
        return null;
    }
    return validation.value;
};
