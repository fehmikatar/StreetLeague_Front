const mockStompClient = {
    debug: () => {},
    connected: false,
    connect: (_headers: any, connectCallback: any, _errorCallback: any) => {},
    disconnect: (_callback?: any) => {},
    subscribe: (_destination: string, _callback: any) => {},
    send: (_destination: string, _headers: any, _body: string) => {}
};

const Stomp = {
    over: (_webSocket: any) => mockStompClient
};

export default Stomp;