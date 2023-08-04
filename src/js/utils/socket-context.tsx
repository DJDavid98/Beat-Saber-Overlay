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

export interface SocketProviderProps extends PropsWithChildren {
    serverUrl: string | null;
    room: string | null;
}

// SocketProvider component
export const SocketProvider: FC<SocketProviderProps> = ({ serverUrl, room, children }) => {
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

        // You can also handle socket events or any other configurations here if needed
        // Example:
        // socketInstance.on('connect', () => console.log('Connected to the server'));

        // Clean up the socket instance when the component unmounts
        return () => {
            socketInstance?.disconnect();
            setSocket(null);
            mounted = false;
        };
    }, [serverUrl]);

    useEffect(() => {
        if (socket && room) {
            console.log('emit', 'joinRoom', room);
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

