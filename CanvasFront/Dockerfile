# Étape 1 : Construction de l'application Angular
FROM node:18 AS build

WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Ajouter npm-force-resolutions pour corriger certaines versions
RUN npm install -g @angular/cli npm-force-resolutions --force

# Appliquer les résolutions si définies dans package.json
RUN npx npm-force-resolutions

# Installer les dépendances
RUN npm install --force

# Copier le reste de l'application
COPY . .

# Construire l'application Angular pour la production
RUN npm run build -- --configuration production

# Étape 2 : Image Nginx
FROM nginx:alpine

# Copier le build Angular dans nginx
COPY --from=build /usr/src/app/dist/canvas-front /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer nginx
CMD ["nginx", "-g", "daemon off;"]
