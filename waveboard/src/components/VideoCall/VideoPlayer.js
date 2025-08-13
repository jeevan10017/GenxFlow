import React, { useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ track, name, isMuted, isCamOff, isScreenSharing, onClick, isEnlarged }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const playerContainer = videoRef.current;
        if (playerContainer && track && typeof track.play === 'function') {
            track.play(playerContainer);
        }
        return () => {
            if (track && typeof track.stop === 'function') {
                track.stop();
            }
        };
    }, [track]);

    // HIGHLIGHT: The avatar should show if the camera is off OR if there is no track available.
    const showAvatar = isCamOff || !track;
    const videoContainerClass = showAvatar ? 'hidden' : 'video-player__video';
    const avatarClass = showAvatar ? 'video-player__avatar' : 'hidden';

    return (
        <div className={`video-player-container ${isEnlarged ? 'enlarged' : ''}`} onClick={onClick}>
            <div ref={videoRef} className={videoContainerClass}></div>
            <div className={avatarClass}>
                {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="video-player__name">{isScreenSharing ? `${name} (Screen)` : name}</div>
        </div>
    );
};

export default VideoPlayer;