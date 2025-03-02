export class Service {
    constructor(serviceName, tags, protocol, host, port, path, isFullUrl, advancedFields) {
        this.ServiceName = serviceName;
        this.Tags = tags;
        this.Protocol = protocol;
        this.Host = host;
        this.Port = port;        
        this.Path = path;
        this.IsFullUrl = isFullUrl;
        this.AdvancedFields = advancedFields;
    }

    ServiceName: string;
    Tags: string[];
    Protocol: string;
    Host: string;
    Path?: string;
    Port: number;
    IsFullUrl: boolean;
    AdvancedFields?: AdvancedFields;
}
export class AdvancedFields {
    constructor(retries, connectionTimeout, writeTimeout, readTimeout) {
        this.Retries = retries;
        this.ConnectionTimeout = connectionTimeout;
        this.WriteTimeout = writeTimeout;
        this.ReadTimeout = readTimeout;
    }

    Retries: number;
    ConnectionTimeout: number;
    WriteTimeout: number;
    ReadTimeout: number;
}