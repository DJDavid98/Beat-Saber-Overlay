import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { HeartRateHookCommonFields } from "../utils/heart-rate-hook-common-fields";
import { ReadyState } from "react-use-websocket";
import { isInBrowserSource } from "../utils/is-in-browser-source";

interface CharacteristicEvent extends Event {
    target: Event['target'] & {
        value: {
            getUint8(n: number): number;
        }
    }
}

const isCharacteristicEvent = (ev: Event): ev is CharacteristicEvent =>
    'target' in ev
    && !!ev.target
    && 'value' in ev.target
    && typeof ev.target.value === 'object'
    && !!ev.target.value
    && 'getUint8' in ev.target.value
    && typeof ev.target.value.getUint8 === 'function';

const HEART_RATE_SERVICE = 0x180D;
const HEART_RATE_MEASUREMENT_CHARACTERISTIC = 0x2A37;

interface ConnectToBleSensorParams {
    gattConnection: MutableRefObject<BluetoothRemoteGATTServer | null>;
    heartRateCharacteristic: MutableRefObject<BluetoothRemoteGATTCharacteristic | null>;
    setHeartRate: (value: (number | null)) => void;
    setDeviceName: (value: (string | null)) => void;
    readyStateChange: (newState: ReadyState) => void;
    reset: VoidFunction;
}

async function connectToBleSensor({
    gattConnection,
    heartRateCharacteristic,
    setHeartRate,
    setDeviceName,
    readyStateChange,
    reset
}: ConnectToBleSensorParams) {
    readyStateChange(ReadyState.CONNECTING);

    // Request Bluetooth device with Heart Rate Service
    navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }]
    }).then(device => {
        console.info('Device Name:', device.name);
        if (device.name) {
            setDeviceName(device.name);
        }
        if (!device.gatt) {
            throw new Error('Cannot find gatt');
        }

        gattConnection.current = device.gatt;

        return gattConnection.current.connect().then(server => {
            console.info('Connected to GATT Server');

            return server.getPrimaryService(HEART_RATE_SERVICE).then(service => {
                console.info('Heart Rate Service found');

                return service.getCharacteristic(HEART_RATE_MEASUREMENT_CHARACTERISTIC).then(characteristic => {
                    heartRateCharacteristic.current = characteristic;
                    console.info('Heart Rate Measurement Characteristic found');

                    heartRateCharacteristic.current.startNotifications();
                    readyStateChange(ReadyState.OPEN);
                    heartRateCharacteristic.current.addEventListener('characteristicvaluechanged', function handleHeartRate(event) {
                        if (!isCharacteristicEvent(event)) {
                            throw new Error('Cannot find event target value');
                        }
                        const heartRate = event.target.value.getUint8(1);
                        setHeartRate(heartRate);
                    });
                });
            });
        });
    })
        .catch(error => {
            readyStateChange(ReadyState.CLOSED);
            console.error(error);
            reset();
        });
}

export interface BleHeartRate extends HeartRateHookCommonFields {
    connect: VoidFunction;
    supported: boolean;
}

export const useBleHeartRate = (): BleHeartRate => {
    const [supported, setSupported] = useState(false);
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [deviceName, setDeviceName] = useState<string | null>(null);
    const gattConnection = useRef<BluetoothRemoteGATTServer | null>(null);
    const heartRateCharacteristic = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const [readyState, setReadyState] = useState<ReadyState>(ReadyState.UNINSTANTIATED);
    const disconnect = useCallback(async () => {
        if (heartRateCharacteristic.current) {
            try {
                await heartRateCharacteristic.current.stopNotifications();
            } catch (e) {
                console.error(e);
            }
            heartRateCharacteristic.current = null;
        }
        if (gattConnection.current) {
            gattConnection.current.disconnect();
            gattConnection.current = null;
        }
        setHeartRate(null);
        setDeviceName(null);
        setReadyState(ReadyState.CLOSED);
    }, []);
    const connect = useCallback(() => {
        void connectToBleSensor({
            gattConnection: gattConnection,
            heartRateCharacteristic: heartRateCharacteristic,
            setHeartRate: setHeartRate,
            setDeviceName: setDeviceName,
            reset: disconnect,
            readyStateChange: setReadyState,
        });

        return disconnect;
    }, [disconnect]);

    useEffect(() => {
        // Feature detection
        setSupported('bluetooth' in navigator && !isInBrowserSource());
    }, []);

    return {
        readyState,
        heartRate,
        deviceName: deviceName ?? 'Bluetooth',
        connect,
        deviceClass: 'bluetooth-bg',
        disconnect,
        supported,
    };
}
