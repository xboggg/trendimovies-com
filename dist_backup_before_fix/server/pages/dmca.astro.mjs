import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Dmca = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "DMCA", "description": "DMCA takedown policy for TrendiMovies" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h1 class="text-3xl font-bold mb-8" style="color: var(--text-primary);">DMCA Policy</h1> <div class="prose prose-invert max-w-none space-y-6" style="color: var(--text-secondary);"> <p>
TrendiMovies respects the intellectual property rights of others and expects its users to do the same.
        In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously
        to claims of copyright infringement committed using our service.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Important Notice</h2> <p>
TrendiMovies does not host any video content on its servers. All video streams are embedded from
        third-party sources and are not under our control. We are simply an indexing service that points
        to content hosted elsewhere on the internet.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Filing a DMCA Notice</h2> <p>
If you believe that content available through our service infringes your copyright, please send
        a DMCA takedown notice containing the following information:
</p> <ol class="list-decimal list-inside space-y-2 ml-4"> <li>A physical or electronic signature of the copyright owner or authorized agent</li> <li>Identification of the copyrighted work claimed to have been infringed</li> <li>Identification of the material that is claimed to be infringing, including the URL</li> <li>Your contact information (address, telephone number, email)</li> <li>A statement that you have a good faith belief that the use is not authorized</li> <li>A statement that the information in the notice is accurate, under penalty of perjury</li> </ol> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Contact Information</h2> <p>
Please send DMCA notices to:
</p> <p class="p-4 rounded-lg" style="background-color: var(--bg-card);">
Email: <a href="mailto:dmca@trendimovies.com" class="text-[var(--accent)] hover:underline">dmca@trendimovies.com</a> </p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Response Time</h2> <p>
We aim to respond to valid DMCA notices within 24-48 hours. Upon receipt of a valid notice,
        we will remove or disable access to the allegedly infringing material.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Counter-Notification</h2> <p>
If you believe your content was removed in error, you may file a counter-notification.
        Please contact us for more information about this process.
</p> </div> </div> ` })}`;
}, "/var/www/trendimovies/src/pages/dmca.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/dmca.astro";
const $$url = "/dmca";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dmca,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
