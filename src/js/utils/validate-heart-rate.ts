import Joi from "joi";
import { dataValidatorFactory } from "./data-validator-factory";

export interface HeartRate {
    measured_at: number;
    data: {
        heart_rate: number;
    };
}

const heartRateSchema = Joi.object<HeartRate>({
    measured_at: Joi.number(),
    data: Joi.object({
        heart_rate: Joi.number()
    })
});

export const validateHeartRate = dataValidatorFactory(heartRateSchema);
