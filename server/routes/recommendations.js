const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

console.log('[ROUTES] Loading recommendations routes...');

let recommendationController;
try {
  recommendationController = require('../controllers/recommendationController');
  console.log('[recommendations] Controller loaded:', Object.keys(recommendationController));
} catch (err) {
  console.error('[recommendations] Controller load error:', err.message);
}

if (recommendationController && recommendationController.getForYou) {
  router.get('/for-you', protect, recommendationController.getForYou);
}
if (recommendationController && recommendationController.getSimilar) {
  router.get('/similar/:movieId', recommendationController.getSimilar);
}
if (recommendationController && recommendationController.trackWatch) {
  router.post('/track/:movieId', protect, recommendationController.trackWatch);
}
if (recommendationController && recommendationController.getHistory) {
  router.get('/history', protect, recommendationController.getHistory);
}
if (recommendationController && recommendationController.clearHistory) {
  router.delete('/history', protect, recommendationController.clearHistory);
}

module.exports = router;