const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Routes protégées admin
router.get('/clients', verifyToken, isAdmin, adminController.getAllClients);
router.delete('/clients/:id', verifyToken, isAdmin, adminController.deleteClient);
router.delete('/projects/:id', verifyToken, isAdmin, adminController.deleteProject);

// Test route
router.get('/test', verifyToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Route admin fonctionne',
    adminId: req.userId
  });
});

module.exports = router;