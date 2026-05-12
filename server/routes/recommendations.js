const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

let recommendationController;
try {
  recommendationController = require('../controllers/recommendationController');
  console.log('[recommendations] Controller loaded:', Object.keys(recommendationController));
} catch (err) {
  console.error('[recommendations] Controller load error:', err.message);
}

if (recommendationController && recommendationController.getForYou) {
  router.get('/for-you', auth, recommendationController.getForYou);
}
if (recommendationController && recommendationController.getSimilar) {
  router.get('/similar/:movieId', recommendationController.getSimilar);
}
if (recommendationController && recommendationController.trackWatch) {
  router.post('/track/:movieId', auth, recommendationController.trackWatch);
}
if (recommendationController && recommendationController.getHistory) {
  router.get('/history', auth, recommendationController.getHistory);
}
if (recommendationController && recommendationController.clearHistory) {
  router.delete('/history', auth, recommendationController.clearHistory);
}

module.exports = router;