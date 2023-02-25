import { ChangeEventHandler, FC, FormEventHandler, MouseEvent, useCallback, useRef, useState } from "react";
import { PulsoidHeartRate } from "../utils/use-pulsoid-heart-rate";
import { ReadyState } from "react-use-websocket";
import { Loading } from "../Loading";

export const HeartRateConnectionPulsoid: FC<{ pulsoidHeartRate: PulsoidHeartRate }> = ({ pulsoidHeartRate }) => {
    const [tokenInputValue, setTokenInputValue] = useState<string>('');
    const dialogRef = useRef<HTMLDialogElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateInputValue = useCallback(() => {
        setTokenInputValue(pulsoidHeartRate.getToken() ?? '');
    }, [pulsoidHeartRate]);
    const showDialog = useCallback(() => {
        updateInputValue();
        dialogRef.current?.showModal();
        inputRef.current?.focus();
    }, [updateInputValue]);
    const closeDialog = useCallback((e?: MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();

        dialogRef.current?.close();
    }, []);
    const updateToken: FormEventHandler = useCallback((e) => {
        e.preventDefault();

        pulsoidHeartRate.changeToken(tokenInputValue);
        closeDialog();
    }, [closeDialog, pulsoidHeartRate, tokenInputValue]);
    const handleTokenInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setTokenInputValue(e.target.value);
    }, []);

    return <>
        {pulsoidHeartRate.readyState === ReadyState.CONNECTING
            ? <Loading id="pulsoid-loading" />
            : <button
                id="pulsoid-token"
                className={`connection-button ${pulsoidHeartRate.deviceClass}`}
                onClick={showDialog}
                title="Set Pulsoid Token"
            />}

        <dialog ref={dialogRef}>
            <form onSubmit={updateToken}>
                <h1>Enter Pulsoid API key</h1>
                <p>Generate a token on <a
                    href="https://pulsoid.net/ui/keys"
                    rel="noreferrer noopener"
                    target="_blank"
                >pulsoid.net</a> and paste it below.</p>
                <p>This requires a paid Pulsoid subscription plan.</p>
                <p>Leave the input empty to remove an already stored API key.</p>
                <input
                    type="password"
                    name="pulsoid-api-key"
                    autoComplete="off"
                    value={tokenInputValue}
                    onChange={handleTokenInputChange}
                    ref={inputRef}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={closeDialog}>Cancel</button>
            </form>
        </dialog>
    </>
}
