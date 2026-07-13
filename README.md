# Mod-B

> A modern community CMS built with Next.js and Payload CMS.

Mod-B is a full-featured community platform designed for building modern forums, communities, knowledge bases, and content-driven websites. It combines the flexibility of Payload CMS with the power of Next.js App Router to provide a scalable, customizable, and developer-friendly solution.

---

## ✨ Features

### Community

- Multi-board architecture
- Rich text editor (Lexical/Tiptop)
- Comments & nested replies
- Anonymous posts & comments
- Secret posts
- File attachments
- Image galleries
- Mentions / Notifications
- Search
- Trending posts
- Popular posts
- Recent posts
- My Page
- Bookmarks

### CMS

- Dynamic homepage builder
- Page Builder
- Hero slider
- Announcement ticker
- Advertisement management
- Navigation management
- Site settings
- Footer & Header management
- Global sidebar

### Administration

- Role-based access control
- Audit logs
- Login logs
- User management
- Soft delete & restore
- Media library
- Dashboard

---

## 🛠 Tech Stack

- Next.js 16
- Payload CMS 3
- TypeScript
- PostgreSQL
- Docker
- pnpm
- Lexical / Tiptop Editor

---

## 🚀 Getting Started

### Requirements

- Node.js 20+
- pnpm
- Docker (recommend)
- PostgreSQL (recommend)

### Installation

With Docker (recommend)

```bash
git clone https://github.com/your-name/mod-b.git

cd mod-b

# copy and edit .env
cp .env.example .env

# for development
docker compose up -d --build

# for production
docker compose -f compose.prod.yml up -d --build

# open your browser with localhost:3000 or your domain

```

Without Docker

``` bash

node --version
pnpm --version

npm install -g pnpm@10
nvm install 24
nvm use 24

git clone https://github.com/abc101/mod-b.git mod-b
cd mod-b

cp sample.env .env

# Edit .env for example:

DATABASE_URL=postgres://admin:password@localhost:5432/mod_b
PAYLOAD_SECRET=
AUTH_SECRET=
APP_URL=http://localhost:3000

SERVER_URLS=localhost:3000

NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
AUTH_URL=http://localhost:3000

PAYLOAD_PORT=3000

# Generate Secret
openssl rand -hex 32


# SMTP settings if you have
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true

SMTP_USER=user@example.com
SMTP_PASSWORD=your-password

SMTP_FROM_NAME=Mod-B
SMTP_FROM_EMAIL=noreply@example.com

SMTP_REJECT_UNAUTHORIZED=true

# Install dependencies

pnpm install --frozen-lockfile
pnpm install

# For th Media folder
mkdir -p media
chmod u+rwX media

# Database migration
pnpm payload migrate

# Run development mode
pnpm dev

# Run production mode
#pnpm start

```

Open your browser: localhost:3000


---

## 📷 Screenshots

![Mod-B Screenshot](docs/images/Mod-B_Home.png)

## Demo
![Mod-B Demo](docs/images/Mod-B_Demo.png)

---

## 📚 Documentation

Detailed documentation can be found in the **docs/** directory.

_TODO_

---

## 🗺 Roadmap

- [x] Multi-board system
- [x] Homepage Builder
- [x] Advertisement System
- [x] Notifications
- [x] Soft Delete
- [x] OAuth Login
- [ ] Realtime Notifications
- [ ] WebSocket Chat
- [ ] REST API
- [ ] GraphQL
- [ ] Mobile App
- [ ] Documentation

---

## 🤝 Contributing

Contributions are welcome!

Please read **CONTRIBUTING.md** before submitting a pull request.

---

## 📄 License

This project is licensed under the MIT License.