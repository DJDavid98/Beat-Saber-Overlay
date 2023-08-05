import { FunctionComponent } from 'react';
import { BeatSaber } from './beat-saber/BeatSaber';
import { SmartRemountWrapper } from './SmartRemountWrapper';
import { HeartRate } from './heartrate/HeartRate';
import { Credits } from './credits/Credits';
import { SocketProvider } from './utils/socket-context';
import { Chat } from './chat/Chat';

interface Props {
    params: URLSearchParams;
}

export const App: FunctionComponent<Props> = ({ params }) => {
    return <div id="app">
        <SocketProvider serverUrl={params.get('socket')} room={params.get('room')}>
            <SmartRemountWrapper rootId="beat-saber-root" delayRemount={500}>
                <BeatSaber dataSourceName={params.get('source')} />
            </SmartRemountWrapper>
            <SmartRemountWrapper rootId="heart-rate-root">
                <HeartRate />
            </SmartRemountWrapper>
            <SmartRemountWrapper rootId="credits-root">
                <Credits />
            </SmartRemountWrapper>
            <Chat />
        </SocketProvider>
    </div>;
};
