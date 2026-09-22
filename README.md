# SpendWise — Full-stack authentication upgrade

This version adds a real login/registration experience to the existing expense tracker UI while keeping the financial endpoints unchanged.

## What was added
- Email/password login and registration.
- BCrypt password hashing in the Spring Boot authentication service.
- JWT authentication for the auth service.
- Google OAuth2 button and callback handling.
- Automatic financial-profile linking by email against the existing `/api/users` endpoint.
- Time-aware dashboard greeting: Good morning / Good afternoon / Good evening + the logged-in user's first name.
- Responsive authentication UI with a money-themed image carousel, gradients, emojis, security indicators and social buttons.
- Existing dashboard, transactions, budgets, goals, recurring expenses, categories, reports and profile pages remain in place.

## Services

Run the existing financial API on `http://localhost:8080`.
Run `spendwise-auth-backend` on `http://localhost:8081`.
Run this frontend on `http://localhost:5173`.

Frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AUTH_API_BASE_URL=http://localhost:8081/api/auth
```

## Authentication database
The new auth service stores credentials in a separate `auth_users` table in the same MySQL database. Passwords are never stored in plain text.

Set these environment variables before starting the auth service:
```env
DB_URL=jdbc:mysql://localhost:3306/expense_tracker?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
FRONTEND_URL=http://localhost:5173
```

## Google OAuth2
Create OAuth credentials in Google Cloud and use:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
Add this callback URL to the Google OAuth client:
`http://localhost:8081/login/oauth2/code/google`

## Login flow
1. User registers or signs in at `/login`.
2. Auth service validates credentials and returns a JWT.
3. Frontend stores the JWT and uses it for auth-service requests.
4. Frontend finds/creates the matching financial profile through the existing `/api/users` endpoint.
5. The resulting financial `userId` is stored as the active SpendWise profile.
6. Existing financial pages continue to call their original endpoints using that `userId`.

## OAuth flow
Google redirects to the auth service. After successful provider authentication, the service issues a SpendWise JWT and redirects to:
`/oauth2/redirect?token=...`
The frontend validates the session through `/api/auth/me`, links the financial profile by email, and opens the dashboard.
