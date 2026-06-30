# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install ALL deps (devDeps required for nest build + prisma CLI)
RUN npm install

# Generate Prisma Client before compiling
RUN npx prisma generate

# Copy only the files needed to compile
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Compile TypeScript to dist/
RUN npm run build

# Stage 2: Production image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# --ignore-scripts prevents @prisma/client postinstall from running
# prisma generate (prisma CLI is a devDep and won't be present here)
RUN npm install --omit=dev --ignore-scripts

# Restore the generated Prisma client artifacts
COPY --from=builder /app/node_modules/.prisma    ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma    ./node_modules/@prisma

# Copy prisma CLI (devDep needed at runtime for migrate deploy)
COPY --from=builder /app/node_modules/prisma     ./node_modules/prisma
RUN ln -sf /app/node_modules/prisma/build/index.js /app/node_modules/.bin/prisma

# Copy compiled app and schema
COPY --from=builder /app/dist   ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
