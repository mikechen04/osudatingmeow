# osu edating (joke site)

fun + lighthearted "dating" website for osu! players.

## setup

1. install deps

```bash
npm install
```

2. copy `db.example.js` to `db.js` (sqlite for local dev; `db.js` is gitignored on purpose)

3. fill in `.env`

- `OSU_CLIENT_ID`, `OSU_CLIENT_SECRET`: from your osu! oauth app (click “show client secret” on the app page)
- `OSU_REDIRECT_URI`: must match **exactly** one of the **Application callback URLs** on [osu oauth settings](https://osu.ppy.sh/home/account/edit)

**Important:** this app’s return URL is **`http://localhost:3000/auth/osu/callback`** (note the `/callback` at the end).  
`/auth/osu` is only where users *start* login — osu! must redirect back to `/auth/osu/callback`. Add that full URL in the osu! app’s callback list and click **Update**.

**Cloud Run (production):** site is **[https://osudatingmeow-git-57346811168.us-east1.run.app](https://osudatingmeow-git-57346811168.us-east1.run.app)**. Register this callback on osu! too: **`https://osudatingmeow-git-57346811168.us-east1.run.app/auth/osu/callback`**, and set `OSU_REDIRECT_URI` in the deployed env to that same value.

4. run it

```bash
npm run dev
```

then open `http://localhost:3000`

## what it does

- login with osu oauth
- profile setup: age (18+ required) + short bio
- browse: see other profiles + send a message
- inbox: read messages other people sent you

