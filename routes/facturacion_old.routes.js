"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturacion_controller_1 = require("../controllers/facturacion.controller");
const verifyTokenFactura_1 = require("../lib/verifyTokenFactura");
const router = (0, express_1.Router)();
router.route('/').post(verifyTokenFactura_1.verifyTokenFactura, facturacion_controller_1.setFacturacion);
exports.default = router;
