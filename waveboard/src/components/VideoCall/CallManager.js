import React, { useEffect, useState, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import socket from '../../utils/socket';
import VideoPlayer from './VideoPlayer';
import { Mic, MicOff, Video, VideoOff, ScreenShare, Phone, PhoneOff, XCircle } from 'lucide-react';
import './CallManager.css';

const CallManager = ({ roomId, currentUser }) => {
    // --- STATE MANAGEMENT ---
    const [callState, setCallState] = useState('idle');
    const [incomingCall, setIncomingCall] = useState(null);
    const [peers, setPeers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [enlargedView, setEnlargedView] = useState(null);

    // State for local screen sharing
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [localScreenStream, setLocalScreenStream] = useState(null);

    // Refs for direct manipulation
    const peersRef = useRef([]);
    const screenStreamRef = useRef(null);

    // --- MEDIA & PEER CONNECTION LOGIC ---

    const getMedia = useCallback(async (constraints = { video: true, audio: true }) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error("Error accessing media devices.", err);
            return null;
        }
    }, []);

    const stopAllMedia = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            setLocalScreenStream(null);
            setIsScreenSharing(false);
        }
    }, [localStream]);

    // Main useEffect for handling all socket communications
    useEffect(() => {
        // --- INCOMING EVENTS FROM SERVER ---
        socket.on("call-invitation", ({ callerInfo }) => {
            if (callState === 'idle') {
                setIncomingCall(callerInfo);
                setCallState('receiving');
            }
        });

        socket.on("call-accepted", ({ calleeInfo }) => {
            if (callState === 'calling' || callState === 'active') {
                const peer = createPeer(calleeInfo.id, currentUser.id, localStream);
                peersRef.current.push({ peerID: calleeInfo.id, peer, user: calleeInfo });
                setPeers(prev => [...prev, { peerID: calleeInfo.id, user: calleeInfo, streams: {} }]);
            }
        });

        socket.on("user-joined", (payload) => {
            const peer = addPeer(payload.signal, payload.callerID, localStream, payload.user);
            peersRef.current.push({ peerID: payload.callerID, peer, user: payload.user });
            setPeers(prev => [...prev, { peerID: payload.callerID, user: payload.user, streams: {} }]);
        });

        socket.on("receiving-returned-signal", (payload) => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            if (item) item.peer.signal(payload.signal);
        });

        socket.on('screen-share-status-update', ({ userId, isSharing }) => {
            setPeers(prevPeers => prevPeers.map(p =>
                p.peerID === userId ? { ...p, isSharingScreen: isSharing } : p
            ));
        });

        socket.on("user-left", (id) => {
            const peerToRemove = peersRef.current.find(p => p.peerID === id);
            if (peerToRemove) peerToRemove.peer.destroy();
            peersRef.current = peersRef.current.filter(p => p.peerID !== id);
            setPeers(prev => prev.filter(p => p.peerID !== id));
        });

        // --- CLEANUP ---
        return () => {
            socket.off("call-invitation");
            socket.off("call-accepted");
            socket.off("user-joined");
            socket.off("receiving-returned-signal");
            socket.off('screen-share-status-update');
            socket.off("user-left");
        };
    }, [callState, localStream, currentUser]);

    // =======================================================
    // --- HIGHLIGHT: Fixed Track Handling Logic ---
    // This is the key fix. It reliably handles incoming video and screen share tracks without race conditions.
    // =======================================================
    const setupPeerEvents = (peer, peerID) => {
        peer.on('track', (track, stream) => {
            // A track's label reliably identifies it as a screen share.
            const isScreenTrack = track.kind === 'video' && track.label.toLowerCase().includes('screen');

            setPeers(prevPeers => {
                const newPeers = [...prevPeers];
                const peerIndex = newPeers.findIndex(p => p.peerID === peerID);

                if (peerIndex !== -1) {
                    const peerToUpdate = { ...newPeers[peerIndex] };
                    if (!peerToUpdate.streams) {
                        peerToUpdate.streams = {};
                    }

                    if (isScreenTrack) {
                        peerToUpdate.streams.screen = stream;
                    } else {
                        // All non-screen tracks are treated as the camera stream
                        peerToUpdate.streams.camera = stream;
                    }
                    newPeers[peerIndex] = peerToUpdate;
                }
                return newPeers;
            });
        });
    };
    
    // --- PEER CREATION ---
    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on("signal", signal => socket.emit("sending-signal", { userToSignal, callerID, signal, user: currentUser }));
        setupPeerEvents(peer, userToSignal);
        return peer;
    };

    const addPeer = (incomingSignal, callerID, stream, user) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on("signal", signal => socket.emit("returning-signal", { signal, callerID }));
        peer.signal(incomingSignal);
        setupPeerEvents(peer, callerID);
        return peer;
    };

    // --- CALL LIFECYCLE ACTIONS ---

    const handleStartCall = async () => {
        const stream = await getMedia();
        if (stream) {
            setCallState('calling');
            socket.emit("initiate-call", { roomId, callerInfo: { id: socket.id, name: currentUser.name } });
            setTimeout(() => setCallState('active'), 500);
        }
    };

    const handleAcceptCall = async () => {
        const stream = await getMedia();
        if (stream) {
            setCallState('active');
            socket.emit("accept-call", { callerId: incomingCall.id, calleeInfo: { id: socket.id, name: currentUser.name } });
            setIncomingCall(null);
        }
    };

    const handleDeclineCall = () => {
        setCallState('idle');
        setIncomingCall(null);
    };
    
    const handleEndCall = () => {
        stopAllMedia();
        setCallState('idle');

        // HIGHLIGHT: Fix for 'process is not defined' error
        peersRef.current.forEach(p => {
            try {
                p.peer.destroy();
            } catch (e) {
                console.error("Error destroying peer:", e);
            }
        });
        // End Highlight

        peersRef.current = [];
        setPeers([]);
        setEnlargedView(null); // Reset enlarged view on call end
    };

    // --- MEDIA CONTROLS ---

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = async () => {
        if (isCamOff) {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const newVideoTrack = newStream.getVideoTracks()[0];
            localStream.addTrack(newVideoTrack);
            for (const p of peersRef.current) {
                const sender = p.peer.streams[0]?.getVideoTracks()[0];
                if (sender) p.peer.replaceTrack(sender, newVideoTrack, localStream);
            }
            setIsCamOff(false);
        } else {
            const videoTrack = localStream?.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.stop();
                localStream.removeTrack(videoTrack);
            }
            setIsCamOff(true);
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // --- STOP screen sharing ---
            const screenTrack = screenStreamRef.current.getVideoTracks()[0];
            for (const p of peersRef.current) {
                p.peer.removeTrack(screenTrack, screenStreamRef.current);
            }
            screenTrack.stop();
            screenStreamRef.current = null;
            // HIGHLIGHT: Correctly setting state to null to remove the component
            setLocalScreenStream(null);
            setIsScreenSharing(false);
            socket.emit('screen-share-changed', { roomId, isSharing: false });
        } else {
            // --- START screen sharing ---
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStreamRef.current = stream;
                const screenTrack = stream.getVideoTracks()[0];

                setLocalScreenStream(stream);
                setIsScreenSharing(true);
                socket.emit('screen-share-changed', { roomId, isSharing: true });

                for (const p of peersRef.current) {
                    p.peer.addTrack(screenTrack, stream);
                }
                screenTrack.onended = () => {
                    if (screenStreamRef.current) {
                        toggleScreenShare();
                    }
                };
            } catch (err) {
                console.error("Screen share failed", err);
            }
        }
    };

    // --- UI RENDERING ---
     const handleToggleEnlarge = (id) => {
        if (enlargedView?.id === id) {
            setEnlargedView(null); // If it's already enlarged, shrink it
        } else {
            setEnlargedView({ id }); // Enlarge the clicked video
        }
    };

    const renderIdleState = () => (
        <div className="call-manager-idle">
            <button onClick={handleStartCall} className="start-call-btn">
                <Phone size={20} />
                Start Call
            </button>
        </div>
    );

    const renderReceivingState = () => (
        <div className="incoming-call-prompt">
            <p>{incomingCall?.name} is calling...</p>
            <div className="prompt-buttons">
                <button onClick={handleAcceptCall} className="accept-btn"><Phone size={18} /></button>
                <button onClick={handleDeclineCall} className="decline-btn"><XCircle size={18} /></button>
            </div>
        </div>
    );

    const renderActiveState = () => (
        <div className="video-call-active">
            <div className="video-grid">
                {/* Local User's Videos */}
                {localStream && (
                    <VideoPlayer
                        stream={localStream}
                        name={`${currentUser?.name} (You)`}
                        isMuted={true}
                        isCamOff={isCamOff}
                        // HIGHLIGHT: Added enlarge props
                        onClick={() => handleToggleEnlarge('local-camera')}
                        isEnlarged={enlargedView?.id === 'local-camera'}
                    />
                )}
               {localScreenStream && (
                    <VideoPlayer
                        stream={localScreenStream}
                        name="Your Screen"
                        isScreenSharing={true}
                        isMuted={true}
                        // HIGHLIGHT: Added enlarge props
                        onClick={() => handleToggleEnlarge('local-screen')}
                        isEnlarged={enlargedView?.id === 'local-screen'}
                    />
                )}


                {/* Remote Users' Videos */}
                  {peers.map(({ peerID, user, streams }) => (
                    <React.Fragment key={peerID}>
                        {streams.camera && (
                            <VideoPlayer
                                stream={streams.camera}
                                name={user?.name}
                                // HIGHLIGHT: Added enlarge props
                                onClick={() => handleToggleEnlarge(`${peerID}-camera`)}
                                isEnlarged={enlargedView?.id === `${peerID}-camera`}
                            />
                        )}
                        {streams.screen && (
                            <VideoPlayer
                                stream={streams.screen}
                                name={`${user?.name}'s Screen`}
                                isScreenSharing={true}
                                // HIGHLIGHT: Added enlarge props
                                onClick={() => handleToggleEnlarge(`${peerID}-screen`)}
                                isEnlarged={enlargedView?.id === `${peerID}-screen`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="controls-bar">
                <button onClick={toggleMute} className={isMuted ? 'off' : ''}>{isMuted ? <MicOff /> : <Mic />}</button>
                <button onClick={toggleCamera} className={isCamOff ? 'off' : ''} disabled={isScreenSharing}>{isCamOff ? <VideoOff /> : <Video />}</button>
                <button onClick={toggleScreenShare} className={isScreenSharing ? 'on' : ''}><ScreenShare /></button>
                <button onClick={handleEndCall} className="off"><PhoneOff /></button>
            </div>
        </div>
    );

    return (
        <div className="call-manager-container">
            {callState === 'idle' && renderIdleState()}
            {callState === 'receiving' && renderReceivingState()}
            {callState === 'active' && renderActiveState()}
            {callState === 'calling' && <div className="calling-status">Calling others...</div>}
        </div>
    );
};

export default CallManager;