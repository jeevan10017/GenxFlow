// routes/agoraRoutes.js
const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const router = express.Router();

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const generateAgoraToken = (req, res) => {
    const channelName = req.query.channelName;
    if (!channelName) {
        return res.status(400).json({ error: 'channelName is required' });
    }

    const uid = 0; // Let Agora assign the UID
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600; // Token valid for 1 hour (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            role,
            privilegeExpireTime
        );
        return res.json({ token });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        return res.status(500).json({ error: 'Failed to generate token' });
    }
};

router.get('/token', generateAgoraToken);

module.exports = router;