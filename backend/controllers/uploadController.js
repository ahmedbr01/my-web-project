const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/projects/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('📁 Fichier sauvegardé:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Créer un projet avec images
exports.createProjectWithImages = async (req, res) => {
  console.log('📸 Début création projet');
  
  try {
    console.log('📁 Fichiers reçus:', req.files?.length || 0);
    console.log('📊 Body:', req.body);
    
    // Récupérer les données du projet
    let projectData = {};
    try {
      if (req.body.projectData) {
        projectData = JSON.parse(req.body.projectData);
      }
    } catch (error) {
      console.error('❌ Erreur parsing projectData:', error);
    }
    
    console.log('📋 Données projet:', projectData);
    
    // CORRECTION: Traitement des images avec chemin ABSOLU
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // CHEMIN ABSOLU POUR LE FRONTEND
        const imageData = {
          filename: file.filename,
          path: `/uploads/projects/${file.filename}`, // TOUJOURS commencer par /uploads/
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        };
        images.push(imageData);
        console.log('📸 Image ajoutée:', imageData);
      });
      console.log(`📸 ${images.length} images traitées`);
    }
    
    // Vérifier l'utilisateur
    const userId = req.userId;
    let isAdmin = false;
    
    if (userId) {
      const [userRows] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
      isAdmin = userRows[0]?.role === 'admin';
    }
    
    console.log('👤 Utilisateur:', userId, 'Admin:', isAdmin);
    
    // Préparer les données d'insertion
    const insertData = [
      isAdmin ? null : userId,
      projectData.clientName || 'Projet sans nom',
      projectData.clientEmail || 'contact@sadraoui-construction.com',
      projectData.projectAddress || 'Tunis',
      projectData.projectType || 'construction',
      projectData.category || 'residential',
      projectData.surface || 0,
      projectData.description || 'Aucune description',
      projectData.status || 'pending',
      JSON.stringify(images),
      projectData.is_featured || false,
      true
    ];
    
    console.log('📝 Données insertion:', insertData);
    
    // Insérer dans la base de données
    const [result] = await pool.execute(
      `INSERT INTO projects (
        userId, clientName, clientEmail, projectAddress, projectType,
        category, surface, description, status, images, is_featured, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      insertData
    );
    
    const projectId = result.insertId;
    console.log('✅ Projet inséré - ID:', projectId);
    
    // Récupérer le projet créé
    const [projects] = await pool.execute(
      `SELECT 
        id,
        clientName as title,
        description,
        projectType as type,
        category,
        status,
        images,
        surface,
        projectAddress as location,
        created_at as date,
        is_featured as isFeatured
       FROM projects WHERE id = ?`,
      [projectId]
    );
    
    const createdProject = projects[0];
    if (createdProject) {
      // Parser les images
      try {
        createdProject.images = createdProject.images ? JSON.parse(createdProject.images) : [];
      } catch {
        createdProject.images = [];
      }
      
      console.log('📋 Projet créé:', createdProject);
      
      res.json({
        success: true,
        message: 'Projet créé avec succès',
        project: createdProject
      });
    } else {
      throw new Error('Projet non trouvé après insertion');
    }
    
  } catch (error) {
    console.error('🔥 ERREUR création projet:', error);
    console.error('🔥 Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
};

// Récupérer tous les projets publics - CORRECTION COMPLÈTE
exports.getAllProjectsPublic = async (req, res) => {
  try {
    console.log('🔄 Récupération projets publics...');
    
    const [projects] = await pool.execute(
      `SELECT 
        id,
        clientName as title,
        description,
        projectType as type,
        category,
        status,
        images,
        surface,
        projectAddress as location,
        created_at as date,
        is_featured as isFeatured
       FROM projects 
       WHERE is_public = 1
       ORDER BY created_at DESC`
    );
    
    console.log(`📊 ${projects.length} projets trouvés`);
    
    // CORRECTION: Formater correctement les projets avec URLs complètes
    const formattedProjects = projects.map(project => {
      let images = [];
      try {
        if (project.images && project.images !== '[]' && project.images !== 'null') {
          images = JSON.parse(project.images);
          
          // CORRECTION IMPORTANTE: Convertir en URLs complètes
          images = images.map(img => {
            // Si l'image a déjà un chemin complet
            if (img.path && img.path.startsWith('http')) {
              return img;
            }
            
            // Construire l'URL complète
            let imageUrl = '';
            if (img.path) {
              // Ajouter le domaine si manquant
              if (!img.path.startsWith('http')) {
                if (img.path.startsWith('/uploads')) {
                  imageUrl = `http://localhost:5000${img.path}`;
                } else if (img.path.startsWith('uploads')) {
                  imageUrl = `http://localhost:5000/${img.path}`;
                } else {
                  imageUrl = `http://localhost:5000/uploads/projects/${img.path}`;
                }
              } else {
                imageUrl = img.path;
              }
            } else if (img.filename) {
              imageUrl = `http://localhost:5000/uploads/projects/${img.filename}`;
            }
            
            return {
              ...img,
              path: imageUrl,
              displayUrl: imageUrl // URL pour l'affichage
            };
          });
        }
      } catch (error) {
        console.error('❌ Erreur parsing images:', error, 'Raw images:', project.images);
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
        isFeatured: project.isFeatured,
        // URL de l'image principale pour faciliter l'accès
        mainImage: images.length > 0 ? images[0].displayUrl || images[0].path : null
      };
    });
    
    res.json({
      success: true,
      count: formattedProjects.length,
      projects: formattedProjects
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération projets'
    });
  }
};