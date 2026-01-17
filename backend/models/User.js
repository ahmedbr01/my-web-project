const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Erreur findByEmail:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      console.log('🔧 Tentative de création utilisateur:', userData.email);
      
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const [result] = await pool.execute(
        `INSERT INTO users (prenom, nom, telephone, email, password, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userData.prenom,
          userData.nom || userData.prenom,
          userData.telephone || '',
          userData.email,
          hashedPassword,
          userData.role || 'client'
        ]
      );
      
      console.log('✅ Utilisateur créé avec ID:', result.insertId);
      
      return {
        id: result.insertId,
        prenom: userData.prenom,
        nom: userData.nom || userData.prenom,
        telephone: userData.telephone || '',
        email: userData.email,
        role: userData.role || 'client'
      };
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      console.error('❌ Erreur comparePassword:', error);
      throw error;
    }
  }
}

module.exports = User;