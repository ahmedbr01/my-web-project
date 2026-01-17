// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Route publique pour tester l'API
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API publique fonctionne',
    timestamp: new Date().toISOString()
  });
});

// Récupérer TOUS les projets publics
router.get('/projects', async (req, res) => {
  try {
    console.log('🔄 Récupération projets publics...');
    
    const [projects] = await pool.execute(
      `SELECT 
        p.id,
        p.clientName as title,
        p.description,
        p.projectType as type,
        p.category,
        p.status,
        p.images,
        p.surface,
        p.projectAddress as location,
        p.created_at as date,
        p.is_featured as isFeatured
       FROM projects p
       WHERE p.status IN ('completed', 'in_progress')
       ORDER BY p.created_at DESC`
    );
    
    console.log(`📊 ${projects.length} projets trouvés`);
    
    // Formater les projets
    const formattedProjects = projects.map(project => {
      let images = [];
      try {
        if (project.images && project.images !== '[]') {
          images = JSON.parse(project.images);
        }
      } catch (error) {
        console.error('❌ Erreur parsing images:', error);
        images = [];
      }
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        type: project.type,
        status: project.status,
        category: project.category,
        images: images,
        surface: project.surface,
        location: project.location,
        date: project.date,
        isFeatured: project.isFeatured
      };
    });
    
    res.json({
      success: true,
      count: formattedProjects.length,
      projects: formattedProjects
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération projets publics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération projets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Récupérer les statistiques publiques
router.get('/stats', async (req, res) => {
  try {
    const [projectsCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM projects WHERE status = "completed"'
    );
    
    const [clientsCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "client"'
    );
    
    res.json({
      success: true,
      stats: {
        completedProjects: projectsCount[0]?.count || 0,
        happyClients: clientsCount[0]?.count || 0,
        yearsExperience: new Date().getFullYear() - 1985
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    res.json({
      success: true,
      stats: {
        completedProjects: 145,
        happyClients: 89,
        yearsExperience: 38
      }
    });
  }
});

module.exports = router;