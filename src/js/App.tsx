import { FunctionComponent } from 'react';
import { BeatSaber } from './beat-saber/BeatSaber';
import { SmartRemountWrapper } from './SmartRemountWrapper';
import { HeartRate } from './heartrate/HeartRate';
import { Credits } from './credits/Credits';
import { SocketProvider } from './utils/socket-context';
import { Chat } from './chat/Chat';
import { RemovableElementId } from './model/removable-element-id';
import { RemovableElement } from './RemovableElement';
import { AppBackground } from './AppBackground';

interface Props {
    params: URLSearchParams;
}

export const App: FunctionComponent<Props> = ({ params }) => {
    return <div id="app">
        <SocketProvider serverUrl={params.get('socket')} room={params.get('room')}>
            <SmartRemountWrapper rootId={RemovableElementId.BEAT_SABER} delayRemount={500}>
                <BeatSaber dataSourceName={params.get('source')} />
            </SmartRemountWrapper>
            <SmartRemountWrapper rootId={RemovableElementId.HEART_RATE}>
                <HeartRate />
            </SmartRemountWrapper>
            <SmartRemountWrapper rootId={RemovableElementId.CREDITS}>
                <Credits />
            </SmartRemountWrapper>
            <RemovableElement id={RemovableElementId.CHAT}>
                <Chat />
            </RemovableElement>
            <AppBackground />
        </SocketProvider>
    </div>;
};
