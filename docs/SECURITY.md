# Security Model

This app stores personal photos and private notes, and it holds credentials
that can write to a Google Drive folder. This document describes what protects
that, and what each control does and does not cover.

---

## Threat model

The realistic risks for a small, personally deployed app:

| Risk | Control |
| --- | --- |
| Someone finds the deployed URL and reads the whole date database | Passcode gate on every API route |
| Someone overwrites the database or uploads junk into the Drive folder | Same gate, plus payload validation and size caps |
| A malicious file is uploaded and later served from a Google origin | Magic-byte sniffing, not the declared MIME type |
| A stored value becomes script when rendered | URL scheme allowlist on save, plus a nonce-based CSP |
| Brute-forcing the passcode | Fixed-window rate limit, 5 attempts per IP per 15 minutes |
| Credentials leaking into the browser bundle | `server-only` import boundary on every module that touches them |
| Upstream error text disclosing internals | Route handlers return fixed messages and log the cause server-side |

---

## Authentication

A single shared passcode, exchanged for a signed session cookie.

- `APP_PASSCODE` is **required in production**. `getAppPasscode()` throws when
  it is missing and `NODE_ENV` is production, so a deployment cannot
  accidentally serve an open API. In development it is optional and the gate is
  skipped.
- The passcode is never compared with `===`. Both sides are HMAC'd to a fixed
  length first, then compared byte by byte without early exit, so neither the
  value nor its length leaks through timing.
- Login issues `<base64url(payload)>.<base64url(HMAC-SHA256)>`, set as a cookie
  with `HttpOnly`, `SameSite=Lax`, `Path=/`, a 30 day lifetime, and `Secure`
  whenever the app is running in production.
- The token is stateless. `AUTH_SECRET` signs it, defaulting to a value derived
  from the passcode. Changing `AUTH_SECRET` invalidates every existing session
  without changing the passcode.
- Sessions are verified with Web Crypto rather than `node:crypto`, so the same
  code path works in any runtime Next.js chooses.

The client never handles the token. `useSession` asks the server whether it is
signed in, and a failed session check is treated as "not signed in" so a network
error cannot fall open.

**What this does not do.** One shared passcode means one shared identity. There
is no per-person audit trail, and revoking access for one device means rotating
`AUTH_SECRET` and signing everyone out. That is a deliberate trade for a
two-person app; a per-user model would need real accounts.

---

## Input validation

Everything written to Drive passes through `src/lib/validation/` first.

**Sync payloads** (`date-schema.ts`) are rebuilt field by field rather than
spread. Anything not named in the schema is dropped, so a caller cannot smuggle
extra keys into the stored file. Every string is length-capped, every array is
count-capped, and enums fall back to a known value instead of passing through.
The request is rejected outright above 8 MB, before parsing.

The stored file is validated **on read as well as on write**. It lives in a
Drive folder the user can edit by hand, so its contents are not trusted simply
because this app wrote them once.

**Image URLs** are checked against a scheme allowlist. Only `http:`, `https:`
and `data:image/<type>;base64,` survive; `javascript:`, `vbscript:` and
`data:text/html` are replaced with an empty string. These values end up in DOM
attributes, so this is the barrier that matters.

**Uploads** (`upload-schema.ts`) are validated by content, not by claim. The
browser-supplied `Content-Type` is attacker-controlled, so it is used only for
an early reject; the real check reads the leading bytes and matches them against
JPEG, PNG, GIF, WebP and AVIF signatures. An HTML file renamed to `.png` and
declared as `image/png` is rejected. Filenames are reduced to a safe basename
with path separators and traversal sequences stripped. The cap is 10 MB,
enforced against both the declared `Content-Length` and the actual body.

---

## Google Drive access

One client, built in `src/lib/google-drive/client.ts`, used by every caller.
Previously three route handlers each built their own with differing scopes.

Drive search strings are a query language, so folder IDs are escaped before
interpolation: an unescaped apostrophe would close the string literal and let
the rest act as syntax, potentially widening a listing beyond the intended
folder. `escapeDriveQueryValue` handles the apostrophe and backslash cases, and
`GOOGLE_DRIVE_FOLDER_ID` is format-validated at read time.

Uploaded photos are made readable by anyone with the link. This is required for
the app to render them from the CDN, and it is a deliberate choice: **treat
anything uploaded as effectively public to anyone holding the file URL.**

---

## Browser-side protections

The Content-Security-Policy is set per request in `src/proxy.ts` (Next.js 16
renamed the `middleware` convention to `proxy`), because it carries a fresh
nonce each time.

```
default-src 'self'; script-src 'self' 'nonce-<random>' 'strict-dynamic';
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: <Drive CDNs>;
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

Two notes on the compromises:

- `style-src` needs `'unsafe-inline'`. React and Motion write inline style
  attributes on every animated element, and a nonce cannot cover style
  attributes. This is far lower risk than the same allowance on `script-src`.
- The root layout is `force-dynamic`. `'strict-dynamic'` makes browsers ignore
  the `'self'` fallback, so a prerendered shell cached without a nonce would
  have every script blocked. Rendering per request keeps the nonce valid. The
  page is a client-side app, so this costs only the shell render.

Static headers live in `next.config.ts` so they also cover static assets:
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a strict
`Referrer-Policy`, a `Permissions-Policy` denying camera, microphone and
geolocation, HSTS, and `X-Robots-Tag: noindex`. `poweredByHeader` is off.

---

## Rate limiting

Fixed-window counters, in memory:

| Endpoint | Limit |
| --- | --- |
| `POST /api/auth/login` | 5 per IP per 15 min, reset on success |
| `POST /api/upload` | 30 per IP per 5 min |
| `/api/drive/sync`, `/api/drive/photos` | 60 per IP per min |

This is deliberately process-local. It blunts brute-force and upload spam
without adding infrastructure, but on a horizontally scaled deployment each
instance keeps its own counters, so the effective limit is `limit × instances`.
The client IP comes from proxy headers, which are spoofable, so it is an
abuse-throttling signal only and is never used for authorization.

---

## Secrets

Credentials are reached only through `src/lib/env/server.ts`, which starts with
`import 'server-only'`. Importing it from a Client Component is a build error,
so credentials cannot be bundled for the browser by mistake. The same guard is
on `lib/auth/guard.ts` and every `lib/google-drive/` module.

All `.env*` files are gitignored, and the history has been checked: no env file
or credential JSON has ever been committed.

---

## Operational checklist

Before deploying:

- [ ] Set `APP_PASSCODE` to at least 8 characters. The build refuses to serve
      the API without it.
- [ ] Set `AUTH_SECRET` to at least 32 characters (`openssl rand -hex 32`).
- [ ] Serve over HTTPS. The session cookie is `Secure` in production and a
      browser will not send it over plain HTTP.
- [ ] Confirm the Drive folder is shared only with the intended account.
- [ ] Run `pnpm run check` (typecheck plus lint).

To revoke access from every device, rotate `AUTH_SECRET` and redeploy.
