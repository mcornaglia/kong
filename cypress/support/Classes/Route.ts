import { Methods } from "../Enums/Methods";
import { RouteProtocols } from "../Enums/RouteProtocols";

export class Route {
    constructor(routeName, tags, protocol, path, methods, source) {
        this.RouteName = routeName;
        this.Tags = tags;
        this.Protocol = protocol;
        this.Path = path;
        this.Methods = methods;
        this.Source = source;
    }

    RouteName: string;
    Tags: string;
    Protocol: RouteProtocols;
    Path?: string;
    Methods?: Methods[];
    Source?: Source;
}

export class Source {
    constructor(destination, port) {
        this.Destination = destination;
        this.Port = port;
    }
    
    Destination: string;
    Port: number;
}