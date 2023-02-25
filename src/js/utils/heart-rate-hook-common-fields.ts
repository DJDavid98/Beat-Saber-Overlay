import { ReadyState } from "react-use-websocket";

export interface HeartRateHookCommonFields {
    readyState: ReadyState;
    heartRate: number | null;
    deviceClass: string;
    deviceName: string;
    disconnect: VoidFunction;
}
