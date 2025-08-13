import React, { useEffect, useState, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import socket from '../../utils/socket';
import VideoPlayer from './VideoPlayer';
import { Mic, MicOff, Video, VideoOff, ScreenShare, Phone, PhoneOff, XCircle } from 'lucide-react';
import './CallManager.css';

const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
console.log("Agora App ID:", AGORA_APP_ID);

const CallManager = ({ roomId, currentUser }) => {
    // UI and Call Flow State
    const [callState, setCallState] = useState('idle');
    const [incomingCall, setIncomingCall] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);

    // Local Media Track State
    const [localCameraTrack, setLocalCameraTrack] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localScreenTrack, setLocalScreenTrack] = useState(null);

    // Control State
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [enlargedView, setEnlargedView] = useState(null);

    // Refs for stable objects that persist across re-renders
    const agoraClient = useRef(null);
    const hasJoined = useRef(false);

    // =======================================================
    // --- HIGHLIGHT: The Main Fix ---
    // This useEffect hook now correctly sets up and tears down ALL event listeners.
    // It runs only once, creating a stable environment for Agora and Socket.IO.
    // =======================================================
    useEffect(() => {
        // Initialize Agora client only once
        if (!agoraClient.current) {
            agoraClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        }
        const client = agoraClient.current;

        // --- Agora Listeners ---
        const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
};
        const handleUserUnpublished = (user) => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        };
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);

        // --- Socket.IO Listener ---
        const handleCallInvitation = ({ callerInfo }) => {
            if (callState === 'idle') {
                setIncomingCall(callerInfo);
                setCallState('receiving');
            }
        };
        socket.on("call-invitation", handleCallInvitation);

        // --- Cleanup Function ---
        return () => {
            socket.off("call-invitation", handleCallInvitation);
            if (client) {
                client.off("user-published", handleUserPublished);
                client.off("user-unpublished", handleUserUnpublished);
            }
        };
    }, [callState]); // Dependency on callState is needed to read its latest value inside the listener

    const joinChannel = useCallback(async () => {
        if (hasJoined.current) return;
        try {
            const client = agoraClient.current;
            const tokenResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agora/token?channelName=${roomId}`);
            if (!tokenResponse.ok) throw new Error('Failed to fetch Agora token');
            const { token } = await tokenResponse.json();

            await client.join(AGORA_APP_ID, roomId, token, currentUser.id);
            hasJoined.current = true;

            const [audioTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            setLocalAudioTrack(audioTrack);
            setLocalCameraTrack(cameraTrack);
            await client.publish([audioTrack, cameraTrack]);
        } catch (error) {
            console.error("Error joining channel:", error);
            setCallState('idle');
        }
    }, [roomId, currentUser.id]);

    const leaveChannel = useCallback(async () => {
        if (!hasJoined.current) return;
        const client = agoraClient.current;

        localAudioTrack?.close();
        localCameraTrack?.close();
        localScreenTrack?.close();
        
        await client.leave();
        hasJoined.current = false;

        setLocalAudioTrack(null);
        setLocalCameraTrack(null);
        setLocalScreenTrack(null);
        setRemoteUsers([]);
        setIsMuted(false);
        setIsCamOff(false);
        setIsScreenSharing(false);
        setEnlargedView(null);
    }, [localAudioTrack, localCameraTrack, localScreenTrack]);

    const handleStartCall = async () => {
        setCallState('active');
        socket.emit("initiate-call", { roomId, callerInfo: { name: currentUser.name } });
        await joinChannel();
    };

    const handleAcceptCall = async () => {
        setCallState('active');
        setIncomingCall(null);
        await joinChannel();
    };

    const handleDeclineCall = () => { setCallState('idle'); setIncomingCall(null); };
    const handleEndCall = async () => { await leaveChannel(); setCallState('idle'); };
    const toggleMute = async () => { if (localAudioTrack) { await localAudioTrack.setMuted(!isMuted); setIsMuted(!isMuted); } };
    const toggleCamera = async () => { if (localCameraTrack) { await localCameraTrack.setEnabled(!isCamOff); setIsCamOff(!isCamOff); } };

    const toggleScreenShare = async () => {
    const client = agoraClient.current;

    if (isScreenSharing) {
        // --- STOPPING screen sharing ---
        setIsScreenSharing(false);
        
        // Unpublish the screen track first
        if (localScreenTrack) {
            await client.unpublish(localScreenTrack);
            localScreenTrack.close();
            setLocalScreenTrack(null);
        }
        
        // THEN, re-publish the camera track if it exists
        if (localCameraTrack) {
            await client.publish(localCameraTrack);
        }
    } else {
        // --- STARTING screen sharing ---
        try {
            // "auto" finds the best configuration for screen sharing
            const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");
            
            // Unpublish the camera track first
            if (localCameraTrack) {
                await client.unpublish(localCameraTrack);
            }
            
            // THEN, publish the new screen track
            await client.publish(screenTrack);
            
            // Update state AFTER successful publishing
            setIsScreenSharing(true);
            setLocalScreenTrack(screenTrack);

            // Add a listener for when the user clicks the browser's "Stop sharing" button
            screenTrack.on("track-ended", () => {
                // This automatically reverts to the camera view
                setIsScreenSharing(false);
                setLocalScreenTrack(null);
                client.unpublish(screenTrack);
                if (localCameraTrack) {
                    client.publish(localCameraTrack);
                }
            });
        } catch (err) {
            console.error("Screen share failed:", err);
            // Revert state if something goes wrong
            setIsScreenSharing(false);
            // Re-publish camera track on failure
            if (localCameraTrack) {
                await client.publish(localCameraTrack);
            }
        }
    }
};

    const handleToggleEnlarge = (id) => setEnlargedView(prev => (prev?.id === id ? null : { id }));

    // --- RENDER LOGIC ---
    const renderIdleState = () => (
        <div className="call-manager-idle">
            <button onClick={handleStartCall} className="start-call-btn"><Phone size={20} /> Start Call</button>
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
                <VideoPlayer track={localCameraTrack} name={`${currentUser?.name} (You)`} isMuted={true} isCamOff={isCamOff} onClick={() => handleToggleEnlarge('local-camera')} isEnlarged={enlargedView?.id === 'local-camera'}/>
                {isScreenSharing && <VideoPlayer track={localScreenTrack} name="Your Screen" isScreenSharing={true} isMuted={true} onClick={() => handleToggleEnlarge('local-screen')} isEnlarged={enlargedView?.id === 'local-screen'} />}
                {remoteUsers.map(user => <VideoPlayer key={user.uid} track={user.videoTrack} name={`User ${user.uid}`} onClick={() => handleToggleEnlarge(user.uid)} isEnlarged={enlargedView?.id === user.uid} />)}
            </div>
            <div className="controls-bar">
                <button onClick={toggleMute} className={isMuted ? 'off' : ''}>{isMuted ? <MicOff /> : <Mic />}</button>
                <button onClick={toggleCamera} className={isCamOff ? 'off' : ''} disabled={isScreenSharing}><Video /></button>
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
        </div>
    );
};

export default CallManager;