const axios = require('axios');
const Project = require('../models/Project');

exports.importFromGitHub = async (req, res) => {
  try {
    const { userId, repoData } = req.body;
    
    // Vérifier si le projet existe déjà
    const existingProject = await Project.findOne({ 
      userId, 
      githubId: repoData.id 
    });
    
    if (existingProject) {
      return res.status(400).json({ 
        message: 'Ce projet existe déjà dans votre portfolio' 
      });
    }

    // Créer un nouveau projet
    const newProject = new Project({
      userId,
      title: repoData.name,
      description: repoData.description,
      githubUrl: repoData.html_url,
      githubId: repoData.id,
      technologies: repoData.language ? [repoData.language] : [],
      isFromGitHub: true
    });

    await newProject.save();

    res.status(201).json({
      message: 'Projet importé avec succès',
      project: newProject
    });
  } catch (error) {
    console.error('Error importing from GitHub:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'importation du projet' 
    });
  }
};