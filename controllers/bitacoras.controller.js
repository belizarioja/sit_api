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
exports.getEventos = exports.setBitacora = exports.getBitacora = void 0;
// DB
const database_1 = require("../database");
function getBitacora(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { idusuario, idevento, desde, hasta } = req.body;
            const sql = "select a.idusuario, a.idevento, c.evento, b.usuario, b.nombre, b.idrol, a.ip, a.fecha, a.observacion ";
            const from = " from t_bitacoras a, t_usuarios b, t_eventos c ";
            let where = " where a.idusuario = b.id AND a.idevento = c.id ";
            if (idusuario) {
                where += " AND a.idusuario = " + idusuario;
            }
            if (idevento) {
                where += " AND a.idevento = " + idevento;
            }
            if (desde && hasta) {
                where += " AND a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
            }
            const resp = yield database_1.pool.query(sql + from + where);
            const cant = resp.rows.length;
            const data = {
                success: true,
                data: resp.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Bitacoras masivos ' + e);
        }
    });
}
exports.getBitacora = getBitacora;
function setBitacora(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { idusuario, idevento, ip, observacion, fecha } = req.body;
            const insert = "insert into t_bitacoras (idusuario, idevento, fecha, ip, observacion) ";
            const values = " values ($1, $2, $3, $4, $5)";
            yield database_1.pool.query(insert + values, [idusuario, idevento, fecha, ip, observacion]);
            const data = {
                success: true,
                resp: {
                    message: "Bitácora creada con éxito"
                }
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error creando bitácora ' + e);
        }
    });
}
exports.setBitacora = setBitacora;
function getEventos(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sql = "select * from t_eventos ";
            const resp = yield database_1.pool.query(sql);
            const cant = resp.rows.length;
            const data = {
                success: true,
                data: resp.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Eventos de Bitáqcora ' + e);
        }
    });
}
exports.getEventos = getEventos;
