FROM node:24-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

WORKDIR /home/node/app

RUN mkdir -p /home/node/app \
    && chown -R node:node /home/node/app

COPY --chown=node:node package.json pnpm-lock.yaml ./

USER node

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]