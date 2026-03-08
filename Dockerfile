FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy source
COPY . .

# Build
RUN pnpm build

# Production
FROM node:20-slim AS production
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
