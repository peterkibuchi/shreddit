# Shreddit

> Modern fullstack Reddit clone, built with Next.js & Tailwind and deployed on Vercel.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Meta-Features](#meta-features)
- [Quickstart](#quickstart)
- [Project Status](#project-status)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Technologies Used

- React 19
- Next.js 16
- NextAuth.js
- Drizzle ORM
- Shadcn UI
- Tailwind CSS
- TypeScript
- UploadThing

## Features

- Infinite scrolling for loading posts dynamically
- A beautiful and highly functional post editor
- Beautiful UI powered by Shadcn UI
- Light and Dark modes
- Authentication using NextAuth & GitHub
- Custom feed for authenticated users
- Image uploads (with UploadThing) & link previews
- Full comment functionality with nested replies
- ... and much more

## Meta-Features

- Next.js `/app` dir
- React Client and Server Components
- Metadata configuration for improved SEO and web shareability
- Data fetching and mutation with React Query
- Graceful loading states and optimistic updates for a great UX
- Advanced caching with Upstash Redis
- Schema declarations and validations with Zod
- Typesafe code and best practices made possible by TypeScript, ESLint and Prettier
- Automated `format`, `lint` and `typecheck` CI steps with GitHub Actions
- ... and much more

## Quickstart

To run it locally, follow the steps below:

1. Clone repository and install the dependencies:

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

3. Sync the Drizzle schema with your database

   ```bash
   pnpm db:push
   ```

   > **Note:** If you are pointing at a database that was previously managed
   > by Prisma, baseline it first with `pnpm drizzle-kit pull --init` (or
   > verify parity by confirming that `pnpm db:push` reports no changes)
   > before ever running generated migrations against it. The schema maps
   > onto the existing Prisma-created tables as-is; only the legacy unused
   > `Example` table is no longer tracked and can be dropped manually.

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
