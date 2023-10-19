import { FC } from 'react';
import { ExternalLink } from '../../ExternalLink';

const bluetoothLogoLink = 'https://commons.wikimedia.org/wiki/File:Bluetooth.svg';

// Keep in sync with README.md
export const SettingsPageCredits: FC = () => {
    return <>
        <h2>Attributions</h2>

        <ul>
            <li>Bluetooth
                logo: <ExternalLink href={bluetoothLogoLink}>{bluetoothLogoLink}</ExternalLink></li>
            <li>Pulsoid logo is based on the Pulsoid App icon. This project is not affiliated with
                Pulsoid in any way, shape, or form.
            </li>
            <li>Bouncy icon made
                by <ExternalLink href="https://www.twitch.tv/KisuPantteri">KisuPantteri</ExternalLink>
            </li>
            <li>Beat Saber UI
                font: <ExternalLink href="https://fonts.google.com/specimen/Teko">Teko</ExternalLink>
            </li>
            <li>Overlay UI
                font: <ExternalLink href="https://fonts.google.com/specimen/Kalam">Kalam</ExternalLink>
            </li>
        </ul>

        <h3>Appreciation</h3>

        <p>Thanks to the individuals below for their contributions towards making this overlay the
            best it can possibly be through any combination of constructive feedback, improvement
            ideas, and being sources of inspiration:</p>

        <ul>
            <li>
                <ExternalLink href="https://www.twitch.tv/theblackparrot">TheBlackParrot</ExternalLink>
            </li>
            <li>
                <ExternalLink href="https://www.twitch.tv/minniefoxx">MinnieFoxx</ExternalLink>
            </li>
        </ul>
    </>;
};
