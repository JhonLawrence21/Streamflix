const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

let recommendationController;
try {
  const ctrl = require('../controllers/recommendationController');
  if (ctrl && typeof ctrl.getForYou === 'function' && 
      typeof ctrl.getSimilar === 'function' &&
      typeof ctrl.trackWatch === 'function' &&
      typeof ctrl.getHistory === 'function' &&
      typeof ctrl.clearHistory === 'function') {
    recommendationController = ctrl;
    console.log('[Recommendations] Controller loaded successfully');
  } else {
    console.warn('[Recommendations] Controller methods missing');
  }
} catch (e) {
  console.warn('[Recommendations] Controller not available:', e.message);
}

if (recommendationController) {
  router.get('/for-you', auth, recommendationController.getForYou);
  router.get('/similar/:movieId', recommendationController.getSimilar);
  router.post('/track/:movieId', auth, recommendationController.trackWatch);
  router.get('/history', auth, recommendationController.getHistory);
  router.delete('/history', auth, recommendationController.clearHistory);
}

module.exports = router;