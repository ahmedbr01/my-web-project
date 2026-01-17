const { pool } = require('../config/database');

exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      clients: rows
    });
  } catch (error) {
    console.error('🔥 ERREUR getAllClients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération clients'
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'ID client requis'
      });
    }
    
    // Vérifier si l'utilisateur existe
    const [userRows] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [clientId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    if (userRows[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un administrateur'
      });
    }
    
    // Supprimer d'abord les projets du client
    await pool.execute('DELETE FROM projects WHERE userId = ?', [clientId]);
    
    // Supprimer le client
    await pool.execute('DELETE FROM users WHERE id = ?', [clientId]);
    
    console.log(`✅ Client #${clientId} supprimé`);
    
    res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
    
  } catch (error) {
    console.error('🔥 ERREUR deleteClient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur suppression client'
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'ID projet requis'
      });
    }
    
    // Vérifier si le projet existe
    const [projectRows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    // Supprimer le projet
    await pool.execute('DELETE FROM projects WHERE id = ?', [projectId]);
    
    console.log(`✅ Projet #${projectId} supprimé`);
    
    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
    
  } catch (error) {
    console.error('🔥 ERREUR deleteProject:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur suppression projet'
    });
  }
};