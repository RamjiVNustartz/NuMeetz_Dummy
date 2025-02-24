import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { HiDesktopComputer } from "react-icons/hi";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";

const Meetings = () => {
  const [peerId, setPeerId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [peer, setPeer] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showMeetingBox, setShowMeetingBox] = useState(false); // NEW STATE
  const [isCallConnected, setIsCallConnected] = useState(false); 
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  let localStream = useRef(null);

  useEffect(() => {
    const randomPeerId = Math.floor(Math.random() * 9000) + 1000; // 4-digit random ID
    const newPeer = new Peer(randomPeerId.toString());
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setPeerId(id);
      console.log("My Peer ID:", id);
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        localStream.current = stream;
        myVideoRef.current.srcObject = stream;
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          setIsCallConnected(true);
        });
      });
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  const startCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream.current = stream;
      myVideoRef.current.srcObject = stream;
      const call = peer.call(remoteId, stream);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        setIsCallConnected(true)
      });
    });
  };

  const toggleAudio = () => {
    localStream.current.getAudioTracks()[0].enabled = isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    localStream.current.getVideoTracks()[0].enabled = isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  const endCall = () => {
    setIsCallConnected(false);
    localStream.current.getTracks().forEach((track) => track.stop());
    myVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.logoContainer}>
          <img src="/images/numeetz.jpg" alt="NuMeetz Logo" style={styles.logo} />
          <span style={styles.logoText}>NuMeetz</span>
        </div>
        <div style={styles.navLinks}>
          <HiDesktopComputer style={{ ...styles.meetingIcon, color: "#00AEEF" }} />
          <button onClick={() => setShowMeetingBox(true)} style={styles.meetingButton}>
            Meetings
          </button>
        </div>
      </nav>

      {showMeetingBox && (
        <div style={styles.mainContent}>
          <h2 style={styles.heading}>Meetings</h2>
          <div style={styles.meetingBox}>
          <div style={isCallConnected ? styles.fullVideoContainer : styles.videoContainer}>
              <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
              <video ref={myVideoRef} autoPlay playsInline style={styles.localVideo} />
              <div style={styles.controlsOverlay}>
                <button onClick={toggleAudio} style={styles.controlButton}>
                  {isAudioMuted ? <FaMicrophoneSlash size={24} color="red" /> : <FaMicrophone size={24} color="white" />}
                </button>
                <button onClick={toggleVideo} style={styles.controlButton}>
                  {isVideoMuted ? <FaVideoSlash size={24} color="red" /> : <FaVideo size={24} color="white" />}
                </button>
                <button onClick={endCall} style={{ ...styles.controlButton, backgroundColor: "red" }}>
                  <FaPhoneSlash size={24} color="white" />
                </button>
              </div>
            </div>
            {!isCallConnected && (
              <div style={styles.controls}>
                <p>Your Peer ID: {peerId}</p>
                <input
                  type="text"
                  placeholder="Enter Peer ID"
                  value={remoteId}
                  onChange={(e) => setRemoteId(e.target.value)}
                  style={styles.input}
                />
                <button style={styles.meetingButton} onClick={startCall}>
                  Start Call
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const styles = {
  container: { fontFamily: "Arial, sans-serif", backgroundColor: "#F8F9FC", height: "100vh" },
  navbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", backgroundColor: "#FFFFFF", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" },
  logoContainer: { display: "flex", alignItems: "center" },
  logo: { width: "90px", height: "90px", marginRight: "10px" },
  logoText: { fontSize: "28px", fontWeight: "bold" },
  navLinks: { display: "flex", gap: "20px", fontSize: "16px", marginRight: "720px" },
  meetingButton: { cursor: "pointer", fontWeight: "bold", color: "#00AEEF", border: "none", backgroundColor: "transparent", fontSize: "16px" },
  mainContent: { textAlign: "left", paddingTop: "30px", padding: "50px" },
  heading: { fontSize: "24px", fontWeight: "bold" },
  meetingBox: { marginTop: "20px", padding: "20px", backgroundColor: "#FFFFFF", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "800px", height: "500px", margin: "auto" },
  controlsOverlay: { position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px" },
  controlButton: { backgroundColor: "gray", border: "none", borderRadius: "50%", padding: "10px", cursor: "pointer" },
  videoContainer: { 
    position: "relative", 
    width: "600px", 
    height: "350px", 
    backgroundColor: "black", 
    borderRadius: "10px", 
    overflow: "hidden" 
  },
  fullVideoContainer: { 
    position: "relative", 
    width: "100%", 
    height: "90vh", 
    backgroundColor: "black", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: "10px", 
    overflow: "hidden" 
  },
  remoteVideo: { 
    width: "100%", 
    height: "100%", 
    borderRadius: "10px", 
    objectFit: "cover" 
  },
  localVideo: { 
    width: "180px", 
    height: "120px", 
    position: "absolute", 
    bottom: "20px", 
    right: "20px", 
    borderRadius: "10px", 
    border: "2px solid white", 
    zIndex: 2 
  },


};

export default Meetings;