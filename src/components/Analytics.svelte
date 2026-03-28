<script>
  import { onMount } from 'svelte';

  // Generate or retrieve session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('tm_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      sessionStorage.setItem('tm_session_id', sessionId);
    }
    return sessionId;
  }

  onMount(() => {
    // Don't track admin pages
    if (window.location.pathname.startsWith('/admin')) return;
    if (window.location.pathname.startsWith('/api/')) return;

    // Send pageview
    const trackPageview = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_path: window.location.pathname,
            referrer: document.referrer || '',
            session_id: getSessionId()
          })
        });
      } catch (e) {
        // Silent fail - analytics shouldn't break the site
      }
    };

    trackPageview();
  });
</script>
