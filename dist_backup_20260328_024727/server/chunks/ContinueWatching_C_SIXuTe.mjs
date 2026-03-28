import { i as fallback, d as ensure_array_like, c as attr, h as stringify, o as attr_style, e as escape_html, j as bind_props, f as attr_class } from './_@astro-renderers_DbfXOWuU.mjs';
/* empty css                         */
import { C as Chevron_right } from './chevron-right_CYTSjxVf.mjs';
import { C as Chevron_left } from './chevron-left_DA35Owfk.mjs';
import { X } from './x_BerO-wAW.mjs';
import { P as Play } from './play_C2FbJLkE.mjs';
import { C as Clock } from './clock_CjYHN5RC.mjs';

function Collections($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let displayCollections;
		let collections = fallback($$props['collections'], () => [], true);

		const mockCollections = [
			{
				id: 'binge-kdramas',
				title: 'Binge-Worthy K-Dramas',
				subtitle: 'Addictive stories from Korea',
				count: 24,
				gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
				icon: 'heart',
				posters: [
					'/gYzYVMEfGasjyMOSooAhDP8Bsdg.jpg',
					'/jWXrQstj7p3Wl5MfYWY6IHqRpDb.jpg',
					'/5UaYsGZOFhjFDwQh6GuLjjA1WlF.jpg',
					'/9NJMOBixdQZKBnSTwPKmjCAvGkb.jpg'
				]
			},

			{
				id: 'shows-changed-tv',
				title: 'Shows That Changed TV',
				subtitle: 'The all-time greatest',
				count: 18,
				gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
				icon: 'flame',
				posters: [
					'/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
					'/2IWouZK4gkgHhJnDIGGqfyh0ZR7.jpg',
					'/bE2GiFLLJcOuG1bCOqnahC4bWtN.jpg',
					'/49WJfeN0moxb9IPfGn8AIqMGskD.jpg'
				]
			},

			{
				id: 'under-90-min',
				title: 'Quick Watch',
				subtitle: 'Under 90 minutes',
				count: 32,
				gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
				icon: 'film',
				posters: [
					'/gbGHezV6yrhua0KfAgwzknWYJSf.jpg',
					'/jQBtmKFa9Bfhw44UOGYdCbluMmZ.jpg',
					'/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg',
					'/z0R3d6dJPYMixkFnbnK37qTzLRi.jpg'
				]
			},

			{
				id: 'horror-nightmares',
				title: 'Nightmare Fuel',
				subtitle: 'Sleep with the lights on',
				count: 28,
				gradient: 'linear-gradient(135deg, #1e1e1e 0%, #7f1d1d 100%)',
				icon: 'skull',
				posters: [
					'/9xhm6AO1HXIY6JCYVFbOOJLPah.jpg',
					'/v9De2KqsmIxSxNMVGODuBfH5wfj.jpg',
					'/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg',
					'/uNMlwRCPlZQhDaJlwL0Ivbu6v4r.jpg'
				]
			},

			{
				id: 'epic-fantasy',
				title: 'Epic Fantasy Worlds',
				subtitle: 'Dragons, magic & kingdoms',
				count: 15,
				gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
				icon: 'wand',
				posters: [
					'/jFmMFbMEad0fmxl0EKkSAqVjfjT.jpg',
					'/gbGHezV6yrhua0KfAgwzknWYJSf.jpg',
					'/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
					'/2IWouZK4gkgHhJnDIGGqfyh0ZR7.jpg'
				]
			},

			{
				id: 'action-packed',
				title: 'Non-Stop Action',
				subtitle: 'Explosions & adrenaline',
				count: 36,
				gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
				icon: 'swords',
				posters: [
					'/z0R3d6dJPYMixkFnbnK37qTzLRi.jpg',
					'/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg',
					'/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg',
					'/gbGHezV6yrhua0KfAgwzknWYJSf.jpg'
				]
			}
		];

		displayCollections = collections.length > 0 ? collections : mockCollections;

		$$renderer.push(`<section class="py-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between mb-6"><div class="flex items-center gap-3"><h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">Collections</h2> <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background: var(--bg-hover); color: var(--text-secondary);">Curated for you</span></div></div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);

		const each_array = ensure_array_like(displayCollections);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let collection = each_array[i];

			$$renderer.push(`<a${attr('href', `/collection/${stringify(collection.id)}`)} class="collection-card group svelte-n817ht"${attr_style(`--delay: ${stringify(i * 100)}ms`)}><div class="card-bg svelte-n817ht"${attr_style(`background: ${stringify(collection.gradient)}`)}><div class="poster-stack svelte-n817ht"><!--[-->`);

			const each_array_1 = ensure_array_like(collection.posters.slice(0, 4));

			for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
				let poster = each_array_1[j];

				$$renderer.push(`<div class="stacked-poster svelte-n817ht"${attr_style(`--offset: ${stringify(j * 28)}px; --rotate: ${stringify(-6 + j * 4)}deg; z-index: ${stringify(4 - j)}`)}><img${attr('src', `https://image.tmdb.org/t/p/w185${poster}`)} alt="" class="stacked-img svelte-n817ht" loading="lazy"/></div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="card-overlay svelte-n817ht"></div></div> <div class="card-content svelte-n817ht"><div class="flex items-start justify-between"><div><h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors">${escape_html(collection.title)}</h3> <p class="text-xs text-white/60 mt-0.5">${escape_html(collection.subtitle)}</p></div> <div class="collection-arrow svelte-n817ht">`);
			Chevron_right($$renderer, { size: 18 });
			$$renderer.push(`<!----></div></div> <div class="flex items-center gap-2 mt-3"><span class="count-badge svelte-n817ht">${escape_html(collection.count)} titles</span></div></div></a>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
		bind_props($$props, { collections });
	});
}

function PickYourMood($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let displayMoods;
		let moods = fallback($$props['moods'], () => [], true);

		const mockMoods = [
			{
				id: 'chill',
				emoji: '😌',
				label: 'Chill',
				gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
				items: [
					{
						id: 101,
						title: 'The Secret Life of Walter Mitty',
						poster_path: '/pGciyHsSApCAqPIKfLSxfnPLjcp.jpg',
						year: 2013,
						vote_average: 7.2,
						type: 'movie'
					},

					{
						id: 102,
						title: 'Chef',
						poster_path: '/mosFNFirV2OdGBbYUrIWgslELqP.jpg',
						year: 2014,
						vote_average: 7.2,
						type: 'movie'
					},

					{
						id: 103,
						title: 'The Grand Budapest Hotel',
						poster_path: '/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
						year: 2014,
						vote_average: 8.1,
						type: 'movie'
					},

					{
						id: 104,
						title: 'Paddington 2',
						poster_path: '/a0Gf5z9MdBqWVbbLYOsMniXQCAq.jpg',
						year: 2017,
						vote_average: 7.8,
						type: 'movie'
					}
				]
			},

			{
				id: 'thrilling',
				emoji: '😰',
				label: 'Thrilling',
				gradient: 'linear-gradient(135deg, #dc2626, #991b1b)',
				items: [
					{
						id: 201,
						title: 'Sicario',
						poster_path: '/z8fLlOEhmn6Lost98IWKP0vtiCN.jpg',
						year: 2015,
						vote_average: 7.6,
						type: 'movie'
					},

					{
						id: 202,
						title: 'Gone Girl',
						poster_path: '/lv5xShBIDPe7m4ufdKMnW4Kp1oo.jpg',
						year: 2014,
						vote_average: 8.1,
						type: 'movie'
					},

					{
						id: 203,
						title: 'Prisoners',
						poster_path: '/uhOJklEPoxMqj4VkIOkfRi43AJx.jpg',
						year: 2013,
						vote_average: 8.1,
						type: 'movie'
					},

					{
						id: 204,
						title: 'Nightcrawler',
						poster_path: '/j73RapPFwMEssvxzjkrjVeTjRLS.jpg',
						year: 2014,
						vote_average: 7.7,
						type: 'movie'
					}
				]
			},

			{
				id: 'laugh',
				emoji: '😂',
				label: 'Laugh',
				gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)',
				items: [
					{
						id: 301,
						title: 'Game Night',
						poster_path: '/85R8LMyn9f2Lev2YPBF8noLCbVf.jpg',
						year: 2018,
						vote_average: 7.0,
						type: 'movie'
					},

					{
						id: 302,
						title: 'The Nice Guys',
						poster_path: '/bXkqMdC9ELMHFBhUXbvqlLSe22L.jpg',
						year: 2016,
						vote_average: 7.1,
						type: 'movie'
					},

					{
						id: 303,
						title: 'Bridesmaids',
						poster_path: '/SHYKGOYBnuBImkMOPnqpWCH8GO.jpg',
						year: 2011,
						vote_average: 6.7,
						type: 'movie'
					},

					{
						id: 304,
						title: 'Superbad',
						poster_path: '/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg',
						year: 2007,
						vote_average: 7.2,
						type: 'movie'
					}
				]
			},

			{
				id: 'cry',
				emoji: '😢',
				label: 'Cry',
				gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
				items: [
					{
						id: 401,
						title: 'The Pursuit of Happyness',
						poster_path: '/lBYOKAMcxIvuk9s9hMkVrTQiCEG.jpg',
						year: 2006,
						vote_average: 8.0,
						type: 'movie'
					},

					{
						id: 402,
						title: 'A Star Is Born',
						poster_path: '/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg',
						year: 2018,
						vote_average: 7.5,
						type: 'movie'
					},

					{
						id: 403,
						title: 'Schindler\'s List',
						poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
						year: 1993,
						vote_average: 8.6,
						type: 'movie'
					},

					{
						id: 404,
						title: 'Grave of the Fireflies',
						poster_path: '/qG3RYlIVpTYclR9Youpirt4EHQL.jpg',
						year: 1988,
						vote_average: 8.5,
						type: 'movie'
					}
				]
			},

			{
				id: 'mind-blown',
				emoji: '🤯',
				label: 'Mind-Blown',
				gradient: 'linear-gradient(135deg, #059669, #0d9488)',
				items: [
					{
						id: 501,
						title: 'Inception',
						poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
						year: 2010,
						vote_average: 8.4,
						type: 'movie'
					},

					{
						id: 502,
						title: 'Interstellar',
						poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
						year: 2014,
						vote_average: 8.4,
						type: 'movie'
					},

					{
						id: 503,
						title: 'The Prestige',
						poster_path: '/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg',
						year: 2006,
						vote_average: 8.2,
						type: 'movie'
					},

					{
						id: 504,
						title: 'Shutter Island',
						poster_path: '/kve20tXMHZjH58aBCkLUGwJ8jyl.jpg',
						year: 2010,
						vote_average: 8.2,
						type: 'movie'
					}
				]
			},

			{
				id: 'nostalgic',
				emoji: '🥹',
				label: 'Nostalgic',
				gradient: 'linear-gradient(135deg, #be185d, #e11d48)',
				items: [
					{
						id: 601,
						title: 'The Breakfast Club',
						poster_path: '/vSqk5bLaE1txMwezULczJyfMHCq.jpg',
						year: 1985,
						vote_average: 7.8,
						type: 'movie'
					},

					{
						id: 602,
						title: 'Back to the Future',
						poster_path: '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg',
						year: 1985,
						vote_average: 8.3,
						type: 'movie'
					},

					{
						id: 603,
						title: 'E.T.',
						poster_path: '/an0nD6uq6bLxj4PKaH5E5BaKnEh.jpg',
						year: 1982,
						vote_average: 7.5,
						type: 'movie'
					},

					{
						id: 604,
						title: 'The Goonies',
						poster_path: '/eBSbpN6LpABBiMx4JTxpGDqJMzl.jpg',
						year: 1985,
						vote_average: 7.8,
						type: 'movie'
					}
				]
			}
		];

		let selectedMood = null;

		displayMoods = moods.length > 0 ? moods : mockMoods;

		$$renderer.push(`<section class="py-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-6"><h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">Pick Your Mood</h2> <p class="text-sm mt-1" style="color: var(--text-muted);">How are you feeling? We will find something perfect.</p></div> <div class="mood-grid svelte-uubwhf"><!--[-->`);

		const each_array = ensure_array_like(displayMoods);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let mood = each_array[$$index];

			$$renderer.push(`<button${attr_class('mood-btn svelte-uubwhf', void 0, { 'active': selectedMood === mood.id })}${attr_style(`--mood-gradient: ${stringify(mood.gradient)}`)}><span class="mood-emoji svelte-uubwhf">${escape_html(mood.emoji)}</span> <span class="mood-label svelte-uubwhf">${escape_html(mood.label)}</span> `);

			if (selectedMood === mood.id) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="active-indicator svelte-uubwhf"></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div> `);

		{
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="empty-state svelte-uubwhf"><p style="color: var(--text-muted);">Tap a mood above to discover titles</p></div>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
		bind_props($$props, { moods });
	});
}

function ContinueWatching($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // 0-100
			// e.g. "S2 E5"
			// e.g. "42 min left"
			// e.g. "2 hours ago"
			displayItems,
			visibleItems;

		let items = fallback($$props['items'], () => [], true);

		const mockItems = [
			{
				id: 1,
				title: 'Daredevil: Born Again',
				poster_path: '/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg',
				backdrop_path: '/3AEoFb8OKTEOkPbd7MwJt2kzOkv.jpg',
				type: 'series',
				progress: 65,
				current_episode: 'S1 E5',
				episode_title: 'Serve and Protect',
				time_left: '22 min left',
				last_watched: '2 hours ago'
			},

			{
				id: 2,
				title: 'Adolescence',
				poster_path: '/v9De2KqsmIxSxNMVGODuBfH5wfj.jpg',
				type: 'series',
				progress: 30,
				current_episode: 'S1 E2',
				episode_title: 'The Reckoning',
				time_left: '35 min left',
				last_watched: '5 hours ago'
			},

			{
				id: 3,
				title: 'Sinners',
				poster_path: '/9xhm6AO1HXIY6JCYVFbOOJLPah.jpg',
				backdrop_path: '/1GjSaqMU5bYRnClPGhwEbBQirkp.jpg',
				type: 'movie',
				progress: 45,
				time_left: '1h 12min left',
				last_watched: 'Yesterday'
			},

			{
				id: 4,
				title: 'White Lotus S3',
				poster_path: '/bE2GiFLLJcOuG1bCOqnahC4bWtN.jpg',
				type: 'series',
				progress: 80,
				current_episode: 'S3 E6',
				episode_title: 'Abductions',
				time_left: '11 min left',
				last_watched: '1 day ago'
			},

			{
				id: 5,
				title: 'Andor S2',
				poster_path: '/uNMlwRCPlZQhDaJlwL0Ivbu6v4r.jpg',
				type: 'series',
				progress: 15,
				current_episode: 'S2 E1',
				episode_title: 'Rix Road',
				time_left: '48 min left',
				last_watched: '3 days ago'
			},

			{
				id: 6,
				title: 'The Amateur',
				poster_path: '/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg',
				type: 'movie',
				progress: 55,
				time_left: '58 min left',
				last_watched: '4 days ago'
			}
		];

		let dismissed = new Set();

		function getProgressColor(progress) {
			if (progress >= 75) return '#22c55e';
			if (progress >= 40) return '#f59e0b';

			return '#e50914';
		}

		displayItems = items.length > 0 ? items : mockItems;
		visibleItems = displayItems.filter((i) => !dismissed.has(i.id));

		$$renderer.push(`<section class="py-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between mb-5"><div class="flex items-center gap-3"><h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">Continue Watching</h2> <span class="item-count svelte-r70oj4">${escape_html(visibleItems.length)}</span></div> <div class="flex gap-2"><button class="nav-btn svelte-r70oj4">`);
		Chevron_left($$renderer, { size: 18 });
		$$renderer.push(`<!----></button> <button class="nav-btn svelte-r70oj4">`);
		Chevron_right($$renderer, { size: 18 });
		$$renderer.push(`<!----></button></div></div> `);

		if (visibleItems.length > 0) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth svelte-r70oj4"><!--[-->`);

			const each_array = ensure_array_like(visibleItems);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];
				const color = getProgressColor(item.progress);

				$$renderer.push(`<a${attr('href', item.type === 'movie'
					? `/movie/${item.tmdb_id || item.id}`
					: `/tv/${item.tmdb_id || item.id}`)} class="cw-card group svelte-r70oj4"><div class="card-visual svelte-r70oj4"><img${attr('src', item.backdrop_path
					? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
					: item.poster_path
						? `https://image.tmdb.org/t/p/w500${item.poster_path}`
						: '/images/no-poster.svg')}${attr('alt', item.title)} class="visual-img svelte-r70oj4" loading="lazy"/> <div class="visual-gradient svelte-r70oj4"></div> <button class="dismiss-btn svelte-r70oj4" title="Remove from list">`);

				X($$renderer, { size: 14 });
				$$renderer.push(`<!----></button> <div class="play-center svelte-r70oj4"><div class="play-ring svelte-r70oj4"${attr_style(`--progress: ${stringify(item.progress)}; --color: ${stringify(color)}`)}><svg viewBox="0 0 44 44" class="progress-svg svelte-r70oj4"><circle cx="22" cy="22" r="20" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" stroke-width="2.5"></circle><circle cx="22" cy="22" r="20" fill="none"${attr('stroke', color)} stroke-width="2.5"${attr('stroke-dasharray', `${stringify(item.progress / 100 * 125.6)} 125.6`)} stroke-linecap="round" class="progress-circle svelte-r70oj4"></circle></svg> `);
				Play($$renderer, { size: 18, fill: 'white', class: 'play-icon' });
				$$renderer.push(`<!----></div></div> `);

				if (item.current_episode) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<div class="episode-badge svelte-r70oj4">${escape_html(item.current_episode)}</div>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> <div class="bottom-info svelte-r70oj4"><h3 class="font-bold text-sm text-white line-clamp-1">${escape_html(item.title)}</h3> `);

				if (item.episode_title) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<p class="text-xs text-white/60 line-clamp-1">${escape_html(item.episode_title)}</p>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="progress-track svelte-r70oj4"><div class="progress-fill svelte-r70oj4"${attr_style(`width: ${stringify(item.progress)}%; background: ${stringify(color)}`)}></div></div> <div class="card-meta svelte-r70oj4"><div class="flex items-center gap-1">`);
				Clock($$renderer, { size: 10, class: 'text-gray-400' });
				$$renderer.push(`<!----> <span class="meta-text svelte-r70oj4">${escape_html(item.time_left)}</span></div> <span class="meta-text svelte-r70oj4">${escape_html(item.last_watched)}</span></div></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="empty-state svelte-r70oj4"><p style="color: var(--text-muted);">Nothing here yet. Start watching something!</p></div>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
		bind_props($$props, { items });
	});
}

export { Collections as C, PickYourMood as P, ContinueWatching as a };
