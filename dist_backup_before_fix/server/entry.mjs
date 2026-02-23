import { r as renderers } from './chunks/_@astro-renderers_DbfXOWuU.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CcdXqySj.mjs';
import { manifest } from './manifest_s9uM7_WG.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/crons.astro.mjs');
const _page3 = () => import('./pages/admin/downloads.astro.mjs');
const _page4 = () => import('./pages/admin/login.astro.mjs');
const _page5 = () => import('./pages/admin/logout.astro.mjs');
const _page6 = () => import('./pages/admin/manual-assign.astro.mjs');
const _page7 = () => import('./pages/admin/movies.astro.mjs');
const _page8 = () => import('./pages/admin/requests.astro.mjs');
const _page9 = () => import('./pages/admin/series.astro.mjs');
const _page10 = () => import('./pages/admin.astro.mjs');
const _page11 = () => import('./pages/api/admin/assign/episodes.astro.mjs');
const _page12 = () => import('./pages/api/admin/assign/link.astro.mjs');
const _page13 = () => import('./pages/api/admin/assign/search-telegram.astro.mjs');
const _page14 = () => import('./pages/api/admin/assign/search-tmdb.astro.mjs');
const _page15 = () => import('./pages/api/admin/crons/logs.astro.mjs');
const _page16 = () => import('./pages/api/admin/crons/status.astro.mjs');
const _page17 = () => import('./pages/api/admin/crons/trigger.astro.mjs');
const _page18 = () => import('./pages/api/admin/downloads.astro.mjs');
const _page19 = () => import('./pages/api/admin/login.astro.mjs');
const _page20 = () => import('./pages/api/admin/logout.astro.mjs');
const _page21 = () => import('./pages/api/admin/movies.astro.mjs');
const _page22 = () => import('./pages/api/admin/series.astro.mjs');
const _page23 = () => import('./pages/api/requests.astro.mjs');
const _page24 = () => import('./pages/api/search.astro.mjs');
const _page25 = () => import('./pages/api/stream/_id_.astro.mjs');
const _page26 = () => import('./pages/box-office.astro.mjs');
const _page27 = () => import('./pages/category/_slug_.astro.mjs');
const _page28 = () => import('./pages/contact.astro.mjs');
const _page29 = () => import('./pages/demo-downloads.astro.mjs');
const _page30 = () => import('./pages/dmca.astro.mjs');
const _page31 = () => import('./pages/download/generate.astro.mjs');
const _page32 = () => import('./pages/download/_token_.astro.mjs');
const _page33 = () => import('./pages/franchises.astro.mjs');
const _page34 = () => import('./pages/genre/_slug_.astro.mjs');
const _page35 = () => import('./pages/m/_slug_.astro.mjs');
const _page36 = () => import('./pages/movie/_id_.astro.mjs');
const _page37 = () => import('./pages/movies/latest.astro.mjs');
const _page38 = () => import('./pages/movies/top-2020-2023.astro.mjs');
const _page39 = () => import('./pages/movies/top-2024-2025.astro.mjs');
const _page40 = () => import('./pages/movies/top-2026.astro.mjs');
const _page41 = () => import('./pages/movies/upcoming.astro.mjs');
const _page42 = () => import('./pages/movies.astro.mjs');
const _page43 = () => import('./pages/oscars-2026.astro.mjs');
const _page44 = () => import('./pages/person/_id_.astro.mjs');
const _page45 = () => import('./pages/privacy.astro.mjs');
const _page46 = () => import('./pages/request.astro.mjs');
const _page47 = () => import('./pages/s/_slug_.astro.mjs');
const _page48 = () => import('./pages/search.astro.mjs');
const _page49 = () => import('./pages/series/new-episodes.astro.mjs');
const _page50 = () => import('./pages/series.astro.mjs');
const _page51 = () => import('./pages/terms.astro.mjs');
const _page52 = () => import('./pages/top-rated.astro.mjs');
const _page53 = () => import('./pages/trending.astro.mjs');
const _page54 = () => import('./pages/tv/_id_.astro.mjs');
const _page55 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/crons.astro", _page2],
    ["src/pages/admin/downloads.astro", _page3],
    ["src/pages/admin/login.astro", _page4],
    ["src/pages/admin/logout.astro", _page5],
    ["src/pages/admin/manual-assign.astro", _page6],
    ["src/pages/admin/movies.astro", _page7],
    ["src/pages/admin/requests.astro", _page8],
    ["src/pages/admin/series.astro", _page9],
    ["src/pages/admin/index.astro", _page10],
    ["src/pages/api/admin/assign/episodes.ts", _page11],
    ["src/pages/api/admin/assign/link.ts", _page12],
    ["src/pages/api/admin/assign/search-telegram.ts", _page13],
    ["src/pages/api/admin/assign/search-tmdb.ts", _page14],
    ["src/pages/api/admin/crons/logs.ts", _page15],
    ["src/pages/api/admin/crons/status.ts", _page16],
    ["src/pages/api/admin/crons/trigger.ts", _page17],
    ["src/pages/api/admin/downloads.ts", _page18],
    ["src/pages/api/admin/login.ts", _page19],
    ["src/pages/api/admin/logout.ts", _page20],
    ["src/pages/api/admin/movies.ts", _page21],
    ["src/pages/api/admin/series.ts", _page22],
    ["src/pages/api/requests.ts", _page23],
    ["src/pages/api/search.ts", _page24],
    ["src/pages/api/stream/[id].ts", _page25],
    ["src/pages/box-office.astro", _page26],
    ["src/pages/category/[slug].astro", _page27],
    ["src/pages/contact.astro", _page28],
    ["src/pages/demo-downloads.astro", _page29],
    ["src/pages/dmca.astro", _page30],
    ["src/pages/download/generate.ts", _page31],
    ["src/pages/download/[token].astro", _page32],
    ["src/pages/franchises.astro", _page33],
    ["src/pages/genre/[slug].astro", _page34],
    ["src/pages/m/[slug].astro", _page35],
    ["src/pages/movie/[id].astro", _page36],
    ["src/pages/movies/latest.astro", _page37],
    ["src/pages/movies/top-2020-2023.astro", _page38],
    ["src/pages/movies/top-2024-2025.astro", _page39],
    ["src/pages/movies/top-2026.astro", _page40],
    ["src/pages/movies/upcoming.astro", _page41],
    ["src/pages/movies.astro", _page42],
    ["src/pages/oscars-2026.astro", _page43],
    ["src/pages/person/[id].astro", _page44],
    ["src/pages/privacy.astro", _page45],
    ["src/pages/request.astro", _page46],
    ["src/pages/s/[slug].astro", _page47],
    ["src/pages/search.astro", _page48],
    ["src/pages/series/new-episodes.astro", _page49],
    ["src/pages/series.astro", _page50],
    ["src/pages/terms.astro", _page51],
    ["src/pages/top-rated.astro", _page52],
    ["src/pages/trending.astro", _page53],
    ["src/pages/tv/[id].astro", _page54],
    ["src/pages/index.astro", _page55]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///var/www/trendimovies/dist/client/",
    "server": "file:///var/www/trendimovies/dist/server/",
    "host": true,
    "port": 3000,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
