# RV Foods API Documentation

Base URL: `http://localhost:5000/api`

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server & DB connectivity status |

## Database Models (Step 5)

- **User** — auth, address, roles, bcrypt password hashing
- **Product** — catalog with auto-generated slugs
- **Order** — orders with auto-generated `RVF-XXXXXX` IDs
- **Review** — product reviews (one per user per product)

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register + send email OTP |
| POST | `/auth/login` | No | Login — returns access token, sets refresh cookie |
| POST | `/auth/logout` | No | Logout — clears refresh cookie |
| POST | `/auth/refresh-token` | Cookie | Issue new access token |
| POST | `/auth/verify-email` | No | Verify OTP — returns tokens |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |
| GET | `/auth/google` | No | Google OAuth (TODO) |
| GET | `/auth/google/callback` | No | Google callback (TODO) |
| GET | `/auth/me` | Bearer | Get current user profile |

**Rate limit:** Auth routes — 5 requests / 15 minutes.

**Tokens:**
- Access token: JWT, 15 min, `Authorization: Bearer <token>`
- Refresh token: JWT, 7 days, `httpOnly` cookie `refreshToken`
