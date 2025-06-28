# Étape 1 : Construction de l'application Angular
FROM node:20 AS build

WORKDIR /usr/src/app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Nettoyer cache npm
RUN npm cache clean --force

# Installer Angular CLI globalement (avec --force si besoin)
RUN npm install -g @angular/cli --force

# Installer les dépendances
RUN npm install --force

# Copier tout le reste du code source
COPY . .

# Construire l'application Angular pour la production
RUN npm run build

# Étape 2 : Image Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers build Angular dans le dossier nginx
COPY --from=build /usr/src/app/dist/canvas-front /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer nginx en mode "daemon off" pour Docker
CMD ["nginx", "-g", "daemon off;"]
