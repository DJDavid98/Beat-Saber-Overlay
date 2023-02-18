export interface HeartRateHookCommonFields {
    heartRate: number | null;
    className: string;
    deviceName: string;
    disconnect: VoidFunction;
}
