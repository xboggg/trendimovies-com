import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { C as ContentRow } from '../../chunks/ContentRow_DFJtx-HN.mjs';
import { d as getProfileUrl } from '../../chunks/supabase_H7J9YlW_.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const TMDB_API_KEY = "46300aaf372203a94763f1f46846e843";
  let person = null;
  let credits = null;
  try {
    const personRes = await fetch(
      `https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_API_KEY}&append_to_response=movie_credits,tv_credits`
    );
    if (personRes.ok) {
      person = await personRes.json();
      const movieCredits = (person.movie_credits?.cast || []).map((m) => ({
        ...m,
        media_type: "movie",
        type: "movie",
        slug: generateSlug(m.title, m.release_date ? new Date(m.release_date).getFullYear() : null),
        year: m.release_date ? new Date(m.release_date).getFullYear() : null
      }));
      const tvCredits = (person.tv_credits?.cast || []).map((t) => ({
        ...t,
        title: t.name,
        media_type: "tv",
        type: "series",
        slug: generateSlug(t.name, t.first_air_date ? new Date(t.first_air_date).getFullYear() : null),
        year: t.first_air_date ? new Date(t.first_air_date).getFullYear() : null
      }));
      credits = [...movieCredits, ...tvCredits].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 20);
    }
  } catch (err) {
    console.error("Error fetching person:", err);
  }
  function generateSlug(title, year) {
    if (!title) return "";
    let slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 100);
    if (year) slug += `-${year}`;
    return slug;
  }
  function formatDate(dateStr) {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  function calculateAge(birthday, deathday) {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : /* @__PURE__ */ new Date();
    let age2 = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || m === 0 && end.getDate() < birth.getDate()) {
      age2--;
    }
    return age2;
  }
  if (!person) {
    return Astro2.redirect("/404");
  }
  const age = calculateAge(person.birthday, person.deathday);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": person.name, "description": person.biography?.slice(0, 200) || `Learn about ${person.name}'s filmography and biography.`, "image": getProfileUrl(person.profile_path, "h632") }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row gap-8"> <!-- Profile Image --> <div class="flex-shrink-0 w-64 mx-auto md:mx-0"> <img${addAttribute(getProfileUrl(person.profile_path, "h632"), "src")}${addAttribute(person.name, "alt")} class="w-full rounded-lg shadow-xl"> </div> <!-- Bio Info --> <div class="flex-1"> <h1 class="text-3xl md:text-4xl font-bold mb-4" style="color: var(--text-primary);"> ${person.name} </h1> <!-- Quick Info --> <div class="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg" style="background-color: var(--bg-card);"> ${person.known_for_department && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Known For</h4> <p style="color: var(--text-primary);">${person.known_for_department}</p> </div>`} ${person.birthday && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Born</h4> <p style="color: var(--text-primary);"> ${formatDate(person.birthday)} ${age !== null && !person.deathday && renderTemplate`<span class="text-sm" style="color: var(--text-secondary);"> (${age} years old)</span>`} </p> </div>`} ${person.deathday && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Died</h4> <p style="color: var(--text-primary);"> ${formatDate(person.deathday)} ${age !== null && renderTemplate`<span class="text-sm" style="color: var(--text-secondary);"> (aged ${age})</span>`} </p> </div>`} ${person.place_of_birth && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Birthplace</h4> <p style="color: var(--text-primary);">${person.place_of_birth}</p> </div>`} </div> <!-- Biography --> ${person.biography && renderTemplate`<div class="mb-6"> <h3 class="font-semibold mb-2" style="color: var(--text-primary);">Biography</h3> <p class="leading-relaxed whitespace-pre-line" style="color: var(--text-secondary);"> ${person.biography.length > 1e3 ? person.biography.slice(0, 1e3) + "..." : person.biography} </p> </div>`} <!-- External Links --> <div class="flex gap-4"> ${person.imdb_id && renderTemplate`<a${addAttribute(`https://www.imdb.com/name/${person.imdb_id}`, "href")} target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style="background-color: #f5c518; color: #000;">
View on IMDb
</a>`} <a${addAttribute(`https://www.themoviedb.org/person/${person.id}`, "href")} target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style="background-color: #01b4e4; color: #fff;">
View on TMDB
</a> </div> </div> </div> </div>  ${credits && credits.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": `${person.name}'s Filmography`, "items": credits.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    poster_path: c.poster_path,
    vote_average: c.vote_average || 0,
    year: c.year,
    type: c.type
  })), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`}` })}`;
}, "/var/www/trendimovies/src/pages/person/[id].astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/person/[id].astro";
const $$url = "/person/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
