import React, { useState } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import axios from 'axios';
import './GitHubImport.css';

const GitHubImport = () => {
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/github/user/${username}/repos`);
      setRepos(response.data);
      message.success(`${response.data.length} projets trouvés`);
    } catch (error) {
      message.error('Erreur lors de la récupération des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (repo) => {
    try {
      await axios.post('/api/projects/import-from-github', {
        repoData: repo
      });
      message.success(`Projet ${repo.name} importé avec succès`);
    } catch (error) {
      message.error('Erreur lors de l\'importation');
    }
  };

  return (
    <div className="github-import">
      <Button 
        type="primary" 
        icon={<GithubOutlined />} 
        onClick={() => setVisible(true)}
      >
        Importer depuis GitHub
      </Button>

      <Modal
        title="Importer vos projets GitHub"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        <div className="search-section">
          <Input 
            placeholder="Votre nom d'utilisateur GitHub"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onPressEnter={fetchRepos}
          />
          <Button 
            type="primary" 
            onClick={fetchRepos}
            loading={loading}
          >
            Chercher
          </Button>
        </div>

        <div className="repos-list">
          {repos.map(repo => (
            <div key={repo.id} className="repo-item">
              <div className="repo-info">
                <h4>{repo.name}</h4>
                <p>{repo.description || 'Pas de description'}</p>
                <span className="repo-language">{repo.language}</span>
              </div>
              <Button 
                onClick={() => handleImport(repo)}
                className="import-btn"
              >
                Importer
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default GitHubImport;