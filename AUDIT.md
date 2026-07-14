# Audit findings (2026-07-11)

Open items from the July 2026 dependency-update and audit run. Fixed items live in git history.

- **MEDIUM** — `src/components/editor-output.tsx` + `src/lib/validators/post.ts` — Post `content` is `z.any()` with no server-side sanitization; EditorJS blocks are rendered via html-react-parser. React 19 currently neutralizes classic XSS vectors (verified), but defense-in-depth calls for structural validation of the block JSON plus server-side HTML sanitization. — Add a Zod schema for the EditorJS block structure and sanitize HTML server-side with sanitize-html or DOMPurify.
- **MEDIUM** — `src/app/api/link/route.ts` — SSRF residual: authenticated users can still make the server fetch internal/cloud-metadata hosts (auth requirement, protocol check, timeout, and size cap were added this run). — Add a host allowlist, or block private-IP ranges and redirects; mind DNS rebinding and IPv6 representations.
- **LOW/MEDIUM** — `/api/posts` + comment payloads — Responses return full `votes` arrays including each voter's `userId`, revealing who voted on what. — Reshape responses to aggregate vote counts plus the caller's own vote only.
- **LOW** — `/api/posts` pagination — `limit`/`page` are unbounded (`z.string()` + `parseInt`), enabling DoS via huge values. — Validate with `z.coerce.number().int().positive().max(…)`.
- **LOW** — `src/config/index.ts` — `INFINITE_SCROLL_PAGINATION_RESULTS = 2` (the accompanying comment says to raise it for production). — Raise to a production-appropriate page size.
- **LOW** — `src/lib/validators/comment.ts` — `text` has no max length; `postId`/`replyToId` existence is unchecked, so bad ids surface as FK-violation 500s. — Add a max length and verify referenced rows exist before insert (return 404/422).
- **LOW** — subreddit post vote route — The Redis-cached vote count is computed from pre-mutation reads, so the cached value lags the true count by one. — Recompute from post-mutation state (or adjust the delta) before caching.
- **LOW** — Drizzle migration — The Prisma-to-Drizzle migration is verified at type/build level only (no database was reachable during the run). — Run it against a staging database before trusting production. The README documents the `drizzle-kit pull --init` baseline step.
- **INFO** — `pnpm audit` — 4 transitive advisories, none directly fixable: effect via uploadthing (high); esbuild via drizzle-kit/tsx (dev); postcss pinned inside next; uuid via next-auth. — Re-check after upstream releases.
- **REPO SETTINGS** — GitHub-side Dependabot version/security updates fail on this repo, and Renovate owns dependency updates. — Disable Dependabot updates in Settings so the failure noise stops.
- **INFO** — `LEARN.md` — A 0-byte tracked stub. — Fill it in or delete it.
