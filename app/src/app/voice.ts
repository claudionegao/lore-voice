// Módulo utilitário para lidar com WebRTC e WebSocket

export type VoiceStatus = 'disconnected' | 'connecting' | 'connected';

export class VoiceClient {
  private ws?: WebSocket;
  private pc?: RTCPeerConnection;
  private stream?: MediaStream;
  public status: VoiceStatus = 'disconnected';
  public onStatusChange?: (status: VoiceStatus) => void;
  public onRemoteStream?: (stream: MediaStream) => void;

  constructor(private wsUrl: string) {}

  async connect() {
    this.status = 'connecting';
    this.onStatusChange?.(this.status);
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      this.pc = new RTCPeerConnection();
      this.stream!.getTracks().forEach(track => this.pc!.addTrack(track, this.stream!));
      this.pc.onicecandidate = (e) => {
        if (e.candidate) {
          this.ws!.send(JSON.stringify({ type: 'candidate', candidate: e.candidate }));
        }
      };
      this.pc.ontrack = (e) => {
        this.onRemoteStream?.(e.streams[0]);
      };
      this.ws!.onmessage = async (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'offer') {
          await this.pc!.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await this.pc!.createAnswer();
          await this.pc!.setLocalDescription(answer);
          this.ws!.send(JSON.stringify({ type: 'answer', answer }));
        } else if (data.type === 'answer') {
          await this.pc!.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'candidate') {
          await this.pc!.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      };
      this.pc!.createOffer().then(offer => {
        this.pc!.setLocalDescription(offer);
        this.ws!.send(JSON.stringify({ type: 'offer', offer }));
      });
      this.status = 'connected';
      this.onStatusChange?.(this.status);
    };
    this.ws.onclose = () => {
      this.status = 'disconnected';
      this.onStatusChange?.(this.status);
    };
  }

  disconnect() {
    this.ws?.close();
    this.pc?.close();
    this.stream?.getTracks().forEach(t => t.stop());
    this.status = 'disconnected';
    this.onStatusChange?.(this.status);
  }
}
