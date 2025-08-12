import React, { useEffect, useState, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import socket from '../../utils/socket';
import VideoPlayer from './VideoPlayer';
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from 'lucide-react';
import './VideoCall.css';

const VideoCall = ({ roomId, currentUser }) => {
  const [peers, setPeers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [enlargedPeerId, setEnlargedPeerId] = useState(null);

  const userVideoRef = useRef();
  const peersRef = useRef([]);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setupSocketListeners(stream);
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  }, []);

  const setupSocketListeners = (stream) => {
    socket.on("all-users", (users) => {
      const newPeers = [];
      users.forEach(user => {
        const peer = createPeer(user.id, socket.id, stream, user);
        peersRef.current.push({
          peerID: user.id,
          peer,
          user,
        });
        newPeers.push({ peerID: user.id, peer, user });
      });
      setPeers(newPeers);
    });

    socket.on("user-joined", (payload) => {
      const peer = addPeer(payload.signal, payload.callerID, stream, payload.user);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
        user: payload.user,
      });
      setPeers(users => [...users, { peerID: payload.callerID, peer, user: payload.user }]);
    });

    socket.on("receiving-returned-signal", (payload) => {
      const item = peersRef.current.find(p => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });
    
    socket.on("user-left", id => {
      const item = peersRef.current.find(p => p.peerID === id);
      if (item) {
        item.peer.destroy();
      }
      const newPeers = peersRef.current.filter(p => p.peerID !== id);
      peersRef.current = newPeers;
      setPeers(newPeers);
      if (enlargedPeerId === id) setEnlargedPeerId(null);
    });
  };

  useEffect(() => {
    initializeMedia();
    return () => {
      socket.off("all-users");
      socket.off("user-joined");
      socket.off("receiving-returned-signal");
      socket.off("user-left");
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, [initializeMedia]);

  const createPeer = (userToSignal, callerID, stream, user) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on("signal", signal => {
      socket.emit("sending-signal", { userToSignal, callerID, signal, user: currentUser });
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream, user) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on("signal", signal => {
      socket.emit("returning-signal", { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isCamOff;
      setIsCamOff(!isCamOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!screenStream) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
        setScreenStream(stream);
        const screenTrack = stream.getVideoTracks()[0];
        peersRef.current.forEach(p => p.peer.replaceTrack(localStream.getVideoTracks()[0], screenTrack, localStream));
        screenTrack.onended = () => toggleScreenShare(); // Stop when user clicks "Stop sharing"
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      const localVideoTrack = localStream.getVideoTracks()[0];
      peersRef.current.forEach(p => p.peer.replaceTrack(p.peer.streams[0].getVideoTracks()[0], localVideoTrack, localStream));
    }
  };
  
  const toggleEnlarged = (peerId) => {
    if (enlargedPeerId === peerId) {
      setEnlargedPeerId(null);
    } else {
      setEnlargedPeerId(peerId);
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-grid">
        <VideoPlayer
          stream={localStream}
          name={`${currentUser?.name} (You)`}
          isMuted={true}
          isCamOff={isCamOff}
          isScreenSharing={!!screenStream}
          onToggleSize={() => toggleEnlarged('local')}
          isEnlarged={enlargedPeerId === 'local'}
        />
        {peers.map(item => (
          <VideoPlayer
            key={item.peerID}
            stream={item.peer.streams[0]}
            name={item.user?.name}
            isMuted={false}
            onToggleSize={() => toggleEnlarged(item.peerID)}
            isEnlarged={enlargedPeerId === item.peerID}
          />
        ))}
      </div>
      <div className="controls-bar">
        <button onClick={toggleMute} className={isMuted ? 'off' : 'on'}>{isMuted ? <MicOff /> : <Mic />}</button>
        <button onClick={toggleCamera} className={isCamOff ? 'off' : 'on'}>{isCamOff ? <VideoOff /> : <Video />}</button>
        <button onClick={toggleScreenShare} className={screenStream ? 'on' : 'off'}>{<ScreenShare />}</button>
      </div>
    </div>
  );
};

export default VideoCall;