# osu edating (joke site)

fun + lighthearted "dating" website for osu! players.

## setup

1. install deps

```bash
npm install
```

2. copy `db.example.js` to `db.js` (sqlite for local dev; `db.js` is gitignored on purpose)

3. fill in `.env`

- `SESSION_SECRET`: any random string
- `OSU_CLIENT_ID`, `OSU_CLIENT_SECRET`: from your osu oauth app
- `OSU_REDIRECT_URI`: must match what you set in the osu app (default is `http://localhost:3000/auth/osu/callback`)

4. run it

```bash
npm run dev
```

then open `http://localhost:3000`

## what it does

- login with osu oauth
- profile setup: age (18+ required) + short bio
- browse: see other profiles + send a message
- inbox: read received messages when logged in

