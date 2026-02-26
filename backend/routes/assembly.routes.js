const express = require('express');
const router = express.Router();
const assemblyController = require('../controllers/assembly.controller');

router.get('/', assemblyController.getAll);
router.get('/finishing/:finishingId', assemblyController.getByFinishingId);
router.get('/finishing-items', assemblyController.getFinishingItems);
router.post('/', assemblyController.create);
router.put('/:id', assemblyController.update);
router.delete('/:id', assemblyController.delete);

module.exports = router;