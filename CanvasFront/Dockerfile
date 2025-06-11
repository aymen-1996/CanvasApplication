# Étape 1 : Construction de l'application Angular
FROM node:18 AS build

WORKDIR /usr/src/app

ARG backendHost
ENV backendHost=${backendHost}

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

# Étape 2 : Image Nginx
FROM nginx:alpine

# Copier le build de Angular
COPY --from=build /usr/src/app/dist/* /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
