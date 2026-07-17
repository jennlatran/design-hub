# Design Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Build an internal Next.js site where all myKaarma employees can log in with Google and view design-team announcements and PM/builder workflow docs, while design-team members (editor role) author that content through an admin UI.

**Architecture:** Single Next.js (App Router) app. NextAuth.js handles Google OAuth restricted to the `mykaarma.com` Workspace domain and persists sessions/users via the Prisma adapter into Postgres. A `role` column on `User` (`VIEWER` | `EDITOR`) gates the `/admin` UI and its mutating API routes server-side. Content (announcements + workflow pages) lives in one `Content` table, authored via a Tiptap rich-text editor and sanitized server-side before storage.

**Tech Stack:** Next.js 14 (App Router, TypeScript), NextAuth.js v4 (`@next-auth/prisma-adapter`), Prisma + Postgres (Neon or Supabase), Tiptap (`@tiptap/react`, `@tiptap/starter-kit`), `sanitize-html`, Vitest for tests.

---

## Prerequisites (manual, before Task 1)

These are one-time setup steps outside the codebase that the engineer running this plan must do first:

1. Create a Postgres database on Neon (neon.tech) or Supabase — copy the connection string.
2. Create a Google Cloud OAuth Client ID (OAuth consent screen: Internal or Public with domain restriction; Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` for local dev, plus the production Vercel URL once deployed).
3. Have these values ready to put in `.env`:
   - `DATABASE_URL` — from step 1
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — from step 2
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
   - `FIRST_ADMIN_EMAIL` — the email that should be seeded as the first `EDITOR`

---

### Task 1: Scaffold the Next.js app

**Files:**
- Create: entire project scaffold via `create-next-app` in `/Users/jenntran/code/design-hub`

**Step 1: Scaffold**

Run (from `/Users/jenntran/code/design-hub`, which already has `.git` and `docs/plans/` — answer "No" if asked to overwrite the existing git repo):

```bash
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm
```

**Step 2: Verify it runs**

```bash
npm run dev
```
Expected: server starts on `http://localhost:3000`, default Next.js page loads. Stop with Ctrl+C.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: Add Prisma schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env` (gitignored by default from create-next-app)
- Modify: `.env.example` (new file, committed, no real secrets)

**Step 1: Install Prisma**

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init --datasource-provider postgresql
```

**Step 2: Write the schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  VIEWER
  EDITOR
}

enum ContentType {
  ANNOUNCEMENT
  WORKFLOW
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          Role      @default(VIEWER)
  createdAt     DateTime  @default(now())
  accounts      Account[]
  sessions      Session[]
  content       Content[]
}

model Content {
  id          String      @id @default(cuid())
  type        ContentType
  title       String
  slug        String      @unique
  bodyHtml    String
  publishedAt DateTime?
  updatedAt   DateTime    @updatedAt
  createdAt   DateTime    @default(now())
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Step 3: Fill in `.env` and create `.env.example`**

`.env` (real values, not committed):
```
DATABASE_URL="<your Neon/Supabase connection string>"
GOOGLE_CLIENT_ID="<from Google Cloud Console>"
GOOGLE_CLIENT_SECRET="<from Google Cloud Console>"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
FIRST_ADMIN_EMAIL="<your email>"
```

`.env.example` (committed, placeholders only):
```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
FIRST_ADMIN_EMAIL=
```

**Step 4: Run the migration**

```bash
npx prisma migrate dev --name init
```
Expected: creates tables in your Postgres DB, generates Prisma Client, no errors.

**Step 5: Commit**

```bash
git add prisma .env.example
git commit -m "feat: add Prisma schema for users, roles, and content"
```
(`.env` stays untracked — confirm with `git status` that it does not appear.)

---

### Task 3: Prisma client singleton

**Files:**
- Create: `src/lib/prisma.ts`

**Step 1: Write the singleton**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 2: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "feat: add Prisma client singleton"
```

---

### Task 4: NextAuth with Google, domain restriction, and role in session

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Test: `src/lib/auth.test.ts`

**Step 1: Install dependencies**

```bash
npm install next-auth @next-auth/prisma-adapter
npm install --save-dev vitest
```

**Step 2: Write the failing test for the domain-restriction logic**

Create `src/lib/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isAllowedDomain } from "./auth";

describe("isAllowedDomain", () => {
  it("allows a mykaarma.com Google account", () => {
    expect(isAllowedDomain({ hd: "mykaarma.com" })).toBe(true);
  });

  it("rejects a non-mykaarma.com account", () => {
    expect(isAllowedDomain({ hd: "gmail.com" })).toBe(false);
  });

  it("rejects when hd is missing (personal Google account)", () => {
    expect(isAllowedDomain({})).toBe(false);
  });
});
```

**Step 3: Run it to confirm it fails**

```bash
npx vitest run src/lib/auth.test.ts
```
Expected: FAIL — `isAllowedDomain` is not exported / module doesn't exist yet.

**Step 4: Write `src/lib/auth.ts`**

```typescript
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export function isAllowedDomain(profile: { hd?: string }): boolean {
  return profile.hd === "mykaarma.com";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;
      return isAllowedDomain(profile as Profile & { hd?: string });
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as typeof session.user & { role: string; id: string }).role = (
          user as typeof user & { role: string }
        ).role;
        (session.user as typeof session.user & { id: string }).id = user.id;
      }
      return session;
    },
  },
};
```

**Step 5: Run the test to confirm it passes**

```bash
npx vitest run src/lib/auth.test.ts
```
Expected: PASS (3 tests).

**Step 6: Wire up the NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Step 7: Manual check**

```bash
npm run dev
```
Visit `http://localhost:3000/api/auth/signin`, sign in with a `@mykaarma.com` Google account. Expected: redirected back signed in. Try (if you have access to one) a non-`mykaarma.com` Google account: expected to be denied.

**Step 8: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts src/app/api/auth vitest.config.ts package.json package-lock.json
git commit -m "feat: add NextAuth Google login restricted to mykaarma.com"
```

---

### Task 5: Seed script for the first admin

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add `prisma.seed` config)

**Step 1: Write the seed script**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.FIRST_ADMIN_EMAIL;
  if (!email) {
    throw new Error("FIRST_ADMIN_EMAIL is not set in .env");
  }

  await prisma.user.upsert({
    where: { email },
    update: { role: "EDITOR" },
    create: { email, role: "EDITOR" },
  });

  console.log(`Seeded ${email} as EDITOR`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Step 2: Add seed config**

In `package.json`, add:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

```bash
npm install --save-dev ts-node
```

**Step 3: Run it**

```bash
npx prisma db seed
```
Expected: `Seeded <your email> as EDITOR`. Note: if you already logged in once via Task 4 step 7, this upserts your existing row to `EDITOR`; if not, log in once now so the row exists, then re-run.

**Step 4: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: add first-admin seed script"
```

---

### Task 6: Role-guard helpers

**Files:**
- Create: `src/lib/authz.ts`
- Test: `src/lib/authz.test.ts`

**Step 1: Write the failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { isEditor } from "./authz";

describe("isEditor", () => {
  it("returns true for an EDITOR session", () => {
    expect(isEditor({ user: { role: "EDITOR" } })).toBe(true);
  });

  it("returns false for a VIEWER session", () => {
    expect(isEditor({ user: { role: "VIEWER" } })).toBe(false);
  });

  it("returns false for no session", () => {
    expect(isEditor(null)).toBe(false);
  });
});
```

**Step 2: Confirm it fails**

```bash
npx vitest run src/lib/authz.test.ts
```
Expected: FAIL — module doesn't exist.

**Step 3: Implement**

```typescript
import type { Session } from "next-auth";

type SessionLike = { user?: { role?: string } } | null | undefined;

export function isEditor(session: SessionLike): boolean {
  return session?.user?.role === "EDITOR";
}

export type { Session };
```

**Step 4: Confirm it passes**

```bash
npx vitest run src/lib/authz.test.ts
```
Expected: PASS (3 tests).

**Step 5: Commit**

```bash
git add src/lib/authz.ts src/lib/authz.test.ts
git commit -m "feat: add isEditor role-guard helper"
```

---

### Task 7: HTML sanitization utility

**Files:**
- Create: `src/lib/sanitize.ts`
- Test: `src/lib/sanitize.test.ts`

**Step 1: Install dependency**

```bash
npm install sanitize-html
npm install --save-dev @types/sanitize-html
```

**Step 2: Write the failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { sanitizeContentHtml } from "./sanitize";

describe("sanitizeContentHtml", () => {
  it("strips script tags", () => {
    const input = '<p>hello</p><script>alert(1)</script>';
    expect(sanitizeContentHtml(input)).toBe("<p>hello</p>");
  });

  it("strips inline event handlers", () => {
    const input = '<p onclick="alert(1)">hello</p>';
    expect(sanitizeContentHtml(input)).toBe("<p>hello</p>");
  });

  it("keeps safe formatting tags", () => {
    const input = "<p><strong>bold</strong> and <a href=\"https://example.com\">a link</a></p>";
    expect(sanitizeContentHtml(input)).toContain("<strong>bold</strong>");
    expect(sanitizeContentHtml(input)).toContain('href="https://example.com"');
  });
});
```

**Step 3: Confirm it fails**

```bash
npx vitest run src/lib/sanitize.test.ts
```
Expected: FAIL — module doesn't exist.

**Step 4: Implement**

```typescript
import sanitizeHtml from "sanitize-html";

export function sanitizeContentHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s",
      "h1", "h2", "h3", "ul", "ol", "li",
      "a", "blockquote", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["https", "mailto"],
  });
}
```

**Step 5: Confirm it passes**

```bash
npx vitest run src/lib/sanitize.test.ts
```
Expected: PASS (3 tests).

**Step 6: Commit**

```bash
git add src/lib/sanitize.ts src/lib/sanitize.test.ts package.json package-lock.json
git commit -m "feat: add server-side HTML sanitization for content bodies"
```

---

### Task 8: Content API routes (list, create, update, delete)

**Files:**
- Create: `src/app/api/content/route.ts` (GET list, POST create)
- Create: `src/app/api/content/[id]/route.ts` (PATCH update, DELETE)
- Test: `src/app/api/content/route.test.ts`
- Test: `src/app/api/content/[id]/route.test.ts`

**Step 1: Write the failing test for POST authorization**

Create `src/app/api/content/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { content: { findMany: vi.fn(), create: vi.fn() } },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

describe("POST /api/content", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a viewer with 403", async () => {
    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "u1", role: "VIEWER" },
    });
    const req = new Request("http://localhost/api/content", {
      method: "POST",
      body: JSON.stringify({ type: "ANNOUNCEMENT", title: "t", slug: "t", bodyHtml: "<p>x</p>" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(prisma.content.create).not.toHaveBeenCalled();
  });

  it("allows an editor and sanitizes the body", async () => {
    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "u1", role: "EDITOR" },
    });
    (prisma.content.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "c1" });
    const req = new Request("http://localhost/api/content", {
      method: "POST",
      body: JSON.stringify({
        type: "ANNOUNCEMENT",
        title: "t",
        slug: "t",
        bodyHtml: '<p>x</p><script>bad()</script>',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.content.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bodyHtml: "<p>x</p>" }),
      })
    );
  });
});
```

**Step 2: Confirm it fails**

```bash
npx vitest run src/app/api/content/route.test.ts
```
Expected: FAIL — `./route` has no `POST` export yet.

**Step 3: Implement `src/app/api/content/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { sanitizeContentHtml } from "@/lib/sanitize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "ANNOUNCEMENT" | "WORKFLOW" | null;

  const content = await prisma.content.findMany({
    where: type ? { type } : undefined,
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isEditor(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const created = await prisma.content.create({
    data: {
      type: body.type,
      title: body.title,
      slug: body.slug,
      bodyHtml: sanitizeContentHtml(body.bodyHtml),
      publishedAt: new Date(),
      authorId: session!.user!.id as string,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
```

**Step 4: Confirm it passes**

```bash
npx vitest run src/app/api/content/route.test.ts
```
Expected: PASS (2 tests).

**Step 5: Repeat for update/delete — write failing test first**

Create `src/app/api/content/[id]/route.test.ts` following the same mock pattern as Step 1, covering:
- `PATCH` as viewer → 403
- `PATCH` as editor → 200, sanitizes `bodyHtml` if present
- `DELETE` as viewer → 403
- `DELETE` as editor → 200

**Step 6: Confirm it fails, then implement `src/app/api/content/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { sanitizeContentHtml } from "@/lib/sanitize";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isEditor(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.content.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.bodyHtml !== undefined ? { bodyHtml: sanitizeContentHtml(body.bodyHtml) } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isEditor(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.content.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

**Step 7: Confirm tests pass**

```bash
npx vitest run src/app/api/content
```
Expected: PASS (all tests across both files).

**Step 8: Commit**

```bash
git add src/app/api/content
git commit -m "feat: add content CRUD API routes with editor-only guard"
```

---

### Task 9: Roles API route (manage roles tab)

**Files:**
- Create: `src/app/api/roles/route.ts` (GET search by email, PATCH set role)
- Test: `src/app/api/roles/route.test.ts`

**Step 1: Write failing tests** following the same `vi.mock` pattern as Task 8, covering:
- `GET ?email=` as viewer → 403
- `GET ?email=` as editor → 200, returns matching user
- `PATCH { userId, role }` as viewer → 403
- `PATCH { userId, role }` as editor → 200, updates role

**Step 2: Confirm failure, then implement**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isEditor(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const users = await prisma.user.findMany({
    where: email ? { email: { contains: email, mode: "insensitive" } } : undefined,
    select: { id: true, email: true, name: true, role: true },
    take: 20,
  });
  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isEditor(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (role !== "VIEWER" && role !== "EDITOR") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });
  return NextResponse.json(updated);
}
```

**Step 3: Confirm tests pass**

```bash
npx vitest run src/app/api/roles/route.test.ts
```

**Step 4: Commit**

```bash
git add src/app/api/roles
git commit -m "feat: add roles API for granting/revoking editor access"
```

---

### Task 10: Public pages — announcements feed

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/layout.tsx` modification (nav bar)

**Step 1: Replace `src/app/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const announcements = await prisma.content.findMany({
    where: { type: "ANNOUNCEMENT" },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Design Team Announcements</h1>
      {announcements.length === 0 && <p className="text-gray-500">No announcements yet.</p>}
      <div className="space-y-6">
        {announcements.map((a) => (
          <article key={a.id} className="border-b pb-4">
            <h2 className="text-lg font-semibold">{a.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
            <p className="text-sm text-gray-400 mt-2">
              {a.author?.name ?? a.author?.email} ·{" "}
              {a.publishedAt?.toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
```

Note: `dangerouslySetInnerHTML` is safe here specifically because `bodyHtml` was sanitized server-side on write (Task 7/8) — never render unsanitized user input this way elsewhere.

**Step 2: Add a simple nav bar to `src/app/layout.tsx`**

Add a `<nav>` with links to `/`, `/workflows`, and (conditionally, once session data is available client-side) `/admin`. Keep this minimal — a `<header>` with plain `<a>` tags styled with Tailwind classes already scaffolded in Task 1.

**Step 3: Manual check**

```bash
npm run dev
```
Visit `/` while signed out: expected to be redirected to sign-in once middleware is added in Task 12. For now, confirm the page renders without errors (empty state).

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add announcements feed page"
```

---

### Task 11: Public pages — workflows list and detail

**Files:**
- Create: `src/app/workflows/page.tsx`
- Create: `src/app/workflows/[slug]/page.tsx`

**Step 1: Write `src/app/workflows/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function WorkflowsPage() {
  const workflows = await prisma.content.findMany({
    where: { type: "WORKFLOW" },
    orderBy: { title: "asc" },
  });

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">PM & Builder Workflows</h1>
      {workflows.length === 0 && <p className="text-gray-500">No workflow pages yet.</p>}
      <ul className="space-y-2">
        {workflows.map((w) => (
          <li key={w.id}>
            <Link href={`/workflows/${w.slug}`} className="text-blue-600 underline">
              {w.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Step 2: Write `src/app/workflows/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  const workflow = await prisma.content.findUnique({ where: { slug: params.slug } });
  if (!workflow || workflow.type !== "WORKFLOW") notFound();

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{workflow.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: workflow.bodyHtml }} />
    </main>
  );
}
```

**Step 3: Manual check**

```bash
npm run dev
```
Visit `/workflows`. Expected: empty state renders (no workflow content created yet — that comes from the admin UI in Task 13).

**Step 4: Commit**

```bash
git add src/app/workflows
git commit -m "feat: add workflows list and detail pages"
```

---

### Task 12: Auth gate + not-authorized page (middleware)

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/not-authorized/page.tsx`

**Step 1: Write `src/middleware.ts`**

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});

export const config = {
  matcher: ["/", "/workflows/:path*", "/admin/:path*"],
};
```

**Step 2: Add an editor-only check for `/admin` at the layout level**

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEditor } from "@/lib/authz";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!isEditor(session)) {
    redirect("/not-authorized");
  }
  return <>{children}</>;
}
```

**Step 3: Write `src/app/not-authorized/page.tsx`**

```tsx
export default function NotAuthorizedPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Not authorized</h1>
      <p className="text-gray-500">You don&apos;t have access to this page.</p>
    </main>
  );
}
```

**Step 4: Manual check**

Sign in as a `VIEWER` account, visit `/admin` (once it exists after Task 13). Expected: redirected to `/not-authorized`.

**Step 5: Commit**

```bash
git add src/middleware.ts src/app/admin/layout.tsx src/app/not-authorized
git commit -m "feat: gate all pages behind login and /admin behind editor role"
```

---

### Task 13: Admin UI — content list, create/edit form with Tiptap

**Files:**
- Create: `src/app/admin/page.tsx` (content list)
- Create: `src/app/admin/new/page.tsx` (create form)
- Create: `src/app/admin/[id]/edit/page.tsx` (edit form)
- Create: `src/components/ContentEditor.tsx` (shared Tiptap client component)

**Step 1: Install Tiptap**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

**Step 2: Write `src/components/ContentEditor.tsx`** (client component)

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";

type ContentEditorProps = {
  initialType?: "ANNOUNCEMENT" | "WORKFLOW";
  initialTitle?: string;
  initialSlug?: string;
  initialBodyHtml?: string;
  onSubmit: (data: { type: string; title: string; slug: string; bodyHtml: string }) => Promise<void>;
  submitLabel: string;
};

export function ContentEditor({
  initialType = "ANNOUNCEMENT",
  initialTitle = "",
  initialSlug = "",
  initialBodyHtml = "",
  onSubmit,
  submitLabel,
}: ContentEditorProps) {
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [submitting, setSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: initialBodyHtml,
  });

  async function handleSubmit() {
    if (!editor) return;
    setSubmitting(true);
    await onSubmit({ type, title, slug, bodyHtml: editor.getHTML() });
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <select value={type} onChange={(e) => setType(e.target.value as "ANNOUNCEMENT" | "WORKFLOW")} className="border p-2">
        <option value="ANNOUNCEMENT">Announcement</option>
        <option value="WORKFLOW">Workflow</option>
      </select>
      <input
        className="border p-2 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        placeholder="URL slug (e.g. requesting-a-design-review)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <div className="border p-2 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {submitLabel}
      </button>
    </div>
  );
}
```

**Step 3: Write `src/app/admin/new/page.tsx`** (client component wrapping the editor + fetch call)

```tsx
"use client";

import { useRouter } from "next/navigation";
import { ContentEditor } from "@/components/ContentEditor";

export default function NewContentPage() {
  const router = useRouter();

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Content</h1>
      <ContentEditor
        submitLabel="Publish"
        onSubmit={async (data) => {
          await fetch("/api/content", { method: "POST", body: JSON.stringify(data) });
          router.push("/admin");
        }}
      />
    </main>
  );
}
```

**Step 4: Write `src/app/admin/page.tsx`** (server component listing content, with edit/delete links/buttons)

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const content = await prisma.content.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <div className="space-x-4">
          <Link href="/admin/new" className="text-blue-600 underline">New content</Link>
          <Link href="/admin/roles" className="text-blue-600 underline">Manage roles</Link>
        </div>
      </div>
      <ul className="space-y-2">
        {content.map((c) => (
          <li key={c.id} className="flex justify-between border-b pb-2">
            <span>{c.title} <span className="text-gray-400 text-sm">({c.type})</span></span>
            <Link href={`/admin/${c.id}/edit`} className="text-blue-600 underline">Edit</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Step 5: Write `src/app/admin/[id]/edit/page.tsx`** following the same pattern as Step 3, fetching the existing content first (server component) and passing initial values into a client wrapper that calls `PATCH /api/content/[id]`. Include a delete button calling `DELETE /api/content/[id]`.

**Step 6: Manual check**

```bash
npm run dev
```
As an editor: visit `/admin`, click "New content", create a workflow page, confirm it appears at `/workflows`. Edit it, confirm changes persist. Delete it, confirm it disappears.

**Step 7: Commit**

```bash
git add src/app/admin src/components/ContentEditor.tsx package.json package-lock.json
git commit -m "feat: add admin UI for creating, editing, and deleting content"
```

---

### Task 14: Admin UI — manage roles tab

**Files:**
- Create: `src/app/admin/roles/page.tsx` (client component)

**Step 1: Write the page**

```tsx
"use client";

import { useState } from "react";

type UserRow = { id: string; email: string; name: string | null; role: "VIEWER" | "EDITOR" };

export default function ManageRolesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserRow[]>([]);

  async function search() {
    const res = await fetch(`/api/roles?email=${encodeURIComponent(query)}`);
    setResults(await res.json());
  }

  async function setRole(userId: string, role: "VIEWER" | "EDITOR") {
    await fetch("/api/roles", { method: "PATCH", body: JSON.stringify({ userId, role }) });
    search();
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Roles</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="Search by email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={search} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      <ul className="space-y-2">
        {results.map((u) => (
          <li key={u.id} className="flex justify-between items-center border-b pb-2">
            <span>{u.email} ({u.role})</span>
            <button
              onClick={() => setRole(u.id, u.role === "EDITOR" ? "VIEWER" : "EDITOR")}
              className="text-blue-600 underline"
            >
              {u.role === "EDITOR" ? "Revoke editor" : "Make editor"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Step 2: Manual check**

As an editor, visit `/admin/roles`, search for a known viewer's email, toggle their role, confirm the API call succeeds (check network tab / re-search).

**Step 3: Commit**

```bash
git add src/app/admin/roles
git commit -m "feat: add manage-roles admin tab"
```

---

### Task 15: Vercel deployment config

**Files:**
- Create: `README.md`
- Modify: `package.json` (build script should run `prisma generate` first)

**Step 1: Update the build script**

In `package.json`:
```json
"scripts": {
  "build": "prisma generate && next build",
  ...
}
```

**Step 2: Write `README.md`** documenting: prerequisites (from the top of this plan), local setup (`npm install`, `.env`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`), and Vercel deployment (connect repo, set the same env vars in Vercel project settings, deploy).

**Step 3: Commit**

```bash
git add README.md package.json
git commit -m "docs: add README and configure build for Prisma generate"
```

**Step 4: Deploy**

Push this repo to GitHub, import it into Vercel, set the environment variables from the Prerequisites section in the Vercel project settings, and deploy. Update the Google OAuth Client's authorized redirect URIs to include the production Vercel URL.

---

## Summary of what's deferred (per the design doc)

- Engineer-facing workflows section (phase 2).
- Interactive actions on workflow pages (request forms, Jira/Slack integration).
- Pagination/search/categorization of content.
