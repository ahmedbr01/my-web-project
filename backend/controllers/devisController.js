const { pool } = require('../config/database');

exports.createDevis = async (req, res) => {
  console.log('📝 DEVIS - Données reçues:', req.body);
  
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      projectAddress,
      projectType,
      surface,
      budget,
      description,
      tasks = [],
      additionalTasks,
      deadline,
      style
    } = req.body;

    // Validation
    if (!clientName || !clientEmail || !projectType) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et type de projet sont requis'
      });
    }

    // Récupérer userId si connecté
    let userId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        console.log('⚠️ Token non valide ou expiré, création devis anonyme');
      }
    }

    // Insérer dans la base de données
    const [result] = await pool.execute(
      `INSERT INTO projects (
        userId, clientName, clientEmail, clientPhone, projectAddress,
        projectType, surface, budget, description, tasks, additionalTasks,
        deadline, style, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        clientName.trim(),
        clientEmail.trim(),
        clientPhone || '',
        projectAddress || '',
        projectType,
        surface || 0,
        budget || '',
        description || '',
        JSON.stringify(tasks),
        additionalTasks || '',
        deadline || null,
        style || '',
        'pending'
      ]
    );

    console.log('✅ DEVIS inséré - ID:', result.insertId, 'pour:', clientEmail);

    res.status(201).json({
      success: true,
      message: 'Votre demande de devis a été envoyée avec succès !',
      devisId: result.insertId,
      clientName: clientName
    });

  } catch (error) {
    console.error('🔥 ERREUR création devis:', error);
    
    // Erreur de duplication
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Une demande similaire existe déjà'
      });
    }
    
    // Erreur de validation
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        success: false,
        message: 'Certaines données sont trop longues'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi de votre demande',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getUserDevis = async (req, res) => {
  try {
    const userId = req.userId;
    
    const [devis] = await pool.execute(
      `SELECT id, clientName, projectType, surface, budget, status, created_at 
       FROM projects 
       WHERE userId = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      devis: devis
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération devis'
    });
  }
};