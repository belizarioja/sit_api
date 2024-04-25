"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const anulacion_controller_1 = require("../controllers/anulacion.controller");
const verifyTokenFactura_1 = require("../lib/verifyTokenFactura");
const router = (0, express_1.Router)();
router.route('/').post(verifyTokenFactura_1.verifyTokenFactura, anulacion_controller_1.setAnulacion);
exports.default = router;
