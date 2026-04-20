FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG ATM_TEMPLATE_REMOTE_NAME=remote_template
ENV ATM_TEMPLATE_REMOTE_NAME=${ATM_TEMPLATE_REMOTE_NAME}

# Не задавать NODE_ENV=production до npm install — иначе npm не ставит devDependencies (webpack).
COPY package.json ./
RUN npm install

COPY babel.config.js webpack.config.js ./
COPY public ./public
COPY src ./src

ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
