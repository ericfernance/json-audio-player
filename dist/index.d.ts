export declare function defineJsonAudioPlayer(tag?: string): void;

export declare class JsonAudioPlayer extends HTMLElement {
    private $audio;
    private playlist;
    private muxedBlobUrl;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private updateStatus;
    loadAndMuxPlaylist(manifestUrl: string): Promise<void>;
    private handleAudioError;
}

export { }
