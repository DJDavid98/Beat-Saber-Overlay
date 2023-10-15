import { FC } from 'react';

const bluetoothLogoLink = 'https://commons.wikimedia.org/wiki/File:Bluetooth.svg';

// Keep in sync with README.md
export const SettingsPageCredits: FC = () => {
    return <>
        <h2>Attributions</h2>

        <ul>
            <li>Bluetooth logo: <a
                href={bluetoothLogoLink}
                target="_blank"
                rel="noreferrer noopener"
            >{bluetoothLogoLink}</a></li>
            <li>Pulsoid logo is based on the Pulsoid App icon. This project is not affiliated with
                Pulsoid in any way, shape, or form.
            </li>
            <li>Bouncy icon made by <a href="https://www.twitch.tv/KisuPantteri">KisuPantteri</a>
            </li>
        </ul>

        <h3>Appreciation</h3>

        <p>Thanks to the individuals below for their contributions towards making this overlay the
            best it can possibly be through any combination of constructive feedback, improvement
            ideas, and being sources of inspiration:</p>

        <ul>
            <li>
                <a
                    href="https://www.twitch.tv/theblackparrot"
                    target="_blank"
                    rel="noreferrer noopener"
                >TheBlackParrot</a>
            </li>
            <li>
                <a
                    href="https://www.twitch.tv/minniefoxx"
                    target="_blank"
                    rel="noreferrer noopener"
                >MinnieFoxx</a>
            </li>
        </ul>
    </>;
};
