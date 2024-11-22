# Utiliser une image officielle de Node.js
FROM node:20

# Définir le répertoire de travail
WORKDIR /app

# Installer node-pre-gyp globalement
RUN npm install -g node-pre-gyp

# Copier uniquement les fichiers de configuration des dépendances
COPY package*.json ./

# Installer les dépendances en mode production
RUN npm install --production

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application (si vous utilisez TypeScript avec NestJS)
RUN npm run build

# Exposer le port pour l'application
EXPOSE 3000

# Démarrer l'application en mode production
CMD ["npm", "run", "start:prod"]
