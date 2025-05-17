import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = "cf41d6410b994709a1b5f94781f473a2";
const CHANNEL = "test-channel";
const TOKEN = null;

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function AudioCall() {
  const [joined, setJoined] = useState(false);
  const localAudioTrack = useRef(null);

  const joinChannel = async () => {
    await client.join(APP_ID, CHANNEL, TOKEN, null);
    localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([localAudioTrack.current]);
    setJoined(true);
  };

  const leaveChannel = async () => {
    if (localAudioTrack.current) {
      localAudioTrack.current.stop();
      localAudioTrack.current.close();
    }
    await client.leave();
    setJoined(false);
  };

  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });

    client.on("user-unpublished", (user) => {
      user.audioTrack.stop();
    });

    return () => {
      leaveChannel();
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Agora Audio Call</h2>
      { !joined ? (
        <button onClick={joinChannel} className="mt-2 bg-blue-500 text-white p-2 rounded">
          Join Call
        </button>
      ) : (
        <button onClick={leaveChannel} className="mt-2 bg-red-500 text-white p-2 rounded">
          Leave Call
        </button>
      )}
    </div>
  );
}
