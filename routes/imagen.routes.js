"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imagen_controller_1 = require("../controllers/imagen.controller");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: __dirname + '/images/' });
const router = (0, express_1.Router)();
router.route('/:img').get(imagen_controller_1.getImagen);
router.route('/uploadimg/:rif').post(imagen_controller_1.setImagen, upload.array("files"));
router.route('/codeqr/:rif/:anniomes/:filecodeqr').get(imagen_controller_1.getImagenCodeQr);
exports.default = router;
