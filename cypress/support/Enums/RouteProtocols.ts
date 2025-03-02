export enum RouteProtocols {
    gRPC = "GRPC",
    gRPCS = "GRPCS",
    gRPC_gRPCs = "GRPC, GRPCS",
    HTTP = "HTTP",
    HTTPS = "HTTPS",
    HTTP_HTTPS = "HTTP, HTTPS",
    TCP = "TCP",
    TLS = "TLS",
    TLS_UDP = "TLS, UDP",
    TCP_UDP = "TCP, UDP",
    TCP_TLS = "TCP, TLS",
    TCP_TLS_UDP = "TCP, TLS, UDP",
    TLS_PASSTHROUGH = "TLS_PASSTHROUGH",
    UDP = "UDP",
    WS = "WS",
    WSS = "WSS",
    WS_WSS = "WS, WSS"
};