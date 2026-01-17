const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé, token manquant'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    const [rows] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [req.userId]
    );
    
    if (rows[0] && rows[0].role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de vérification des permissions'
    });
  }
};