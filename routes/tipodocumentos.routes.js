"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tipodocumentos_controller_1 = require("../controllers/tipodocumentos.controller");
const router = (0, express_1.Router)();
router.route('/')
    .get(tipodocumentos_controller_1.getTipoDocumento);
router.route('/tipocedula')
    .get(tipodocumentos_controller_1.getTipoCedula);
exports.default = router;
