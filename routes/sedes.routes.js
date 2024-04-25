"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sedes_controller_1 = require("../controllers/sedes.controller");
const router = (0, express_1.Router)();
router.route('/')
    .get(sedes_controller_1.getSedes)
    .post(sedes_controller_1.setSede);
router.route('/buscarid').post(sedes_controller_1.getSede);
router.route('/codes').get(sedes_controller_1.getCodes);
router.route('/lotes').post(sedes_controller_1.getTodosCorelativo);
router.route('/:id')
    .get(sedes_controller_1.getSedeCorelativo)
    .put(sedes_controller_1.updateSede);
router.route('/estatus/:id').put(sedes_controller_1.updateEstatus);
router.route('/plantilla/:id').put(sedes_controller_1.updatePlantilla);
exports.default = router;
