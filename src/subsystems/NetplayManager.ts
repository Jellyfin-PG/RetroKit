export interface NetplayPeer {
  id: string;
  name: string;
  playerIndex: number;
  pingMs?: number;
  isHost: boolean;
}

export interface INetplayManager {
  isConnected(): boolean;
  isHost(): boolean;
  getPlayerIndex(): number;
  getConnectedPeers(): NetplayPeer[];
  connect(serverUrl: string, roomId: string, nickname?: string): Promise<void>;
  disconnect(): void;
}

export class NetplayManager implements INetplayManager {
  private _connected = false;
  private _isHost = false;
  private _playerIndex = 0;
  private _peers: NetplayPeer[] = [];
  private _socket: WebSocket | null = null;

  public isConnected(): boolean {
    return this._connected;
  }

  public isHost(): boolean {
    return this._isHost;
  }

  public getPlayerIndex(): number {
    return this._playerIndex;
  }

  public getConnectedPeers(): NetplayPeer[] {
    return [...this._peers];
  }

  public async connect(
    serverUrl: string,
    roomId: string,
    nickname = 'Player',
  ): Promise<void> {
    this.disconnect();

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${serverUrl.replace(/^http/, 'ws')}?room=${encodeURIComponent(roomId)}&nick=${encodeURIComponent(nickname)}`;
        this._socket = new WebSocket(wsUrl);

        this._socket.onopen = () => {
          this._connected = true;
          resolve();
        };

        this._socket.onclose = () => {
          this._connected = false;
        };

        this._socket.onerror = (err) => {
          reject(err);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  public disconnect(): void {
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
    this._connected = false;
    this._peers = [];
  }
}
