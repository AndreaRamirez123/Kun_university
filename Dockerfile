# Imagen de la API (NestJS) para Google Cloud Run.
# Se construye desde la raíz del monorepo para usar el package-lock.json común
# y llevar el catálogo académico, que Krucn lee al arrancar.

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci --workspace=api --include-workspace-root=false
COPY api api
RUN npm run build --workspace=api

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci --workspace=api --include-workspace-root=false --omit=dev && npm cache clean --force
COPY --from=build /app/api/dist api/dist
COPY web/src/data/KUN_catalogo_escuelas_programas_materias.json api/data/
WORKDIR /app/api
USER node
CMD ["node", "dist/main.js"]
