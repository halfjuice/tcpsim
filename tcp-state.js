// TCP States
const TCP_STATES = {
    CLOSED: 'CLOSED',
    LISTEN: 'LISTEN',
    SYN_SENT: 'SYN_SENT',
    SYN_RECEIVED: 'SYN_RECEIVED',
    ESTABLISHED: 'ESTABLISHED',
    FIN_WAIT_1: 'FIN_WAIT_1',
    FIN_WAIT_2: 'FIN_WAIT_2',
    CLOSE_WAIT: 'CLOSE_WAIT',
    CLOSING: 'CLOSING',
    LAST_ACK: 'LAST_ACK',
    TIME_WAIT: 'TIME_WAIT'
};

// Packet Types
const PACKET_TYPES = {
    SYN: 'SYN',
    ACK: 'ACK',
    SYN_ACK: 'SYN_ACK',
    FIN: 'FIN',
    FIN_ACK: 'FIN_ACK',
    RST: 'RST'
};

class TCPPort {
    constructor(port) {
        this.port = port;
        this.state = TCP_STATES.CLOSED;
        this.history = [];
        this.remoteEndpoint = null;
    }

    handlePacket(packet, isSender) {
        const oldState = this.state;
        const { srcIP, srcPort, destIP, destPort, type } = packet;
        
        // Store remote endpoint for new connections
        if (!this.remoteEndpoint) {
            if (isSender) {
                this.remoteEndpoint = `${destIP}:${destPort}`;
            } else {
                this.remoteEndpoint = `${srcIP}:${srcPort}`;
            }
        }

        // Handle state transitions based on packet type and whether we're sending or receiving
        if (type === PACKET_TYPES.SYN) {
            if (isSender) {
                this.state = TCP_STATES.SYN_SENT;
            } else {
                this.state = TCP_STATES.SYN_RECEIVED;
            }
        }
        else if (type === PACKET_TYPES.SYN_ACK) {
            if (isSender) {
                // Do nothing
            } else {
                if (this.state === TCP_STATES.SYN_SENT) {
                    this.state = TCP_STATES.ESTABLISHED;
                }
            }
        }
        else if (type === PACKET_TYPES.ACK) {
            if (this.state === TCP_STATES.SYN_RECEIVED) {
                this.state = TCP_STATES.ESTABLISHED;
            }
            else if (this.state === TCP_STATES.FIN_WAIT_1) {
                this.state = TCP_STATES.FIN_WAIT_2;
            }
            else if (this.state === TCP_STATES.CLOSING) {
                this.state = TCP_STATES.TIME_WAIT;
                this.startTimeWaitTimer();
            }
            else if (this.state === TCP_STATES.LAST_ACK) {
                this.state = TCP_STATES.CLOSED;
                this.remoteEndpoint = null;
            }
        }
        else if (type === PACKET_TYPES.FIN) {
            if (isSender) {
                if (this.state === TCP_STATES.ESTABLISHED) {
                    this.state = TCP_STATES.FIN_WAIT_1;
                } else if (this.state === TCP_STATES.CLOSE_WAIT) {
                    this.state = TCP_STATES.LAST_ACK;
                }
            } else {
                if (this.state === TCP_STATES.ESTABLISHED) {
                    this.state = TCP_STATES.CLOSE_WAIT;
                } else if (this.state === TCP_STATES.FIN_WAIT_1) {
                    this.state = TCP_STATES.CLOSING;
                } else if (this.state === TCP_STATES.FIN_WAIT_2) {
                    this.state = TCP_STATES.TIME_WAIT;
                    this.startTimeWaitTimer();
                }
            }
        }
        else if (type === PACKET_TYPES.FIN_ACK) {
            if (isSender) {
                if (this.state === TCP_STATES.CLOSE_WAIT) {
                    this.state = TCP_STATES.LAST_ACK;
                }
            }
        }
        else if (type === PACKET_TYPES.RST) {
            this.state = TCP_STATES.CLOSED;
            this.remoteEndpoint = null;
        }

        this.logTransition(packet, isSender);

        return {
            oldState,
            newState: this.state,
            changed: oldState !== this.state
        };
    }

    startTimeWaitTimer() {
        setTimeout(() => {
            this.state = TCP_STATES.CLOSED;
            this.remoteEndpoint = null;
            this.logTransition('2MSL timeout');
        }, 2000); // 2 second timeout to simulate 2MSL
    }

    logTransition(packet, isSender) {
        this.history.push({
            timestamp: new Date().toISOString(),
            state: this.state,
            event: packet.type ? 
                `${isSender ? '➡️' : '⬅️'} ${packet.type} ${packet.srcIP}:${packet.srcPort} → ${packet.destIP}:${packet.destPort}` : 
                packet
        });
    }

    getState() {
        return {
            port: this.port,
            state: this.state,
            remoteEndpoint: this.remoteEndpoint,
            history: this.history
        };
    }
}

class TCPHost {
    constructor(ip) {
        this.ip = ip;
        this.ports = new Map();
    }

    getOrCreatePort(port) {
        if (!this.ports.has(port)) {
            const tcpPort = new TCPPort(port);
            tcpPort.hostIP = this.ip;
            this.ports.set(port, tcpPort);
        }
        return this.ports.get(port);
    }

    handlePacket(packet) {
        // Handle source port (sender)
        if (packet.srcIP === this.ip) {
            const sourcePort = this.getOrCreatePort(packet.srcPort);
            sourcePort.handlePacket(packet, true);
        }
        // Handle destination port (receiver)
        if (packet.destIP === this.ip) {
            const destPort = this.getOrCreatePort(packet.destPort);
            destPort.handlePacket(packet, false);
        }
    }

    getPortState(port) {
        const tcpPort = this.ports.get(port);
        return tcpPort ? tcpPort.getState() : null;
    }

    getAllPortStates() {
        const states = {};
        for (const [port, tcpPort] of this.ports) {
            states[port] = tcpPort.getState();
        }
        return states;
    }
}

// Create two hosts with fixed IPs
window.host1 = new TCPHost('1.1.1.1');
window.host2 = new TCPHost('1.1.1.2');
