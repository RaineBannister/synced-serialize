import {Server, Socket} from 'net';

export class PublishServer extends Server {
    sockets : Map<string, Socket> = new Map<string, Socket>();

    constructor(...args) {
        super(...args);

        this.addListener('connection', (socket : Socket) => {
            this.sockets.set(socket.remoteAddress + ":" + socket.remotePort, socket);

            socket.addListener('close', () => {
                this.sockets.delete(socket.remoteAddress + ":" + socket.remotePort);
            })
        });
    }

    publish(data : string) {
        this.sockets.forEach((socket) => {
            socket.write(data)
        })
    }
}

export abstract class SyncedSerialize {
    networkID: number;
    server: PublishServer;
    constructor(server : PublishServer) {
        this.server = server;
        this.networkID = SyncedSerializeStatic.getNetworkID();

        const handler = {
            set: function (obj, prop, value) {
                obj.serialize(prop, value);
                obj[prop] = value;
                return true;
            },
        };
        return new Proxy(this, handler);
    }

    serialize(prop, value) {
        if(this.server.listening) {
            // serialize the change to all connected clients...
            this.server.publish(JSON.stringify(this, (k, v) => {
                if(k === "server") return undefined;
                return k && v && typeof v !== "number" ? (Array.isArray(v) ? "[object Array]" : "" + v) : v;
            }));
        } else {
             throw 'Server not running... Can\'t serialize objects';
        }
    }
}

class SyncedSerializeStatic {
    static currentNetworkID: number = 0;
    static getNetworkID() : number {
        this.currentNetworkID ++;
        return this.currentNetworkID;
    }
}