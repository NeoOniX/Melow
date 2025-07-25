# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copie les fichiers nécessaires
COPY package.json package-lock.json ./
RUN npm ci

# Copie le reste de l'app
COPY . .

# Génère le client Prisma
RUN npx prisma generate

# Build Next.js en mode production
RUN npm run build

# Étape 2 : Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copie uniquement ce qui est nécessaire pour lancer l'app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Crée le dossier d'upload s'il n'existe pas
RUN mkdir -p public/uploads

# Définir la variable d'environnement pour Next.js
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Déploiement prisma et lancement de l'application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

