const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

let recommendationController;
try {
  recommendationController = require('../controllers/recommendationController');
} catch (e) {
  console.warn('Recommendation controller not available');
  recommendationController = null;
}

if (recommendationController) {
  router.get('/for-you', auth, recommendationController.getForYou);
  router.get('/similar/:movieId', recommendationController.getSimilar);
  router.post('/track/:movieId', auth, recommendationController.trackWatch);
  router.get('/history', auth, recommendationController.getHistory);
  router.delete('/history', auth, recommendationController.clearHistory);
}

module.exports = router;