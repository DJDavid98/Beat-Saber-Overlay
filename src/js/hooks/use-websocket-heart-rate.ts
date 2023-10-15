import { useCallback } from 'react';
import { useFailsafeWebsocket } from './use-failsafe-websocket';
import { HeartRateHookCommonFields } from '../utils/heart-rate-hook-common-fields';
import Joi from 'joi';
import { useSettings } from '../contexts/settings-context';
import { SettingName } from '../model/settings';

const numericStringSchema = Joi.string().regex(/^\d+$/);

export const useWebsocketHeartRate = (): HeartRateHookCommonFields => {
    const {
        settings: {
            [SettingName.HEART_RATE_WEBSOCKET_HOST]: host,
            [SettingName.HEART_RATE_WEBSOCKET_PATH]: path,
        },
        setSetting
    } = useSettings();
    const validateWebsocketData = useCallback((data: unknown): number | undefined => {
        if (data === null) return undefined;

        if (!path) {
            switch (typeof data) {
                case 'string':
                    return /^\d+$/.test(data) ? parseInt(data, 10) : undefined;
                case 'number':
                    return data;
                default:
                    console.warn(`Cannot process data of type ${typeof data}`);
                    return undefined;
            }
        }

        const pathParts = path.split('.');
        const dynamicSchema = pathParts
            .slice()
            .reverse()
            .reduce(
                (schema, part) => Joi.object({ [part]: schema }),
                Joi.alternatives<string | number>(Joi.number(), numericStringSchema) as Joi.Schema
            );
        const result = dynamicSchema.validate(data, { stripUnknown: true, abortEarly: false });
        if (result.error) {
            console.warn(result.error);
            return undefined;
        }

        const pathValue = pathParts.reduce((finalValue,
            part) => finalValue[part], result.value) as string | number;
        return typeof pathValue === 'number' ? pathValue : parseInt(pathValue, 10);
    }, [path]);
    const {
        message: websocketData,
        readyState,
    } = useFailsafeWebsocket(host, validateWebsocketData);
    const disconnect = useCallback(() => {
        setSetting(SettingName.HEART_RATE_WEBSOCKET_HOST, null);
    }, [setSetting]);

    return {
        heartRate: websocketData ?? null,
        deviceClass: 'websocket-bg',
        deviceName: 'Websocket',
        disconnect,
        readyState,
    };
};
