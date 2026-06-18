# Gunakan base image Node.js versi 18 Alpine yang ringan
FROM node:18-alpine AS builder

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan lockfile
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Salin sisa source code aplikasi
COPY . .

# Nonaktifkan telemetry Next.js selama proses build
ENV NEXT_TELEMETRY_DISABLED 1

# Build aplikasi Next.js untuk production
RUN npm run build

# Tahap Runner: Image produksi yang ringan
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Tambahkan user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin file hasil build dari tahap builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/public ./public

# Gunakan user non-root
USER nextjs

# Buka port 3000 (port default Next.js di production)
EXPOSE 3000

# Perintah start untuk menjalankan aplikasi
CMD ["npm", "start"]
