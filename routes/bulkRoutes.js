const express = require('express');
const router = express.Router();
const bulkController = require('../controllers/bulkController');
const protect = require('../middleware/authMiddleware');

router.post('/bulk', bulkController.create);
router.post('/bulk', bulkController.getAll);
router.get('/bulk/:id', protect, bulkController.getOne);
router.put('/bulk/:id', protect, bulkController.update);
router.delete('/bulk/:id', protect, bulkController.remove);

module.exports = router;