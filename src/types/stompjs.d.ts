declare module 'stompjs' {
    export interface StompConfig {
        debug?: boolean | ((msg: string) => void);
    }

    export interface StompClient {
        debug: boolean | ((msg: string) => void);
        connected: boolean;
        connect(headers: any, connectCallback: (frame: any) => void, errorCallback: (error: any) => void): void;
        disconnect(disconnectCallback?: () => void): void;
        subscribe(destination: string, callback: (message: any) => void): void;
        send(destination: string, headers: any, body: string): void;
    }

    export function over(webSocket: any): StompClient;
}

export default {
    over: (webSocket: any) => ({
        debug: false,
        connected: false,
        connect: () => {},
        disconnect: () => {},
        subscribe: () => {},
        send: () => {}
    })
};
