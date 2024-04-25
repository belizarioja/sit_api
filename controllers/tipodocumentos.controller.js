"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTipoCedula = exports.getTipoDocumento = void 0;
// DB
const database_1 = require("../database");
function getTipoDocumento(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sql = "select * ";
            const from = " from t_tipodocumentos ";
            const resp = yield database_1.pool.query(sql + from);
            const cant = resp.rows.length;
            const data = {
                success: true,
                data: resp.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Tipos de Documentos ' + e);
        }
    });
}
exports.getTipoDocumento = getTipoDocumento;
function getTipoCedula(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sql = "select * ";
            const from = " from t_tipocedulacliente ";
            const resp = yield database_1.pool.query(sql + from);
            const cant = resp.rows.length;
            const data = {
                success: true,
                data: resp.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Tipos de Identificación ' + e);
        }
    });
}
exports.getTipoCedula = getTipoCedula;
