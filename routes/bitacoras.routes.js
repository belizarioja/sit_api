"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bitacoras_controller_1 = require("../controllers/bitacoras.controller");
const router = (0, express_1.Router)();
router.route('/')
    .post(bitacoras_controller_1.setBitacora);
router.route('/listar')
    .post(bitacoras_controller_1.getBitacora);
router.route('/eventos')
    .get(bitacoras_controller_1.getEventos);
exports.default = router;
