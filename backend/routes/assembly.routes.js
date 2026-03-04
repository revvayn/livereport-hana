const express = require('express');
const router = express.Router();
const assemblyController = require('../controllers/assembly.controller'); // Pastikan nama file benar


// === GROUP 1: ASSEMBLY PANNEL
router.get('/pannel', assemblyController.getAllPannel); 
router.post('/pannel', assemblyController.createPannel);
router.put('/pannel/:id', assemblyController.updatePannel);
router.delete('/pannel/:id', assemblyController.deletePannel);

// === GROUP 2: ASSEMBLY CORE
router.get('/core', assemblyController.getAllCore); 
router.post('/core', assemblyController.createCore);
router.put('/core/:id', assemblyController.updateCore);
router.delete('/core/:id', assemblyController.deleteCore);

// === GROUP 3: LOGIKA GENERATE ===
router.post('/generate/:demandId', assemblyController.generateAssembly);
router.get('/demand/:demandId/items', assemblyController.getItemsByDemandId);
router.put('/update-schedule', assemblyController.updateAssemblySchedule);

module.exports = router;