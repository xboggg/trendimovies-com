const u={US:"🇺🇸",GB:"🇬🇧",CA:"🇨🇦",AU:"🇦🇺",DE:"🇩🇪",FR:"🇫🇷",IN:"🇮🇳",NG:"🇳🇬",GH:"🇬🇭",ZA:"🇿🇦",KE:"🇰🇪",BR:"🇧🇷",MX:"🇲🇽",ES:"🇪🇸",IT:"🇮🇹",NL:"🇳🇱",PL:"🇵🇱",RU:"🇷🇺",JP:"🇯🇵",KR:"🇰🇷",CN:"🇨🇳",SG:"🇸🇬",PH:"🇵🇭",ID:"🇮🇩",MY:"🇲🇾",TH:"🇹🇭",VN:"🇻🇳",PK:"🇵🇰",BD:"🇧🇩",EG:"🇪🇬",AE:"🇦🇪",SA:"🇸🇦",TR:"🇹🇷",SE:"🇸🇪",NO:"🇳🇴",DK:"🇩🇰",FI:"🇫🇮",AT:"🇦🇹",CH:"🇨🇭",BE:"🇧🇪",PT:"🇵🇹",GR:"🇬🇷",CZ:"🇨🇿",HU:"🇭🇺",RO:"🇷🇴",UA:"🇺🇦",IL:"🇮🇱",AR:"🇦🇷",CL:"🇨🇱",CO:"🇨🇴",PE:"🇵🇪",VE:"🇻🇪",NZ:"🇳🇿",IE:"🇮🇪",ZW:"🇿🇼",TZ:"🇹🇿",UG:"🇺🇬",ET:"🇪🇹",CM:"🇨🇲",CI:"🇨🇮"},y={desktop:"🖥️",mobile:"📱",tablet:"📲"},f={Chrome:"🌐",Firefox:"🦊",Safari:"🧭",Edge:"🌊",Opera:"🔴",Unknown:"❓"};function n(s){const a=document.createElement("div");return a.textContent=s,a.innerHTML}function v(s){const a=s.match(/^\/movie\/(\d+)/);if(a)return`🎬 Movie #${a[1]}`;const e=s.match(/^\/tv\/(\d+)/);return e?`📺 TV #${e[1]}`:s==="/"?"🏠 Home":s==="/movies"?"🎬 Movies":s==="/movies/latest"?"🎬 Latest Movies":s==="/tv"?"📺 TV Shows":s==="/search"?"🔍 Search":s.startsWith("/genre/")?`🏷️ ${n(s.replace("/genre/","").replace(/-/g," "))}`:n(s)}async function m(){const s=document.getElementById("periodSelect").value;try{const e=await(await fetch(`/api/analytics/stats?period=${s}`)).json();if(e.success){document.getElementById("pageViews").textContent=e.stats.pageViews.toLocaleString(),document.getElementById("uniqueVisitors").textContent=e.stats.uniqueVisitors.toLocaleString(),document.getElementById("searches").textContent=e.stats.searches.toLocaleString(),document.getElementById("downloads").textContent=e.stats.downloads.toLocaleString();const o=document.getElementById("topCountries");e.countries&&e.countries.length>0?o.innerHTML=e.countries.map(t=>`<div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span class="text-gray-300 text-sm">${u[t.country_code]||"🌍"} ${n(t.country)}</span>
              <span class="text-red-400 font-semibold text-sm">${t.visitor_count.toLocaleString()}</span>
            </div>`).join(""):o.innerHTML='<p class="text-gray-500">No data yet</p>';const c=document.getElementById("deviceStats");e.devices&&e.devices.length>0?c.innerHTML=e.devices.map(t=>{const r=y[t.device_type]||"❓",g=t.device_type.charAt(0).toUpperCase()+t.device_type.slice(1);return`<div class="mb-3">
              <div class="flex justify-between items-center mb-1">
                <span class="text-gray-300 text-sm">${r} ${n(g)}</span>
                <span class="text-gray-400 text-sm">${t.percentage}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full" style="width: ${t.percentage}%"></div>
              </div>
            </div>`}).join(""):c.innerHTML='<p class="text-gray-500">No data yet</p>';const i=document.getElementById("browserStats");e.browsers&&e.browsers.length>0?i.innerHTML=e.browsers.map(t=>`<div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span class="text-gray-300 text-sm">${f[t.browser]||"🌐"} ${n(t.browser)}</span>
              <span class="text-red-400 font-semibold text-sm">${t.percentage}%</span>
            </div>`).join(""):i.innerHTML='<p class="text-gray-500">No data yet</p>';const l=document.getElementById("topPages");e.topPages&&e.topPages.length>0?l.innerHTML=e.topPages.slice(0,20).map(t=>{const r=v(t.page_path);return`<div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <a href="${n(t.page_path)}" target="_blank" class="text-gray-300 text-sm truncate mr-2 hover:text-red-400" title="${n(t.page_path)}">${r}</a>
              <span class="text-red-400 font-semibold text-sm">${t.view_count}</span>
            </div>`}).join(""):l.innerHTML='<p class="text-gray-500">No data yet</p>';const d=document.getElementById("topSearches");e.topSearches&&e.topSearches.length>0?d.innerHTML=e.topSearches.slice(0,20).map(t=>`
            <div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span class="text-gray-300 text-sm truncate mr-2">${n(t.query)}</span>
              <span class="text-red-400 font-semibold text-sm">${t.search_count}</span>
            </div>
          `).join(""):d.innerHTML='<p class="text-gray-500">No data yet</p>';const p=document.getElementById("topDownloads");e.topDownloads&&e.topDownloads.length>0?p.innerHTML=e.topDownloads.slice(0,20).map(t=>`
            <div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span class="text-gray-300 text-sm truncate mr-2">${n(t.title)}</span>
              <span class="text-red-400 font-semibold text-sm">${t.download_count}</span>
            </div>
          `).join(""):p.innerHTML='<p class="text-gray-500">No data yet</p>'}}catch(a){console.error("Failed to load analytics:",a)}}document.getElementById("periodSelect")?.addEventListener("change",m);m();
