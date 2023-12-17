import Joi from 'joi';
import { dataValidatorFactory } from '../utils/data-validator-factory';
import { BsdpModData, BsdpPluginMetadata } from '../model/bsdp';

const schema = Joi.object<BsdpModData>({
    EnabledPlugins: Joi.array<BsdpPluginMetadata[]>().items({
        Name: Joi.string().allow(''),
        Version: Joi.string().allow(''),
        Author: Joi.string().allow(''),
        Description: Joi.string().allow(''),
        HomeLink: Joi.string().allow(''),
        SourceLink: Joi.string().allow(''),
        DonateLink: Joi.string().allow(''),
    }),
});

export const validateBsdpModData = dataValidatorFactory(schema);
