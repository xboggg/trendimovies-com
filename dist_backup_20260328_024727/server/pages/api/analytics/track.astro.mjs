import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

let _apiJwt = "";
try {
  _apiJwt = readFileSync("/etc/trendimovies/jwt_secret", "utf-8").trim();
} catch {
}
function _apiAuth(extra) {
  const h = { "Content-Type": "application/json" };
  if (_apiJwt) h["Authorization"] = "Bearer " + jwt.sign({ role: "web_auth" }, _apiJwt, { expiresIn: "5m" });
  return h;
}
const POSTGREST_URL = "http://localhost:3001";
const GEOIP_URL = "http://ip-api.com/json";
function parseUserAgent(ua) {
  const result = {
    browser: "Unknown",
    browserVersion: "",
    os: "Unknown",
    osVersion: "",
    deviceType: "desktop",
    isBot: false
  };
  if (!ua) return result;
  const uaLower = ua.toLowerCase();
  const botPatterns = ["bot", "crawler", "spider", "scraper", "curl", "wget", "python", "java/", "go-http", "headless"];
  if (botPatterns.some((pattern) => uaLower.includes(pattern))) {
    result.isBot = true;
    result.browser = "Bot";
    return result;
  }
  if (ua.includes("Firefox/")) {
    result.browser = "Firefox";
    const match = ua.match(/Firefox\/(\d+\.?\d*)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes("Edg/")) {
    result.browser = "Edge";
    const match = ua.match(/Edg\/(\d+\.?\d*)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes("Chrome/")) {
    result.browser = "Chrome";
    const match = ua.match(/Chrome\/(\d+\.?\d*)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    result.browser = "Safari";
    const match = ua.match(/Version\/(\d+\.?\d*)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes("Opera") || ua.includes("OPR/")) {
    result.browser = "Opera";
  }
  if (ua.includes("Windows NT 10")) {
    result.os = "Windows";
    result.osVersion = "10/11";
  } else if (ua.includes("Mac OS X")) {
    result.os = "macOS";
  } else if (ua.includes("Android")) {
    result.os = "Android";
    result.deviceType = "mobile";
  } else if (ua.includes("iPhone")) {
    result.os = "iOS";
    result.deviceType = "mobile";
  } else if (ua.includes("iPad")) {
    result.os = "iOS";
    result.deviceType = "tablet";
  } else if (ua.includes("Linux")) {
    result.os = "Linux";
  }
  if (ua.includes("Mobile")) {
    result.deviceType = "mobile";
  } else if (ua.includes("Tablet")) {
    result.deviceType = "tablet";
  }
  return result;
}
function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "127.0.0.1";
}
const geoCache = /* @__PURE__ */ new Map();
async function getGeoLocation(ip) {
  const empty = { country: "", countryCode: "", city: "", region: "", timezone: "" };
  if (ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return { country: "Local", countryCode: "LO", city: "", region: "", timezone: "" };
  }
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < 36e5) {
    return cached.data;
  }
  try {
    const url = GEOIP_URL + "/" + ip + "?fields=status,country,countryCode,city,regionName,timezone";
    const response = await fetch(url, { signal: AbortSignal.timeout(5e3) });
    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        const result = {
          country: data.country || "",
          countryCode: data.countryCode || "",
          city: data.city || "",
          region: data.regionName || "",
          timezone: data.timezone || ""
        };
        geoCache.set(ip, { data: result, ts: Date.now() });
        return result;
      }
    }
  } catch (err) {
    console.error("[GeoIP] Error:", err.message);
  }
  return empty;
}
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { page_path, referrer, session_id } = body;
    if (!page_path || typeof page_path !== "string" || page_path.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid page_path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (page_path.startsWith("/admin") || page_path.startsWith("/api/")) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "";
    const uaInfo = parseUserAgent(userAgent);
    if (uaInfo.isBot) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const geo = await getGeoLocation(ip);
    const pageviewData = {
      page_path: page_path.substring(0, 500),
      ip_address: ip.substring(0, 45),
      country: geo.countryCode.substring(0, 2),
      country_name: geo.country.substring(0, 100),
      city: geo.city.substring(0, 100),
      region: geo.region.substring(0, 100),
      timezone: geo.timezone.substring(0, 50),
      browser: uaInfo.browser.substring(0, 100),
      browser_version: uaInfo.browserVersion.substring(0, 50),
      os: uaInfo.os.substring(0, 100),
      os_version: uaInfo.osVersion.substring(0, 50),
      device_type: uaInfo.deviceType,
      is_bot: uaInfo.isBot,
      referrer: (referrer || "").substring(0, 1e3),
      user_agent: userAgent.substring(0, 2e3),
      session_id: (session_id || "").substring(0, 100)
    };
    const response = await fetch(POSTGREST_URL + "/page_views", {
      method: "POST",
      headers: _apiAuth(),
      body: JSON.stringify(pageviewData)
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("[Track] Insert failed:", errText);
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[Track] Error:", error.message);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
