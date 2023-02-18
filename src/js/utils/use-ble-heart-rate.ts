import { MutableRefObject, useCallback, useRef, useState } from "react";
import { HeartRateHookCommonFields } from "./heart-rate-hook-common-fields";

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

async function connectToBleSensor(
    gattConnection: MutableRefObject<BluetoothRemoteGATTServer | null>,
    heartRateCharacteristic: MutableRefObject<BluetoothRemoteGATTCharacteristic | null>,
    setHeartRate: (value: number | null) => void,
    setDeviceName: (value: string | null) => void,
    reset: VoidFunction) {

    // Request Bluetooth device with Heart Rate Service
    navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }]
    }).then(device => {
        console.log('Device Name:', device.name);
        if (device.name) {
            setDeviceName(device.name);
        }
        if (!device.gatt) {
            throw new Error('Cannot find gatt');
        }

        gattConnection.current = device.gatt;

        return gattConnection.current.connect().then(server => {
            console.log('Connected to GATT Server');

            return server.getPrimaryService(HEART_RATE_SERVICE).then(service => {
                console.log('Heart Rate Service found');

                return service.getCharacteristic(HEART_RATE_MEASUREMENT_CHARACTERISTIC).then(characteristic => {
                    heartRateCharacteristic.current = characteristic;
                    console.log('Heart Rate Measurement Characteristic found');

                    heartRateCharacteristic.current.startNotifications();
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
            console.error(error);
            reset();
        });
}

export interface BleHeartRate extends HeartRateHookCommonFields {
    connect: VoidFunction;
}

export const useBleHeartRate = (): BleHeartRate => {
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [deviceName, setDeviceName] = useState<string | null>(null);
    const gattConnection = useRef<BluetoothRemoteGATTServer | null>(null);
    const heartRateCharacteristic = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const disconnect = useCallback(() => {
        if (heartRateCharacteristic.current) {
            heartRateCharacteristic.current.stopNotifications();
            heartRateCharacteristic.current = null;
        }
        if (gattConnection.current) {
            gattConnection.current.disconnect();
            gattConnection.current = null;
        }
        setHeartRate(null);
        setDeviceName(null);
    }, []);
    const connect = useCallback(() => {
        connectToBleSensor(gattConnection, heartRateCharacteristic, setHeartRate, setDeviceName, disconnect);

        return disconnect;
    }, []);

    return {
        heartRate,
        deviceName: deviceName ?? 'Bluetooth',
        connect,
        className: 'bluetooth-bg',
        disconnect,
    };
}
