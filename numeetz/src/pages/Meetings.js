import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to signaling server

const Meetings = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS
    const peerInstance = new Peer();

    peerInstance.on("open", (id) => {
      setPeerId(id);
      socket.emit("register", id); // Send peer ID to server
    });

    peerInstance.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myVideoRef.current.srcObject = stream;
        call.answer(stream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });

        setCallAccepted(true);
      });
    });

    setPeer(peerInstance);
  }, []);

  const startCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myVideoRef.current.srcObject = stream;
      const call = peer.call(remotePeerId, stream);

      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      setCallAccepted(true);
    });
  };

  return (
    <div style={styles.container}>
      <h2>Video Meeting</h2>
      <div style={styles.videoContainer}>
        <video ref={myVideoRef} autoPlay muted style={styles.video}></video>
        <video ref={remoteVideoRef} autoPlay style={styles.video}></video>
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter Remote Peer ID"
          onChange={(e) => setRemotePeerId(e.target.value)}
          style={styles.input}
        />
        <button onClick={startCall} style={styles.button}>Start Call</button>
      </div>
      <p>Your Peer ID: {peerId}</p>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px" },
  videoContainer: { display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" },
  video: { width: "300px", height: "200px", border: "2px solid black" },
  input: { padding: "10px", marginRight: "10px" },
  button: { padding: "10px", backgroundColor: "blue", color: "white", cursor: "pointer" },
};

export default Meetings;
