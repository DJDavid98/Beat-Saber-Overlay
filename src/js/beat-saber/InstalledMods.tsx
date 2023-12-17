import { FC, useMemo } from 'react';
import { useFailsafeWebsocket } from '../hooks/use-failsafe-websocket';
import { bsdpDataSource } from '../utils/constants';
import { validateBsdpModData } from '../validators/validate-bsdp-mod-data';
import { ExternalLink } from '../ExternalLink';
import * as styles from '../../scss/modules/InstalledMods.module.scss';
import { ReadyState } from 'react-use-websocket';
import { Loading } from '../Loading';

const simplifyLink = (href: string) => href.replace(/^https?:\/\//, '');

export const InstalledMods: FC = () => {
    const {
        message: modData,
        readyState
    } = useFailsafeWebsocket(`${bsdpDataSource}/ModData`, validateBsdpModData);

    const enabledModes = modData?.EnabledPlugins;
    const sortedModsList = useMemo(() => enabledModes?.slice().sort(({ Name: NameA },
        { Name: NameB }) => NameA.localeCompare(NameB)) ?? [], [enabledModes]);

    let modsJsx: JSX.Element;
    if (readyState === ReadyState.CONNECTING) {
        modsJsx = <Loading name="connection" />;
    } else if (sortedModsList.length === 0) {
        modsJsx = <p>Installed mods could not be loaded.</p>;
    } else {
        modsJsx =
            <ul>
                {sortedModsList.map((mod) => <li key={mod.Name}>
                    <h4 className={styles['mod-title']}>
                        <span className={styles['mod-name']}>{mod.Name}</span>
                        {' '}<span className={styles['mod-version']}>v{mod.Version}</span>
                    </h4>
                    {mod.Author && <p className={styles['mod-info']}>Developed by: {mod.Author}</p>}
                    {mod.HomeLink && <p className={styles['mod-info']}>
                        Home
                        page: <ExternalLink href={mod.HomeLink}>{simplifyLink(mod.HomeLink)}</ExternalLink>
                    </p>}
                    {mod.SourceLink && <p className={styles['mod-info']}>
                        Source
                        code: <ExternalLink href={mod.SourceLink}>{simplifyLink(mod.SourceLink)}</ExternalLink>
                    </p>}
                    {mod.DonateLink && <p className={styles['mod-info']}>
                        Donations: <ExternalLink href={mod.DonateLink}>{simplifyLink(mod.DonateLink)}</ExternalLink>
                    </p>}
                </li>)}
            </ul>;
    }

    return <div className={styles['installed-mods']}>
        <h3>Installed Mods</h3>
        {modsJsx}
    </div>;
};
