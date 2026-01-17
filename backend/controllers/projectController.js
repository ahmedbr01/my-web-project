const Project = require('../models/Project');
const { pool } = require('../config/database');

exports.createProject = async (req, res) => {
  try {
    console.log('📝 CREATE PROJECT - User ID:', req.userId);
    
    if (!req.body.clientName || !req.body.clientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email requis'
      });
    }
    
    const projectData = {
      ...req.body,
      userId: req.userId
    };

    const projectId = await Project.create(projectData);
    
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      projectId
    });
    
  } catch (error) {
    console.error('🔥 ERREUR createProject:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur création projet'
    });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    console.log('📋 GET USER PROJECTS - User ID:', req.userId);
    
    const [projects] = await pool.execute(
      `SELECT * FROM projects 
       WHERE userId = ? 
       ORDER BY createdAt DESC`,
      [req.userId]
    );
    
    console.log(`📊 ${projects.length} projets trouvés pour user ${req.userId}`);
    
    res.json({
      success: true,
      projects: projects.map(project => ({
        ...project,
        tasks: JSON.parse(project.tasks || '[]')
      }))
    });
    
  } catch (error) {
    console.error('🔥 ERREUR getUserProjects:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération projets utilisateur'
    });
  }
};

exports.getAllProjectsForAdmin = async (req, res) => {
  try {
    console.log('📋 GET ALL PROJECTS FOR ADMIN');
    
    const [projects] = await pool.execute(
      `SELECT * FROM projects 
       ORDER BY createdAt DESC`
    );
    
    console.log(`📊 ${projects.length} projets trouvés`);
    
    res.json({
      success: true,
      count: projects.length,
      projects: projects.map(project => ({
        ...project,
        tasks: JSON.parse(project.tasks || '[]')
      }))
    });
    
  } catch (error) {
    console.error('🔥 ERREUR getAllProjectsForAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération tous les projets'
    });
  }
};

exports.getRecentProjects = async (req, res) => {
  try {
    const [projects] = await pool.execute(
      'SELECT * FROM projects ORDER BY createdAt DESC LIMIT 5'
    );
    
    res.json({
      success: true,
      projects: projects.map(project => ({
        ...project,
        tasks: JSON.parse(project.tasks || '[]')
      }))
    });
  } catch (error) {
    console.error('🔥 ERREUR getRecentProjects:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération projets récents'
    });
  }
};