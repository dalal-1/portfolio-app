from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
CORS(app)

# Configuration GitHub
GITHUB_USERNAME = 'NomUtilisateurGitHubIci'  # Remplacez par votre username GitHub
GITHUB_TOKEN = ''  # Facultatif : ajoutez votre token personnel GitHub si besoin

# Configuration du token de reset
app.config['SECRET_KEY'] = 'ma-cle-secrete'
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

@app.route('/api/github/import', methods=['GET'])
def import_github_projects():
    headers = {}
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'

    url = f'https://api.github.com/users/{GITHUB_USERNAME}/repos'
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Erreur lors de la récupération des projets'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email requis'}), 400

    token = serializer.dumps(email, salt='reset-password')
    reset_url = f"http://localhost:3000/reset-password/{token}"

    print(f"Lien de réinitialisation pour {email}: {reset_url}")
    return jsonify({'message': f'Un lien de réinitialisation a été envoyé à {email}.'})

if __name__ == '__main__':
    app.run(debug=True)