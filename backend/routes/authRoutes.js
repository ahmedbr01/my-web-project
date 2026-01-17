const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profil utilisateur',
    userId: req.userId
  });
});

router.get('/admin-test', verifyToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Accès admin autorisé'
  });
});

// Route test
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Route auth fonctionne !',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;