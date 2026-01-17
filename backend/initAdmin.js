const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const [result] = await pool.execute(
      `INSERT INTO users (prenom, nom, email, password, role) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Admin', 'System', 'admin@construction.com', hashedPassword, 'admin']
    );
    
    console.log('✅ Utilisateur admin créé avec succès');
    console.log('📧 Email: admin@construction.com');
    console.log('🔑 Mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur création admin:', error.message);
  }
}

createAdminUser();