
import React, { useEffect, useRef } from 'react';
import './VideoPlayer.css';

// HIGHLIGHT: Added onClick and isEnlarged props to the component signature
const VideoPlayer = ({ stream, name, isMuted, isCamOff, isScreenSharing, onClick, isEnlarged }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const showAvatar = isCamOff || (isScreenSharing && !stream?.getVideoTracks().length);
    const videoClass = showAvatar ? 'hidden' : 'video-player__video';
    const avatarClass = showAvatar ? 'video-player__avatar' : 'hidden';

    // HIGHLIGHT: The root div now handles the click and adds the 'enlarged' class when active.
    return (
        <div
            className={`video-player-container ${isEnlarged ? 'enlarged' : ''}`}
            onClick={onClick}
        >
            <video
                ref={videoRef}
                className={videoClass}
                autoPlay
                playsInline
                muted={isMuted}
            />
            <div className={avatarClass}>
                {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="video-player__name">{isScreenSharing ? `${name} (Screen)` : name}</div>
        </div>
    );
};

export default VideoPlayer;