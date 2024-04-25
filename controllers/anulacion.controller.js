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
exports.setAnulacion = void 0;
const moment_1 = __importDefault(require("moment"));
const facturacion_controller_1 = require("./facturacion.controller");
// DB
const database_1 = require("../database");
function setAnulacion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req;
            const { numerodocumento, observacion } = req.body;
            if (numerodocumento.length < 11) {
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 2,
                        message: 'Valor de NUMERO DOCUMENTO NO VALIDO!'
                    }
                });
            }
            const fechaanulado = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            const sqlupd = " update t_registros set estatus = 2,  observacion = $3, fechaanulado = $4 ";
            const whereupd = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
            // console.log(sqlupd + whereupd)
            const respupd = yield database_1.pool.query(sqlupd + whereupd, [id, numerodocumento, observacion, fechaanulado]);
            if (respupd.rowCount === 1) {
                yield sendFacturaEmail(res, id, numerodocumento);
                /* const data = {
                    success: true,
                    error: null,
                    data: {
                        message: 'Documento ANULADO con éxito!'
                    }
                };
                return res.status(200).json(data); */
            }
            else {
                const data = {
                    success: false,
                    data: null,
                    error: {
                        code: 3,
                        message: 'NUMERO DOCUMENTO no corresponde al tipo ni al cliente emisor!'
                    }
                };
                return res.status(202).json(data);
            }
        }
        catch (e) {
            return res.status(400).send('Error Anulando Documento ' + e);
        }
    });
}
exports.setAnulacion = setAnulacion;
function sendFacturaEmail(res, idserviciosmasivo, numerodocumento) {
    return __awaiter(this, void 0, void 0, function* () {
        // try {
        let sql = "select a.id, a.idserviciosmasivo, c.razonsocial, c.rif, c.email, a.emailcliente, c.direccion, c.telefono, a.numerodocumento, a.cedulacliente, a.nombrecliente, a.direccioncliente, a.telefonocliente, a.idtipodocumento, b.tipodocumento, a.relacionado, a.impuestoigtf, a.baseigtf, a.fecha, ";
        sql += " a.trackingid, a.fecha, d.abrev, a.idtipocedulacliente, a.numerointerno, a.piedepagina, c.enviocorreo, a.tasacambio, a.observacion, a.estatus  ";
        const from = " from t_registros a, t_tipodocumentos b, t_serviciosmasivos c , t_tipocedulacliente d ";
        const where = " where a.idtipodocumento = b.id and a.idserviciosmasivo = c.id and a.idtipocedulacliente = d.id and a.numerodocumento = $1 and c.id = $2";
        const respdoc = yield database_1.pool.query(sql + from + where, [numerodocumento, idserviciosmasivo]);
        // console.log(respdoc.rows[0])
        const idregistro = respdoc.rows[0].id;
        const rif = respdoc.rows[0].rif;
        const razonsocial = respdoc.rows[0].razonsocial;
        const emailcliente = respdoc.rows[0].emailcliente;
        const nombrecliente = respdoc.rows[0].nombrecliente;
        const direccion = respdoc.rows[0].direccion;
        const cedulacliente = respdoc.rows[0].cedulacliente;
        const idtipocedulacliente = respdoc.rows[0].idtipocedulacliente;
        const idtipodocumento = respdoc.rows[0].idtipodocumento;
        const telefonocliente = respdoc.rows[0].telefonocliente || '';
        const direccioncliente = respdoc.rows[0].direccioncliente || '';
        const impuestoigtf = respdoc.rows[0].impuestoigtf;
        const baseigtf = respdoc.rows[0].baseigtf;
        const numerointerno = respdoc.rows[0].numerointerno;
        const piedepagina = respdoc.rows[0].piedepagina;
        const tasacambio = respdoc.rows[0].tasacambio;
        const observacion = respdoc.rows[0].observacion || '';
        const estatus = respdoc.rows[0].estatus;
        const sendmail = 1;
        const fechaenvio = (0, moment_1.default)(respdoc.rows[0].fecha).format('YYYY-MM-DD hh:mm:ss');
        // console.log('respdoc.rows[0].fecha, fechaenvio')
        // console.log(respdoc.rows[0].fecha, fechaenvio)
        let numeroafectado = respdoc.rows[0].relacionado.length > 0 ? respdoc.rows[0].relacionado : '';
        let fechaafectado = '';
        let idtipoafectado = '';
        if (idtipodocumento === '2' || idtipodocumento === '3') {
            const sqlrel = " SELECT * FROM t_registros ";
            const whererel = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
            // console.log(sqlupd + whereupd)
            const resprel = yield database_1.pool.query(sqlrel + whererel, [idserviciosmasivo, respdoc.rows[0].relacionado]);
            if (resprel.rows.length > 0) {
                numeroafectado = resprel.rows[0].numerointerno.length > 0 ? resprel.rows[0].numerointerno : numeroafectado;
                fechaafectado = resprel.rows[0].fecha;
                idtipoafectado = resprel.rows[0].idtipodocumento;
            }
        }
        const sqldet = "select id, codigo, descripcion, precio, cantidad, tasa, monto, exento, descuento, comentario ";
        const fromdet = " from t_registro_detalles ";
        const wheredet = " where idregistro = " + idregistro;
        // console.log(sql + from + where)
        const respdet = yield database_1.pool.query(sqldet + fromdet + wheredet);
        // console.log(respdet.rows)
        const cuerpofactura = respdet.rows;
        const sqlformas = "select forma, valor ";
        const fromformas = " from t_formasdepago ";
        const whereformas = " where idregistro = " + idregistro;
        // console.log(sql + from + where)
        const respformas = yield database_1.pool.query(sqlformas + fromformas + whereformas);
        // console.log(respdet.rows)
        const formasdepago = respformas.rows;
        console.log('va a Crear PDF Anulado');
        yield (0, facturacion_controller_1.crearFactura)(res, rif, razonsocial, direccion, numerodocumento, nombrecliente, cuerpofactura, emailcliente, cedulacliente, idtipocedulacliente, telefonocliente, direccioncliente, numerointerno, idserviciosmasivo, emailcliente, idtipodocumento, numeroafectado, impuestoigtf, fechaafectado, idtipoafectado, piedepagina, baseigtf, fechaenvio, formasdepago, sendmail, tasacambio, observacion, estatus)
            .then(() => {
            const data = {
                success: true,
                error: null,
                data: {
                    mensaje: 'Correo enviado con éxito'
                }
            };
            return res.status(200).json(data);
        });
        /*}
        catch (e) {
            return res.status(400).send('Error Creando correlativo y cuerpo de factura ' + e);
        }*/
    });
}
