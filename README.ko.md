# Mod-B

> Next.js와 Payload CMS로 개발한 현대적인 커뮤니티 CMS

Mod-B는 게시판을 넘어 다양한 커뮤니티 서비스를 구축할 수 있도록 설계된 CMS 기반 플랫폼입니다.

Payload CMS의 강력한 관리 기능과 Next.js App Router의 최신 기능을 활용하여 빠르고 확장 가능한 커뮤니티를 구축할 수 있습니다.

---

# 주요 기능

## 커뮤니티

- 다중 게시판
- Lexical / Tiptap 에디터
- 댓글 및 대댓글
- 익명 게시글 / 댓글
- 비밀 게시글
- 파일 첨부
- 이미지 갤러리
- 알림
- 검색
- 인기글
- 최신글
- 마이페이지
- 북마크

## CMS

- 홈페이지 빌더
- 페이지 빌더
- 히어로 슬라이더
- 공지사항 티커
- 광고 관리
- 네비게이션 관리
- 사이트 설정
- 헤더 / 푸터 관리

## 관리자

- 권한 관리
- Audit Log
- Login Log
- 사용자 관리
- Soft Delete
- Restore
- Media Library
- Dashboard

---

# 기술 스택

- Next.js 16
- Payload CMS 3
- TypeScript
- PostgreSQL
- Docker
- pnpm
- Lexical / Tiptap Editor

---

# 설치

## 요구사항

- Node.js 20 이상
- pnpm
- Docker
- PostgreSQL

## 실행

With Docker (recommend)

```bash
git clone https://github.com/your-name/mod-b.git

cd mod-b

# copy and edit .env
cp .env.example .env

# for development
docker compose -f compose.yml -f compose.dev.yml up -d --build

# for production
docker compose -f compose.yml -f compose.prod.yml up -d --build

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

웹블라우져에서 localhost:3000 


---

# 스크린샷

![Mod-B Screenshot](docs/images/Mod-B_Home.png)

## Demo
![Mod-B Demo](docs/images/Mod-B_Demo.png)
---

# 문서 (TODO)

자세한 개발 문서는 **docs/** 폴더를 참고하세요.

_TODO_

---

# 로드맵

- [x] 다중 게시판
- [x] 홈페이지 빌더
- [x] 광고 시스템
- [x] 알림 시스템
- [x] Soft Delete
- [x] OAuth 로그인
- [ ] 실시간 알림
- [ ] WebSocket 채팅
- [ ] REST API
- [ ] GraphQL
- [ ] 모바일 앱
- [ ] 문서화

---

# 참여하기

참여를 환영합니다.

Pull Request를 보내기 전에 **CONTRIBUTING.md**를 확인해주세요.

---

# 라이선스

MIT License