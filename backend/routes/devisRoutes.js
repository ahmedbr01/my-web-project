const express = require('express');
const router = express.Router();
const devisController = require('../controllers/devisController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route publique pour créer un devis (pas besoin de token)
router.post('/create', devisController.createDevis);

// Route protégée pour récupérer les devis d'un utilisateur
router.get('/my-devis', verifyToken, devisController.getUserDevis);

// Route test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route devis fonctionne',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;