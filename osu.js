require("./load-env");

const OSU_AUTHORIZE_URL = "https://osu.ppy.sh/oauth/authorize";
const OSU_TOKEN_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_ME_URL = "https://osu.ppy.sh/api/v2/me";

function mustEnv(name) {
  const raw = process.env[name];
  const v = raw == null ? "" : String(raw).trim();
  if (!v) throw new Error(`missing env var: ${name}`);
  return v;
}

function osuAuthorizeUrl(state) {
  const clientId = mustEnv("OSU_CLIENT_ID");
  const redirectUri = mustEnv("OSU_REDIRECT_URI");

  const url = new URL(OSU_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify public");
  url.searchParams.set("state", state);

  return url.toString();
}

async function osuExchangeCodeForToken(code) {
  const clientId = mustEnv("OSU_CLIENT_ID");
  const clientSecret = mustEnv("OSU_CLIENT_SECRET");
  const redirectUri = mustEnv("OSU_REDIRECT_URI");

  // osu! expects form body, not json (see https://osu.ppy.sh/docs/ — oauth/token)
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: String(parseInt(clientId, 10)),
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(OSU_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token exchange failed: ${res.status} ${text}`);
  }

  return await res.json();
}

async function osuGetMe(accessToken) {
  const res = await fetch(OSU_API_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`me fetch failed: ${res.status} ${text}`);
  }

  return await res.json();
}

module.exports = {
  osuAuthorizeUrl,
  osuExchangeCodeForToken,
  osuGetMe,
};

