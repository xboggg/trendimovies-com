import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Privacy Policy", "description": "Privacy policy for TrendiMovies" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h1 class="text-3xl font-bold mb-8" style="color: var(--text-primary);">Privacy Policy</h1> <div class="space-y-6" style="color: var(--text-secondary);"> <p><strong>Last updated:</strong> February 2026</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Information We Collect</h2> <p>
TrendiMovies does not require registration and does not collect personal information.
        However, we may collect the following:
</p> <ul class="list-disc list-inside space-y-2 ml-4"> <li>Anonymous usage statistics (page views, popular content)</li> <li>Device information (browser type, operating system)</li> <li>IP address (for security and analytics purposes)</li> </ul> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Cookies</h2> <p>
We use cookies to:
</p> <ul class="list-disc list-inside space-y-2 ml-4"> <li>Remember your theme preference (dark/light mode)</li> <li>Analyze site usage through analytics services</li> <li>Improve your browsing experience</li> </ul> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Third-Party Services</h2> <p>
We may use third-party services that collect data:
</p> <ul class="list-disc list-inside space-y-2 ml-4"> <li>Video streaming services (embedded players)</li> <li>Analytics services (Google Analytics or similar)</li> <li>Advertising networks (if applicable)</li> </ul> <p class="mt-4">
These services have their own privacy policies and we encourage you to review them.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Data Security</h2> <p>
We implement appropriate security measures to protect any data we collect.
        However, no internet transmission is completely secure.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Children's Privacy</h2> <p>
Our service is not intended for children under 13. We do not knowingly collect
        information from children under 13.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Changes to This Policy</h2> <p>
We may update this privacy policy from time to time. We will notify users of any
        changes by posting the new policy on this page.
</p> <h2 class="text-xl font-semibold mt-8 mb-4" style="color: var(--text-primary);">Contact Us</h2> <p>
If you have questions about this privacy policy, please contact us at:
<a href="mailto:privacy@trendimovies.com" class="text-[var(--accent)] hover:underline">
privacy@trendimovies.com
</a> </p> </div> </div> ` })}`;
}, "/var/www/trendimovies/src/pages/privacy.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
