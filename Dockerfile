FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build args
ARG NEXT_PUBLIC_GATEWAY_URL
ENV NEXT_PUBLIC_GATEWAY_URL=${NEXT_PUBLIC_GATEWAY_URL}
ARG NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION
ENV NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION=${NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION}
ARG GATEWAY_INTERNAL_URL
ENV GATEWAY_INTERNAL_URL=${GATEWAY_INTERNAL_URL}

# Build
RUN pnpm run build

# Expose port
EXPOSE 3012

# Start
CMD ["pnpm", "next", "start", "-p", "3012", "-H", "0.0.0.0"]
