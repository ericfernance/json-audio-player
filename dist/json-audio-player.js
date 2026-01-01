class u extends HTMLElement {
  $audio;
  playlist = [];
  muxedBlobUrl = null;
  constructor() {
    if (super(), this.attachShadow({ mode: "open" }), !this.shadowRoot) throw new Error("Shadow root not available");
    this.shadowRoot.innerHTML = `
      <div>
        <div id="status">Loading...</div>
        <audio id="audio" controls></audio>
      </div>
    `, this.$audio = this.shadowRoot.querySelector("#audio"), this.$audio.addEventListener("ended", () => {
      console.log("Playback finished"), this.dispatchEvent(new CustomEvent("playlistended"));
    }), this.$audio.addEventListener("error", () => {
      this.handleAudioError();
    });
  }
  connectedCallback() {
    console.log(`Audio player connected with src: ${this.getAttribute("src")}`);
    const t = this.getAttribute("src");
    this.loadAndMuxPlaylist(t);
  }
  disconnectedCallback() {
    this.muxedBlobUrl && URL.revokeObjectURL(this.muxedBlobUrl);
  }
  updateStatus(t) {
    const o = this.shadowRoot?.querySelector("#status");
    o && (o.textContent = t), console.log(t);
  }
  async loadAndMuxPlaylist(t) {
    try {
      this.updateStatus("Loading playlist...");
      const o = this.getAttribute("customHeaders") ?? "{}", n = JSON.parse(o), l = await (await fetch(t, {
        headers: n
      })).json();
      this.playlist = l.files, console.log(`Found ${this.playlist.length} chunks to download and mux`), this.updateStatus(`Downloading ${this.playlist.length} chunks...`);
      const i = [];
      for (let e = 0; e < this.playlist.length; e++) {
        this.updateStatus(
          `Downloading chunk ${e + 1}/${this.playlist.length}...`
        );
        const a = await fetch(this.playlist[e]);
        if (!a.ok)
          throw new Error(
            `Failed to download chunk ${e + 1}: ${a.statusText}`
          );
        const r = await a.blob();
        i.push(r), console.log(`Downloaded chunk ${e + 1}: ${r.size} bytes`);
      }
      this.updateStatus("Muxing chunks into complete file...");
      const d = new Blob(i, { type: "audio/webm" });
      this.muxedBlobUrl = URL.createObjectURL(d), this.updateStatus("Ready to play"), this.$audio.src = this.muxedBlobUrl, console.log("Successfully muxed all chunks into single playable file"), this.dispatchEvent(new CustomEvent("ready"));
    } catch (o) {
      console.error("Error loading and muxing playlist:", o), this.updateStatus(
        `Error: ${o instanceof Error ? o.message : String(o)}`
      ), this.dispatchEvent(new CustomEvent("error", { detail: o }));
    }
  }
  handleAudioError() {
    const t = this.$audio.error;
    if (!t) return;
    const o = {
      1: "MEDIA_ERR_ABORTED - Loading was aborted",
      2: "MEDIA_ERR_NETWORK - Network error while loading",
      3: "MEDIA_ERR_DECODE - Error decoding audio",
      4: "MEDIA_ERR_SRC_NOT_SUPPORTED - Audio format not supported or source not found"
    };
    console.error(
      `Audio playback error: ${t.code} - ${o[t.code] || "Unknown error"}`
    ), console.error(`Error message: ${t.message}`), this.updateStatus(`Playback error: ${o[t.code]}`), this.dispatchEvent(
      new CustomEvent("playbackerror", {
        detail: {
          errorCode: t.code,
          errorMessage: t.message
        }
      })
    );
  }
}
function c(s = "json-audio-player") {
  customElements.get(s) || customElements.define(s, u);
}
c();
export {
  u as JsonAudioPlayer,
  c as defineJsonAudioPlayer
};
//# sourceMappingURL=json-audio-player.js.map
