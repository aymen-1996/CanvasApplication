# Étape 1 : Construction de l'application Angular
FROM node:20 AS build

# Répertoire de travail
WORKDIR /app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --force

# Copier le reste de l'application
COPY . .

# Construire l'application pour la production
RUN npm run build --prod

# Étape 2 : Exécution de l'application Angular
CMD [ "ng", "serve"]
