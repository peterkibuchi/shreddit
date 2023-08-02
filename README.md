# Shreddit

> Modern Fullstack Reddit Clone built off Next.js 13 & TypeScript.
> Live demo [_here_](https://shreddit.vercel.app).

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Quickstart](#quickstart)
- [Project Status](#project-status)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Technologies Used

- TypeScript
- React 18
- Next.js 13
- NextAuth.js
- Prisma
- Shadcn UI
- Tailwind CSS

## Features

- Infinite scrolling for loading posts dynamically
- A beautiful and highly functional post editor
- Light and Dark modes
- Authentication using NextAuth & GitHub
- Custom feed for authenticated users
- Image uploads & link previews
- Full comment functionality with nested replies
- Optimistic updates for a great user experience
- New `/app` directory with React Server Components
- Data fetching and mutation with React Query
- Schema declarations and validations with Zod
- Advanced caching using Upstash Redis
- ... and much more

## Quickstart

To get it running, follow the steps below:

1. Clone repository and install dependencies:

```bash
# Clone repository
git clone git@github.com:peterkibuchi/shreddit.git

# Install dependencies
pnpm i
```

2. Copy `.env.example` to `.env` and update the variables.

```bash
cp .env.example .env
```

3. Sync the Prisma schema with your database

```bash
pnpm prisma db push
```

4. Start the development server:

```bash
pnpm dev
```

## Project Status

Project is: _complete_.

## Acknowledgements

- This is a [T3 Stack](https://create.t3.gg) project bootstrapped with `create-t3-app`.
- Many thanks to [Josh](https://www.youtube.com/@joshtriedcoding) for inspiring this project.

## License

This project is open source and available under the [MIT License](./LICENSE).
