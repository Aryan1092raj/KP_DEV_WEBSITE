FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN if [ -n "$VITE_API_BASE_URL" ]; then export VITE_API_BASE_URL="$VITE_API_BASE_URL"; fi; \
	if [ -n "$VITE_SUPABASE_URL" ]; then export VITE_SUPABASE_URL="$VITE_SUPABASE_URL"; fi; \
	if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then export VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY"; fi; \
	npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV PORT=80

EXPOSE 80
