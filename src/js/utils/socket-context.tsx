// SocketContext.tsx
import React, {
    createContext,
    FC,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { AppSocket } from '../model/app-scoket';
import { useSettings } from '../contexts/settings-context';
import { SettingName } from '../model/settings';


interface SocketContextProps {
    socket: AppSocket | null;
}

// Create the context
const SocketContext = createContext<SocketContextProps>({ socket: null });

// Custom hook to access the socket instance from child components
export const useSocket = () => {
    const { socket } = useContext(SocketContext);
    return socket;
};

// SocketProvider component
export const SocketProvider: FC<PropsWithChildren> = ({ children }) => {
    const {
        settings: {
            [SettingName.CHAT_SOCKET_SERVER_URL]: serverUrl,
            [SettingName.CHAT_SOCKET_ROOM]: room,
        }
    } = useSettings();
    const [socket, setSocket] = useState<AppSocket | null>(null);

    useEffect(() => {
        if (!serverUrl) return;

        let mounted = true;
        let socketInstance: undefined | AppSocket;
        import('socket.io-client').then(({ io }) => {
            if (!mounted) return;

            // Create and set up the Socket.IO client instance here
            socketInstance = io(serverUrl);
            setSocket(socketInstance);
        });

        // Clean up the socket instance when the component unmounts
        return () => {
            socketInstance?.disconnect();
            setSocket(null);
            mounted = false;
        };
    }, [serverUrl]);

    useEffect(() => {
        if (socket && room) {
            socket.emit('joinRoom', room);
        }
    }, [room, socket]);

    const contextValue: SocketContextProps = useMemo(() => ({ socket }), [socket]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

