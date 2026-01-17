// test-images.js
const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function testImages() {
  try {
    console.log('🔍 Test des images...');
    
    // 1. Vérifier les projets dans la base
    const [projects] = await pool.execute('SELECT id, title, images FROM projects');
    console.log(`📊 ${projects.length} projets dans la base`);
    
    for (const project of projects) {
      console.log(`\n📋 Projet ${project.id}: ${project.title}`);
      
      if (project.images && project.images !== '[]') {
        try {
          const images = JSON.parse(project.images);
          console.log(`📸 ${images.length} images:`);
          
          images.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.filename || img.path}`);
            
            // Vérifier si le fichier existe
            if (img.filename) {
              const filePath = path.join(__dirname, 'uploads/projects', img.filename);
              const exists = fs.existsSync(filePath);
              console.log(`     Fichier: ${exists ? '✅ Existe' : '❌ Manquant'}`);
              console.log(`     Chemin: ${filePath}`);
            }
            
            // Afficher l'URL complète
            const url = `http://localhost:5000/uploads/projects/${img.filename || img.path}`;
            console.log(`     URL: ${url}`);
          });
        } catch (error) {
          console.log(`❌ Erreur parsing images: ${error.message}`);
        }
      } else {
        console.log('📭 Aucune image');
      }
    }
    
    // 2. Vérifier les fichiers dans le dossier uploads
    const uploadsDir = path.join(__dirname, 'uploads/projects');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`\n📁 Fichiers dans uploads/projects/: ${files.length}`);
      files.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    } else {
      console.log('❌ Dossier uploads/projects/ non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testImages();