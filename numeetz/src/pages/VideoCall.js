import React, { useEffect, useRef } from "react";
import Peer from "peerjs";

const VideoCall = () => {
  const myVideo = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Create a new Peer instance
    peerRef.current = new Peer();

    peerRef.current.on("open", (id) => {
      console.log("My peer ID:", id);
    });

    // Access user video
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      // Cleanup Peer instance when component unmounts
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      <h3>Video Call Started</h3>
      <video ref={myVideo} autoPlay playsInline style={{ width: "400px", height: "300px", borderRadius: "10px", backgroundColor: "black" }} />
    </div>
  );
};

export default VideoCall;
