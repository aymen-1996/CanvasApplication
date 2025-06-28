# Étape 1 : Construction de l'application Angular
FROM node:18 AS build

WORKDIR /usr/src/app

# Copier les fichiers package.json
COPY package.json ./

# Installer Angular CLI globalement
RUN npm install -g @angular/cli --force

# Installer les dépendances
RUN npm install --force

# Copier le reste de l'application
COPY . .

# Construire l'application pour la production
RUN npm run build

# Supprimer la config Nginx par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier le build de Angular
COPY --from=build /usr/src/app/dist/canvas-front /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
