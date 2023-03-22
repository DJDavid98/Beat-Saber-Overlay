import Joi from "joi";
import { dataValidatorFactory } from "../utils/data-validator-factory";

export interface PulsoidHeartRate {
    measured_at: number;
    data: {
        heart_rate: number;
    };
}

const schema = Joi.object<PulsoidHeartRate>({
    measured_at: Joi.number(),
    data: Joi.object({
        heart_rate: Joi.number()
    })
});

export const validatePulsoidHeartRate = dataValidatorFactory(schema);
