const { pool } = require('../config/database');

class Project {
  static async create(projectData) {
    try {
      console.log('🔧 Création projet pour:', projectData.clientEmail);
      
      const [result] = await pool.execute(
        `INSERT INTO projects (
          clientName, clientEmail, clientPhone, projectAddress,
          projectType, surface, budget, tasks, additionalTasks,
          deadline, style, description, status, userId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectData.clientName || '',
          projectData.clientEmail || '',
          projectData.clientPhone || '',
          projectData.projectAddress || '',
          projectData.projectType || 'construction',
          projectData.surface || 0,
          projectData.budget || '',
          JSON.stringify(projectData.tasks || []),
          projectData.additionalTasks || '',
          projectData.deadline || '',
          projectData.style || '',
          projectData.description || '',
          'pending',
          projectData.userId || null
        ]
      );
      
      console.log(`✅ Projet créé - ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      console.error('❌ Erreur création projet:', error.message);
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM projects ORDER BY createdAt DESC'
      );
      
      return rows.map(project => ({
        ...project,
        tasks: JSON.parse(project.tasks || '[]')
      }));
    } catch (error) {
      console.error('❌ Erreur getAll:', error);
      throw error;
    }
  }

  static async getRecent(limit = 5) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM projects ORDER BY createdAt DESC LIMIT ?',
        [limit]
      );
      
      return rows.map(project => ({
        ...project,
        tasks: JSON.parse(project.tasks || '[]')
      }));
    } catch (error) {
      console.error('❌ Erreur getRecent:', error);
      throw error;
    }
  }
}

module.exports = Project;