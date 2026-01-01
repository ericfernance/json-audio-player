interface PlaylistManifest {
  files: string[];
}

export class JsonAudioPlayer extends HTMLElement {
  private $audio!: HTMLAudioElement;
  private playlist: string[] = [];
  private muxedBlobUrl: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    if (!this.shadowRoot) throw new Error("Shadow root not available");
    this.shadowRoot.innerHTML = `
      <div>
        <div id="status">Loading...</div>
        <audio id="audio" controls></audio>
      </div>
    `;

    this.$audio = this.shadowRoot.querySelector("#audio")!;

    this.$audio.addEventListener("ended", () => {
      console.log("Playback finished");
      this.dispatchEvent(new CustomEvent("playlistended"));
    });

    this.$audio.addEventListener("error", () => {
      this.handleAudioError();
    });
  }

  connectedCallback() {
    console.log(`Audio player connected with src: ${this.getAttribute("src")}`);
    const src = this.getAttribute("src")!;
    this.loadAndMuxPlaylist(src);
  }

  disconnectedCallback() {
    // Clean up blob URL when component is removed
    if (this.muxedBlobUrl) {
      URL.revokeObjectURL(this.muxedBlobUrl);
    }
  }

  private updateStatus(message: string): void {
    const statusEl = this.shadowRoot?.querySelector("#status");
    if (statusEl) {
      statusEl.textContent = message;
    }
    console.log(message);
  }

  async loadAndMuxPlaylist(manifestUrl: string): Promise<void> {
    try {
      this.updateStatus("Loading playlist...");

      const response = await fetch(manifestUrl);
      const manifest: PlaylistManifest = await response.json();
      this.playlist = manifest.files;

      console.log(`Found ${this.playlist.length} chunks to download and mux`);

      // Download all chunks
      this.updateStatus(`Downloading ${this.playlist.length} chunks...`);
      const chunks: Blob[] = [];

      for (let i = 0; i < this.playlist.length; i++) {
        this.updateStatus(
          `Downloading chunk ${i + 1}/${this.playlist.length}...`,
        );
        const chunkResponse = await fetch(this.playlist[i]);

        if (!chunkResponse.ok) {
          throw new Error(
            `Failed to download chunk ${i + 1}: ${chunkResponse.statusText}`,
          );
        }

        const blob = await chunkResponse.blob();
        chunks.push(blob);
        console.log(`Downloaded chunk ${i + 1}: ${blob.size} bytes`);
      }

      this.updateStatus("Muxing chunks into complete file...");

      // Combine all chunks into one blob
      const combinedBlob = new Blob(chunks, { type: "audio/webm" });

      // Create blob URL
      this.muxedBlobUrl = URL.createObjectURL(combinedBlob);

      this.updateStatus("Ready to play");
      this.$audio.src = this.muxedBlobUrl;

      console.log("Successfully muxed all chunks into single playable file");

      // Dispatch ready event
      this.dispatchEvent(new CustomEvent("ready"));
    } catch (error) {
      console.error("Error loading and muxing playlist:", error);
      this.updateStatus(`Error: ${error.message}`);
      this.dispatchEvent(new CustomEvent("error", { detail: error }));
    }
  }

  private handleAudioError(): void {
    const error = this.$audio.error;
    if (!error) return;

    const errorMessages: Record<number, string> = {
      1: "MEDIA_ERR_ABORTED - Loading was aborted",
      2: "MEDIA_ERR_NETWORK - Network error while loading",
      3: "MEDIA_ERR_DECODE - Error decoding audio",
      4: "MEDIA_ERR_SRC_NOT_SUPPORTED - Audio format not supported or source not found",
    };

    console.error(
      `Audio playback error: ${error.code} - ${errorMessages[error.code] || "Unknown error"}`,
    );
    console.error(`Error message: ${error.message}`);

    this.updateStatus(`Playback error: ${errorMessages[error.code]}`);

    this.dispatchEvent(
      new CustomEvent("playbackerror", {
        detail: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }),
    );
  }
}

export function defineJsonAudioPlayer(tag = "json-audio-player") {
  if (!customElements.get(tag)) {
    customElements.define(tag, JsonAudioPlayer);
  }
}
