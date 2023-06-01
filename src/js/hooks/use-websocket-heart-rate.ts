import { useCallback, useEffect, useState } from "react";
import { useFailsafeWebsocket } from "./use-failsafe-websocket";
import { HeartRateHookCommonFields } from "../utils/heart-rate-hook-common-fields";
import Joi from "joi";

export interface WebsocketHeartRate extends HeartRateHookCommonFields {
    changeHost: (newHost: string) => void;
    getHost: () => string | null;
    changePath: (newPath: string) => void;
    getPath: () => string | null;
}

const numericStringSchema = Joi.string().regex(/^\d+$/);

const websocketHostKey = 'websocket-host';
const websocketPathKey = 'websocket-path';
const getHost = () => localStorage.getItem(websocketHostKey);
const getPath = () => localStorage.getItem(websocketPathKey);

export const useWebsocketHeartRate = (): WebsocketHeartRate => {
    const [host, setHost] = useState<string | null>(null);
    const [path, setPath] = useState<string | null>(null);
    const validateWebsocketData = useCallback((data: unknown): number | undefined => {
        if (data === null) return undefined;

        if (!path) {
            switch (typeof data) {
                case "string":
                    return /^\d+$/.test(data) ? parseInt(data, 10) : undefined;
                case "number":
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

        const pathValue = pathParts.reduce((finalValue, part) => finalValue[part], result.value) as string | number;
        return typeof pathValue === 'number' ? pathValue : parseInt(pathValue, 10);
    }, [path]);
    const {
        message: websocketData,
        readyState,
    } = useFailsafeWebsocket(host, validateWebsocketData, Boolean(host));
    const saveHost = useCallback((value: string) => {
        setHost(value);
        localStorage.setItem(websocketHostKey, value);
    }, []);
    const savePath = useCallback((value: string) => {
        setPath(value);
        localStorage.setItem(websocketPathKey, value);
    }, []);
    const disconnect = useCallback(() => {
        setHost(null);
    }, []);
    const changeHost = useCallback((result: string) => {
        const newHost = result.trim();
        console.debug('newHost', newHost);
        if (/^wss?:\/\/.+$/.test(newHost)) {
            saveHost(newHost);
            return;
        } else {
            if (newHost === '') {
                localStorage.removeItem(websocketHostKey);
            }
            disconnect();
        }
    }, [saveHost, disconnect]);
    const changePath = useCallback((result: string) => {
        const newPath = result.trim();
        console.debug('newPath', newPath);
        if (/^[a-z\d_.-]+$/.test(newPath)) {
            savePath(newPath);
            return;
        } else {
            if (newPath === '') {
                localStorage.removeItem(websocketPathKey);
            }
            setPath(null);
        }
    }, [savePath]);

    useEffect(() => {
        setHost(getHost());
        setPath(getPath());
    }, []);

    return {
        heartRate: websocketData ?? null,
        deviceClass: 'websocket-bg',
        deviceName: 'Websocket',
        disconnect,
        readyState,
        changeHost,
        getHost,
        changePath,
        getPath,
    };
}
