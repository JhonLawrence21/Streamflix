# Fix Movie URLs and Details Viewing

## Issues Found
1. **Nested `<Link>` tags** in `MovieCard.jsx` and `MovieRow.jsx` — causes invalid HTML and broken navigation
2. **Watchlist data format mismatch** in `MovieDetailsPage.jsx` — checking `.includes()` on array of objects
3. **External URL bug** in `WatchPage.jsx` — generates invalid hrefs for YouTube external URLs
4. **Duplicated YouTube URL parsing** across multiple files
5. **Thumbnail fallback** duplicated and inconsistent

## Implementation Steps

- [x] 1. Update `client/src/utils/imageUtils.js` with shared URL utilities
- [x] 2. Fix `client/src/components/movie/MovieCard.jsx` — remove nested Link, fix navigation
- [x] 3. Fix `client/src/components/home/MovieRow.jsx` — remove nested Link, fix navigation
- [x] 4. Fix `client/src/pages/MovieDetailsPage.jsx` — fix watchlist check, fix external URL handling, use shared utilities
- [x] 5. Fix `client/src/pages/WatchPage.jsx` — fix video/external URL logic, use shared utilities
- [x] 6. Update `client/src/pages/admin/AdminMoviesPage.jsx` — thumbnail preview improvements
- [x] 7. Update `client/src/components/home/HeroBanner.jsx` — use shared thumbnail utility

## Testing
- [ ] Click movie card → navigates to `/movie/:id` without errors
- [ ] Click play button → navigates to `/watch/:id` without errors
- [ ] Click "More Info" → navigates to `/movie/:id` without errors
- [ ] YouTube embed URLs load correctly
- [ ] External URLs open properly (non-YouTube and YouTube)
- [ ] Thumbnails show fallback on error
- [ ] Watchlist status displays correctly on MovieDetailsPage

