import type { APIRoute } from 'astro';

// Use the existing Telegram API service on the server
const TELEGRAM_API = 'http://127.0.0.1:8765';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('query') || url.searchParams.get('q') || '';
  const year = url.searchParams.get('year') || '';
  const quality = url.searchParams.get('quality') || '';

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ files: [], message: 'Query too short' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Build search URL for the Telegram API
    const searchParams = new URLSearchParams({ title: query });
    if (year) searchParams.append('year', year);

    const response = await fetch(`${TELEGRAM_API}/search/movies?${searchParams}`, {
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      throw new Error(`Telegram API returned ${response.status}`);
    }

    const data = await response.json();

    // Filter by quality if specified and format results
    let files = (data.results || data.files || []).map((f: any) => ({
      id: f.message_id || f.id, // Use message_id as the primary ID
      message_id: f.message_id,
      file_name: f.file_name || f.filename,
      file_size: formatFileSize(f.file_size),
      quality: f.quality || extractQuality(f.file_name || f.filename || ''),
      year: f.year || extractYear(f.file_name || f.filename || '')
    }));

    if (quality) {
      // Filter by quality - check if quality string contains the selected quality (e.g., "720p WEBRip" contains "720p")
      files = files.filter((f: any) =>
        f.quality?.toLowerCase().includes(quality.toLowerCase())
      );
    }

    // Limit results
    files = files.slice(0, 50);

    return new Response(JSON.stringify({ files }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Telegram search error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to search Telegram files',
      files: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function extractQuality(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('2160p') || lower.includes('4k')) return '2160p';
  if (lower.includes('1080p')) return '1080p';
  if (lower.includes('720p')) return '720p';
  if (lower.includes('hdrip')) return 'hdrip';
  return '';
}

function extractYear(filename: string): number | null {
  const match = filename.match(/[.\-_\s](\d{4})[.\-_\s]/);
  if (match) {
    const year = parseInt(match[1]);
    if (year >= 1900 && year <= 2030) return year;
  }
  return null;
}
