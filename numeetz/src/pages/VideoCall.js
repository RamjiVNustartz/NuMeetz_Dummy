import React, { useEffect, useRef, useState } from "react";
import ZegoExpressEngine from "zego-express-engine-webrtc";

const APP_ID = 1675359594; // Replace with your ZegoCloud App ID
const SERVER_SECRET = "9c5526e420f538357a2d9de722ab3932"; // Replace with your ZegoCloud Server Secret
const ROOM_ID = "testRoom";
const USER_ID = "user_" + Math.floor(Math.random() * 10000); // Unique user ID

const VideoCall = () => {
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [zegoClient, setZegoClient] = useState(null);

  useEffect(() => {
    // Initialize ZegoExpressEngine
    const zg = new ZegoExpressEngine(APP_ID, SERVER_SECRET);
    setZegoClient(zg);

    // Start engine
    zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
      if (updateType === "ADD" && streamList.length > 0) {
        const remoteStream = await zg.startPlayingStream(streamList[0].streamID);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      }
    });

    // Join room and publish stream
    async function joinRoom() {
      try {
        await zg.loginRoom(ROOM_ID, "token", { userID: USER_ID, userName: USER_ID });
        const localStream = await zg.createStream({ camera: { video: true, audio: true } });

        if (myVideoRef.current) {
          myVideoRef.current.srcObject = localStream;
        }

        zg.startPublishingStream(USER_ID, localStream);
      } catch (error) {
        console.error("ZegoCloud Error:", error);
      }
    }

    joinRoom();

    return () => {
      zg.stopPublishingStream(USER_ID);
      zg.logoutRoom(ROOM_ID);
      zg.destroyEngine();
    };
  }, []);

  return (
    <div>
      <h3>Video Call with ZegoCloud</h3>
      <video ref={myVideoRef} autoPlay playsInline muted style={{ width: "400px", height: "300px", borderRadius: "10px", backgroundColor: "black" }} />
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "400px", height: "300px", borderRadius: "10px", backgroundColor: "gray" }} />
    </div>
  );
};

export default VideoCall;
