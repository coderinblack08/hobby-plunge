import type { MediaConnection, Peer } from "peerjs";
import { Socket } from "socket.io-client";
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface CallerData {
  id: string;
  socketId: string;
  userId: string;
}

export let audioStream: MediaStream;
export let leaveCall: (() => void) | null = null;

export const useStore = create(
  combine(
    {
      pending: false,
      calling: null as CallerData | null,
    },
    (set, _get) => ({
      setPending: (pending: boolean) => set((state) => ({ ...state, pending })),
      setCalling: (calling: Partial<CallerData> | null) =>
        set(
          (state) =>
            ({
              ...state,
              calling: { ...state.calling, ...calling },
            } as any)
        ),
    })
  )
);

const addAudioStream = (stream: MediaStream) => {
  const audio = new Audio();
  audio.srcObject = stream;
  audio.addEventListener("loadedmetadata", () => audio.play());
  return audio;
};

const addVideoStream = (stream: MediaStream) => {};

const handleCall = (call: MediaConnection, socket: Socket) => {
  let audioSource: HTMLAudioElement;
  call.on("stream", (stream) => (audioSource = addAudioStream(stream)));
  socket.on("leave", () => {
    // reload window
    window.location.reload();
  });
  call.on("close", () => {
    const { setCalling, calling } = useStore.getState();
    socket.emit("leave", calling?.socketId);
    setCalling(null);
    console.log("call closed");
    audioSource.remove();
  });
};

export const listenOnDevices = async (peer: Peer, socket: Socket) => {
  audioStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  const { setPending } = useStore.getState();

  peer.on("call", (call) => {
    setPending(false);
    if (!audioStream) throw new Error("No media stream found");
    call.answer(audioStream);
    handleCall(call, socket);
  });

  socket.on("update", (data) => {
    const { setCalling, calling } = useStore.getState();
    if (calling) setCalling(data);
  });

  socket.on("match-made", (other, startCall) => {
    console.log(other);
    const { setCalling } = useStore.getState();
    if (startCall) {
      const call = peer.call(other.id, audioStream);
      handleCall(call, socket);
    }
    setPending(false);
    setCalling(other);
  });
};

export const findMatch = async (peer: Peer, userId: string, socket: Socket) => {
  const { setPending } = useStore.getState();
  setPending(true);
  socket.emit("find-match", { id: peer.id, userId });
};
