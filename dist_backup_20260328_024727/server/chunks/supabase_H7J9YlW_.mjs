const POSTGREST_URL = "http://localhost:3001";
async function query(table, options = {}) {
  const params = new URLSearchParams();
  if (options.select) params.set("select", options.select);
  if (options.limit) params.set("limit", options.limit.toString());
  if (options.offset) params.set("offset", options.offset.toString());
  if (options.order) params.set("order", options.order);
  if (options.eq) {
    for (const [key, value] of Object.entries(options.eq)) {
      params.set(key, `eq.${value}`);
    }
  }
  if (options.neq) {
    for (const [key, value] of Object.entries(options.neq)) {
      params.set(key, `neq.${value}`);
    }
  }
  const url = `${POSTGREST_URL}/${table}?${params.toString()}`;
  console.log("[DB Query]", url);
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DB Error]", response.status, errorText);
      return { data: null, error: { status: response.status, message: errorText } };
    }
    const data = await response.json();
    console.log("[DB Result]", table, "returned", Array.isArray(data) ? data.length : 1, "items");
    return { data: options.single ? data[0] || null : data, error: null };
  } catch (error) {
    console.error("[DB Exception]", error.message);
    return { data: null, error };
  }
}
async function insert(table, data) {
  const url = `${POSTGREST_URL}/${table}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept-Profile": "public",
        "Content-Profile": "public",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      const error = await response.json();
      return { data: null, error };
    }
    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
async function update(table, id, data) {
  const url = `${POSTGREST_URL}/${table}?id=eq.${id}`;
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Accept-Profile": "public",
        "Content-Profile": "public",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      const error = await response.json();
      return { data: null, error };
    }
    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
const supabase = {
  from: (table) => {
    const createChain = (opts = {}) => ({
      eq: (column, value) => createChain({ ...opts, eq: { ...opts.eq, [column]: value } }),
      neq: (column, value) => createChain({ ...opts, neq: { ...opts.neq, [column]: value } }),
      order: (column, orderOpts) => createChain({
        ...opts,
        order: `${column}.${orderOpts?.ascending === false ? "desc" : "asc"}`
      }),
      limit: (n) => createChain({ ...opts, limit: n }),
      range: (from, to) => createChain({ ...opts, offset: from, limit: to - from + 1 }),
      single: () => query(table, { ...opts, single: true }),
      then: (resolve) => query(table, opts).then(resolve)
    });
    return {
      select: (columns) => createChain({ select: columns }),
      insert: (data) => insert(table, data),
      update: (data) => ({
        eq: (column, value) => update(table, value, data)
      })
    };
  }
};
function getPosterUrl(path, size = "w500") {
  if (!path) return "/images/no-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
function getBackdropUrl(path, size = "w1280") {
  if (!path) return "/images/no-backdrop.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
function getProfileUrl(path, size = "w185") {
  if (!path) return "/images/no-profile.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
const LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  hi: "Hindi",
  ar: "Arabic",
  tr: "Turkish",
  th: "Thai",
  tl: "Filipino",
  id: "Indonesian",
  vi: "Vietnamese",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish"
};
function getLanguageName(code) {
  return LANGUAGES[code] || code.toUpperCase();
}

export { getPosterUrl as a, formatDate as b, getLanguageName as c, getProfileUrl as d, formatRuntime as f, getBackdropUrl as g, supabase as s };
