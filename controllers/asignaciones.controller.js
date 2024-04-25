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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updFechaProd = exports.getAsignacion = exports.setAsignacion = void 0;
const database_1 = require("../database");
const moment_1 = __importDefault(require("moment"));
function setAsignacion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req;
            const { cantidad, soportefactura, usuario, clave } = req.body;
            const sql = "select * from t_usuarios ";
            const where = " where usuario ='" + usuario + "' and clave = '" + clave + "' and idrol = 5 ";
            // console.log(sql + from + leftjoin + where);
            const resp = yield database_1.pool.query(sql + where);
            const cant = resp.rows.length;
            if (cant > 0) {
                /* const sqlupd = " UPDATE t_serviciosmasivos ";
                const set = " SET asignados = CASE WHEN asignados >= 0 THEN asignados + $1 ELSE $1 END where id = $2 ";
    
                await pool.query(sqlupd + set, [cantidad, id]);*/
                const idusuario = resp.rows[0].id;
                const fecha = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
                const sqltraza = "select * from t_tranzascorrelativo where idserviciosmasivo = $1 order by id desc limit 1";
                const resptraza = yield database_1.pool.query(sqltraza, [id]);
                let inicia = 1;
                let termina = cantidad;
                console.log(resptraza.rows);
                if (resptraza.rows.length > 0) {
                    const terminaactual = resptraza.rows[0].termina;
                    inicia = Number(terminaactual) + 1;
                    termina = Number(cantidad) + Number(terminaactual);
                }
                const insert = " insert into t_tranzascorrelativo (idserviciosmasivo, idusuario, cantidad, fecha, soportefactura, inicia, termina, estatus, utilizado) ";
                const values = " values ($1, $2, $3, $4, $5, $6, $7, 1, 0)";
                console.log(insert + values);
                console.log(id, idusuario, cantidad, fecha, soportefactura, inicia, termina);
                yield database_1.pool.query(insert + values, [id, idusuario, cantidad, fecha, soportefactura, inicia, termina]);
                // console.log(resp.rows[0].id)           
                const data = {
                    success: true,
                    data: {
                        message: "Asignacion de correlativos creado con éxito"
                    }
                };
                return res.status(200).json(data);
            }
            else {
                return res.status(202).json({
                    success: false,
                    error: {
                        message: 'Usuario no autorizado!'
                    }
                });
            }
        }
        catch (e) {
            return res.status(400).send('Error Asignacion de correlativos  ' + e);
        }
    });
}
exports.setAsignacion = setAsignacion;
function getAsignacion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { idusuario, idserviciosmasivo, desde, hasta } = req.body;
            let sql = "select a.id, a.idusuario, a.idserviciosmasivo, c.rif, c.razonsocial, b.usuario, b.nombre, a.soportefactura, a.fecha, a.cantidad, ";
            sql += " a.fechaproduccion, a.estatus, a.inicia, a.termina, d.identificador, d.corelativo, a.utilizado";
            const from = " from t_tranzascorrelativo a, t_usuarios b, t_serviciosmasivos c, t_serviciosdoc d ";
            let where = " where a.idusuario = b.id AND a.idserviciosmasivo = c.id AND a.idserviciosmasivo = d.idserviciosmasivo ";
            if (idusuario) {
                where += " AND a.idusuario = " + idusuario;
            }
            if (idserviciosmasivo) {
                where += " AND a.idserviciosmasivo = " + idserviciosmasivo;
            }
            if (desde && hasta) {
                where += " AND a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
            }
            const orderby = ' order by id asc';
            const resp = yield database_1.pool.query(sql + from + where + orderby);
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
exports.getAsignacion = getAsignacion;
function updFechaProd(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fechaproduccion } = req.body;
            const { id } = req.params;
            const sqlupd = " UPDATE t_tranzascorrelativo ";
            const set = " SET fechaproduccion = $1 where id = $2 ";
            yield database_1.pool.query(sqlupd + set, [fechaproduccion, id]);
            const data = {
                success: true,
                data: {
                    message: "Fecha Iniciio Asignacion actualizado con éxito"
                }
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Asignacion de correlativos  ' + e);
        }
    });
}
exports.updFechaProd = updFechaProd;
