const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const recommendationController = require('../controllers/recommendationController');

router.get('/for-you', auth, recommendationController.getForYou);
router.get('/similar/:movieId', recommendationController.getSimilar);
router.post('/track/:movieId', auth, recommendationController.trackWatch);
router.get('/history', auth, recommendationController.getHistory);
router.delete('/history', auth, recommendationController.clearHistory);

module.exports = router;