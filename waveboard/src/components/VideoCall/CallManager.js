import React, { useEffect, useState, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import socket from '../../utils/socket';
import VideoPlayer from './VideoPlayer';
import { Mic, MicOff, Video, VideoOff, ScreenShare, Phone, PhoneOff, XCircle } from 'lucide-react';
import './CallManager.css';

const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;

const CallManager = ({ roomId, currentUser, isDarkMode }) => {
    const [callState, setCallState] = useState('idle');
    const [incomingCall, setIncomingCall] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);

    const [localCameraTrack, setLocalCameraTrack] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localScreenTrack, setLocalScreenTrack] = useState(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [enlargedView, setEnlargedView] = useState(null);

    const agoraClient = useRef(null);
    const hasJoined = useRef(false);

    // This effect runs ONCE to initialize the client and set up stable listeners
   useEffect(() => {
        agoraClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        const client = agoraClient.current;

        const handleUserPublished = async (user, mediaType) => {
            await client.subscribe(user, mediaType);

             if (mediaType === "audio") {
                user.audioTrack?.play();
            }
            setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
        };
        const handleUserUnpublished = (user) => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        };

        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);

        return () => {
            if (client) {
                client.off("user-published", handleUserPublished);
                client.off("user-unpublished", handleUserUnpublished);
            }
        };
    }, []);

    // This effect handles the socket-based call invitations
    useEffect(() => {
        const handleCallInvitation = ({ callerInfo }) => {
            if (callState === 'idle') {
                setIncomingCall(callerInfo);
                setCallState('receiving');
            }
        };
        socket.on("call-invitation", handleCallInvitation);
        return () => {
            socket.off("call-invitation", handleCallInvitation);
        };
    }, [callState]);

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

    const toggleMute = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };
    const toggleCamera = async () => {
        if (localCameraTrack) {
            await localCameraTrack.setEnabled(!isCamOff);
            setIsCamOff(!isCamOff);
        }
    };
    const toggleScreenShare = async () => {
        const client = agoraClient.current;
        if (isScreenSharing) {
            setIsScreenSharing(false);
            if (localScreenTrack) {
                await client.unpublish(localScreenTrack);
                localScreenTrack.close();
                setLocalScreenTrack(null);
            }
            if (localCameraTrack) await client.publish(localCameraTrack);
        } else {
            try {
                const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");
                setIsScreenSharing(true);
                setLocalScreenTrack(screenTrack);
                if (localCameraTrack) await client.unpublish(localCameraTrack);
                await client.publish(screenTrack);

                screenTrack.on("track-ended", () => {
                    setIsScreenSharing(false);
                    setLocalScreenTrack(null);
                    if (localCameraTrack) client.publish(localCameraTrack);
                });
            } catch (err) {
                console.error("Screen share failed", err);
                setIsScreenSharing(false);
            }
        }
    };

    const handleToggleEnlarge = (id) => {
        setEnlargedView(prev => (prev?.id === id ? null : { id }));
    };

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
                {/* Local User's Videos */}
                <VideoPlayer track={localCameraTrack} name={`${currentUser?.name} (You)`} isMuted={true} isCamOff={isCamOff} onClick={() => handleToggleEnlarge('local-camera')} isEnlarged={enlargedView?.id === 'local-camera'}/>
                {isScreenSharing && <VideoPlayer track={localScreenTrack} name="Your Screen" isScreenSharing={true} isMuted={true} onClick={() => handleToggleEnlarge('local-screen')} isEnlarged={enlargedView?.id === 'local-screen'} />}
                
                {/* Remote Users' Videos */}
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

     const getEnlargedTrack = () => {
        if (!enlargedView) return null;
        const { id } = enlargedView;
        if (id === 'local-camera') return { track: localCameraTrack, name: `${currentUser.name} (You)`, isMuted: true };
        if (id === 'local-screen') return { track: localScreenTrack, name: "Your Screen", isScreenSharing: true, isMuted: true };
        const user = remoteUsers.find(u => u.uid === id);
        if (user) return { track: user.videoTrack, name: `User ${user.uid}` };
        return null;
    };

    const enlargedTrackInfo = getEnlargedTrack();
    
     return (
        <>
            <div className="call-manager-container">
                {callState === 'idle' && renderIdleState()}
                {callState === 'receiving' && renderReceivingState()}
                {callState === 'active' && renderActiveState()}
            </div>
            
            {/* HIGHLIGHT: Render the enlarged view modal as a top-level overlay */}
            {enlargedView && enlargedTrackInfo && (
                <div className="enlarged-view-modal-backdrop" onClick={() => handleToggleEnlarge(null)}>
                    <div className="enlarged-view-modal-content" onClick={(e) => e.stopPropagation()}>
                        <VideoPlayer {...enlargedTrackInfo} />
                    </div>
                </div>
            )}
        </>
    );
};

export default CallManager;