const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/recent', projectController.getRecentProjects);

// Routes protégées pour les clients
router.post('/create', verifyToken, projectController.createProject);
router.get('/my-projects', verifyToken, projectController.getUserProjects);

// Routes protégées pour les admins
router.get('/all', verifyToken, isAdmin, projectController.getAllProjectsForAdmin);

module.exports = router;