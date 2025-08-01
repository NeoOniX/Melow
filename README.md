<img src="./public/imgs/icons/144x144.png" alt="Melow Logo" width="100" height="100">

# Melow

## All in one self-hosted music streaming service

This app allows you to manage your personal music collection.  
Organize artists, albums, and tracks. Create and share playlists. Enjoy immersive playback and synchronized lyrics.

## ✨ Main Features

- 🎧 **Music Library** - Manage a collection of artists, albums, and tracks.
- 📀 **Playlists** - Create and share playlists from your library.
- 🌌 **Immersive Player** - Includes a full-screen, vinyl-style playback mode.
- 📝 **Lyrics Display** - View synchronized or plain text lyrics while listening (using [LRCLib](https://lrclib.net/)).
- 🔒 **Authentication** - Secure access using [Auth.js](https://authjs.dev).
- 🧩 **Responsive UI** - Built with [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com), and [Lucide icons](https://lucide.dev).
- 🌐 **Progressive Web App** - Installable on mobile and desktop devices.
- 🎶 **Media Session API** - Control audio playback with notification (mobile) and media keys (desktop).
- 📦 **Self-Hosted** - Deploy your own instance and customize everything you want.

---

## 🛠️ Tech Stack

| Technology                                                                                                  | Description                             |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| <img width="25" src="https://nextjs.org/favicon.ico?favicon.e9a7e71a.ico"> [Next.js](https://nextjs.org)    | React-based fullstack framework         |
| <img width="25" src="https://www.prisma.io/images/favicon-32x32.png"> [Prisma](https://www.prisma.io)       | ORM for type-safe database access       |
| <img width="25" src="https://www.postgresql.org/favicon.ico"> [PostgreSQL](https://www.postgresql.org)      | Relational database                     |
| <img width="25" src="https://authjs.dev/favicon-32x32.png"> [Auth.js](https://authjs.dev)                   | Authentication for Next.js              |
| <img width="25" src="https://tailwindcss.com/favicons/favicon.ico"> [Tailwind CSS](https://tailwindcss.com) | CSS framework                           |
| <img width="25" src="https://ui.shadcn.com/favicon.ico"> [ShadCN UI](https://ui.shadcn.com/)                | UI components built on Radix & Tailwind |
| <img width="25" src="https://lucide.dev/favicon.ico"> [Lucide](https://lucide.dev)                          | Open source icon set                    |
| <img width="25" src="https://lrclib.net/favicon.ico"> [LRCLib](https://lrclib.net/)                         | Public API for lyrics                   |

---

## 🚀 Deploy

As a self-hosted application, Melow can be deployed on any server that supports Node.js.

### 1. Classic Deployment (Node.js + PostgreSQL)

#### Requirements

- Node.js >= 18
- PostgreSQL >= 14

#### Setup Instructions

1. Create a `.env` file at the root of the project:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/melow
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000
```

2. Install dependencies and setup the database:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
```

3. Build the application:

```bash
npm run build
```

3. Start the server:

```bash
npm run start
```

The app is available at [http://localhost:3000](http://localhost:3000).

---

### 2. Docker Deployment (Recommended for Production)

#### Files Provided

- `Dockerfile` - Builds the application image
- `docker-compose.yml` - Defines services for the app and PostgreSQL
- `docker-compose-local.yml` - Local deployment configuration
- `docker-compose.local-db.yml` - Local database-only configuration

#### Example `.env` for Docker

```env
DATABASE_URL=postgresql://melow-user:melow-pass@melow-db:5432/melow
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000
```

#### Start with Docker Compose

```bash
docker compose up -d
```

The app is available at [http://localhost:3000](http://localhost:3000).

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 👥 Contributors

Special thanks to all the below contributors for their valuable contributions:

- <img width="25px" src="https://avatars.githubusercontent.com/u/73028356?v=4"> [@AssADev](https://github.com/AssADev) for the Melow logo
- Skeletor for the vinyl disc and player arm vectors
