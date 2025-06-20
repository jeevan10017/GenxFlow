const express = require('express');
const {getAllCanvases, createCanvas, loadCanvas,updatedCanvas, deleteCanvas,shareCanvas} = require('../controllers/canvasController');
const authenticator = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authenticator, getAllCanvases);
router.post('/create', authenticator, createCanvas);
router.get('/:id', authenticator, loadCanvas);  
router.put('/:id', authenticator, updatedCanvas); 
router.delete('/:id', authenticator, deleteCanvas); 
router.put('/share/:id', authenticator, shareCanvas); 





module.exports = router;