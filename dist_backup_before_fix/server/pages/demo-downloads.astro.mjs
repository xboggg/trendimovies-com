import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { D as DownloadSection } from '../chunks/DownloadSection_BxxmhzgW.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$DemoDownloads = createComponent(($$result, $$props, $$slots) => {
  const demoLinks = [
    // DDL Row 1 (source 1 - e.g. Telegram, hidden from user)
    { id: 1, quality: "720p", file_size: "1.2 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 1 },
    { id: 2, quality: "1080p", file_size: "2.8 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 1 },
    // DDL Row 2 (source 2 - e.g. Cinematika, hidden from user)
    { id: 3, quality: "720p", file_size: "1.2 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 2 },
    { id: 4, quality: "1080p", file_size: "2.8 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 2 },
    // Torrent Downloads (3 on one row)
    { id: 5, quality: "720p", file_size: "1.1 GB", url: "magnet:?xt=urn:btih:example1", type: "torrent", variant: "webrip" },
    { id: 6, quality: "1080p", file_size: "2.5 GB", url: "magnet:?xt=urn:btih:example2", type: "torrent", variant: "webrip" },
    { id: 7, quality: "1080p", file_size: "3.8 GB", url: "magnet:?xt=urn:btih:example3", type: "torrent", variant: "webdl" }
  ];
  const ddlOnlyLinks = [
    { id: 1, quality: "720p", file_size: "1.2 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 1 },
    { id: 2, quality: "1080p", file_size: "2.8 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 1 },
    { id: 3, quality: "720p", file_size: "1.2 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 2 },
    { id: 4, quality: "1080p", file_size: "2.8 GB", url: "https://proof.ovh.net/files/100Mb.dat", type: "ddl", source: 2 }
  ];
  const torrentOnlyLinks = [
    { id: 5, quality: "720p", file_size: "1.1 GB", url: "magnet:?xt=urn:btih:example1", type: "torrent", variant: "webrip" },
    { id: 6, quality: "1080p", file_size: "2.5 GB", url: "magnet:?xt=urn:btih:example2", type: "torrent", variant: "webrip" }
  ];
  const emptyLinks = [];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Download Section Demo", "description": "Preview of the download section design" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-12 space-y-12"> <div class="text-center mb-12"> <h1 class="text-4xl font-bold mb-4" style="color: var(--text-primary);">Download Section Preview</h1> <p style="color: var(--text-secondary);">
Clean download interface - DDL and Torrent sections
</p> </div> <!-- Full Example (DDL + Torrent) --> <div> <h2 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Full Download Options</h2> ${renderComponent($$result2, "DownloadSection", DownloadSection, { "client:load": true, "title": "Moana 2", "links": demoLinks, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/DownloadSection.svelte", "client:component-export": "default" })} </div> <!-- DDL Only --> <div> <h2 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">DDL Only</h2> ${renderComponent($$result2, "DownloadSection", DownloadSection, { "client:load": true, "title": "Movie Name", "links": ddlOnlyLinks, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/DownloadSection.svelte", "client:component-export": "default" })} </div> <!-- Torrent Only --> <div> <h2 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Torrent Only</h2> ${renderComponent($$result2, "DownloadSection", DownloadSection, { "client:load": true, "title": "", "links": torrentOnlyLinks, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/DownloadSection.svelte", "client:component-export": "default" })} </div> <!-- Empty State --> <div> <h2 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">No Downloads Yet</h2> ${renderComponent($$result2, "DownloadSection", DownloadSection, { "client:load": true, "title": "", "links": emptyLinks, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/DownloadSection.svelte", "client:component-export": "default" })} </div> </div> ` })}`;
}, "/var/www/trendimovies/src/pages/demo-downloads.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/demo-downloads.astro";
const $$url = "/demo-downloads";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DemoDownloads,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
