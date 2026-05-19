const https = require('https');
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const getApiKey = () => {
  return process.env.TMDB_API_KEY || '';
};

const fetchJson = (url, timeoutMs = 8000) => new Promise((resolve, reject) => {
  const req = https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode >= 400) {
        try {
          const err = JSON.parse(data);
          reject(new Error(err.status_message || `TMDB HTTP ${res.statusCode}`));
        } catch {
          reject(new Error(`TMDB HTTP ${res.statusCode}`));
        }
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
  });
  req.on('error', reject);
  req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('TMDB timeout')); });
});

exports.searchMovie = async (title, type = 'movie') => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (!title) return null;

  const searchTypes = type === 'tv' ? ['tv', 'movie'] : ['movie', 'tv'];

  for (const st of searchTypes) {
    try {
      const url = `https://api.themoviedb.org/3/search/${st}?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=en-US`;
      const data = await fetchJson(url);
      if (data.results && data.results.length > 0) {
        const best = data.results[0];
        return { ...best, _searchType: st };
      }
    } catch (e) {
      console.error(`[TMDB] Search error for "${title}" (${st}):`, e.message);
    }
  }

  return null;
};

exports.fetchMovieDetails = async (tmdbId, type = 'movie') => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const endpoint = type === 'tv' ? 'tv' : 'movie';
    const [details, credits] = await Promise.all([
      fetchJson(`https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${apiKey}&language=en-US`),
      fetchJson(`https://api.themoviedb.org/3/${endpoint}/${tmdbId}/credits?api_key=${apiKey}&language=en-US`)
    ]);
    if (details.success === false) return null;

    const cast = (credits.cast || []).slice(0, 10).map(c => c.name);
    const director = type === 'tv'
      ? (details.created_by || []).map(c => c.name).join(', ')
      : (credits.crew || []).find(c => c.job === 'Director')?.name || '';
    const genreNames = (details.genres || []).map(g => g.name);

    const runtime = type === 'tv'
      ? (details.episode_run_time || [])[0] || 0
      : details.runtime || 0;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    const seasons = details.number_of_seasons || 0;
    const episodes = details.number_of_episodes || 0;
    const fullDuration = type === 'tv' && seasons > 0
      ? `${seasons} Seasons, ${episodes} Episodes`
      : durationStr;

    return {
      title: type === 'tv' ? details.name : details.title,
      description: details.overview || '',
      thumbnail: details.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : '',
      backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${details.backdrop_path}` : '',
      rating: details.vote_average ? parseFloat((details.vote_average * 10 / 10).toFixed(1)) : 0,
      releaseYear: type === 'tv'
        ? (details.first_air_date ? parseInt(details.first_air_date.split('-')[0]) : null)
        : (details.release_date ? parseInt(details.release_date.split('-')[0]) : null),
      releaseDate: type === 'tv' ? (details.first_air_date || '') : (details.release_date || ''),
      duration: fullDuration,
      genre: genreNames,
      cast: cast,
      director,
      country: (details.production_countries || [])[0]?.name || '',
      type: type
    };
  } catch (e) {
    console.error(`[TMDB] Fetch error for ID ${tmdbId}:`, e.message);
    return null;
  }
};

exports.syncMovieRating = async (movie) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  let tmdbId = movie.tmdbId;

  if (tmdbId) {
    const types = movie.type === 'tv' ? ['tv', 'movie'] : ['movie', 'tv'];
    for (const t of types) {
      const details = await exports.fetchMovieDetails(tmdbId, t);
      if (details && details.rating !== undefined && details.rating !== null) {
        return { rating: details.rating, tmdbId };
      }
    }
  }

  const searchResult = await exports.searchMovie(movie.title, movie.type || 'movie');
  if (searchResult) {
    tmdbId = searchResult.id;
    const voteAvg = searchResult.vote_average;
    const rating = voteAvg
      ? parseFloat((voteAvg * 10 / 10).toFixed(1))
      : (voteAvg === 0 ? 0 : 0);
    return { rating, tmdbId };
  }

  return null;
};
