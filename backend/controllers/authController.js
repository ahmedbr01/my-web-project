const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      telephone: user.telephone,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    console.log('📝 REGISTER - Body reçu:', req.body);
    
    const { prenom, nom, telephone, email, password } = req.body;
    
    if (!prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Prénom, email et mot de passe sont requis'
      });
    }
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // TOUJOURS créer un utilisateur avec rôle 'client'
    const user = await User.create({
      prenom,
      nom: nom || prenom,
      telephone: telephone || '',
      email,
      password,
      role: 'client' // FORCER le rôle client
    });
    
    const token = generateToken(user);
    
    console.log('✅ Inscription réussie pour:', email);
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie !',
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        telephone: user.telephone,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('🔥 ERREUR register:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔑 LOGIN - Tentative pour:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const isPasswordValid = await User.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const token = generateToken(user);
    
    console.log('✅ Connexion réussie pour:', email);
    
    res.json({
      success: true,
      message: 'Connexion réussie !',
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        telephone: user.telephone,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('🔥 ERREUR login:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};