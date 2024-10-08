# Utiliser une image de base de Node.js
FROM node:20

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le package.json et le package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application
RUN npm run build

# Exposer le port sur lequel l'application sera accessible
EXPOSE 3000

# Démarrer l'application en mode production
CMD ["npm", "run", "start:prod"]
