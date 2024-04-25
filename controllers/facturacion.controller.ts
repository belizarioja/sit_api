import { Request, Response } from 'express';
import moment from 'moment';
import nodemailer from 'nodemailer';
import fs from 'fs';
import pdf from 'html-pdf';
import path from 'path';
import QRCode  from 'qrcode';

import { pool } from '../database'

const USERMAIL = process.env.USERMAIL
const PASSMAIL = process.env.PASSMAIL
const SERVERFILE = process.env.SERVERFILE
const FILEPDF = process.env.FILEPDF
const SERVERIMG = process.env.SERVERIMG
const IMGPDF = process.env.IMGPDF
const HOSTSMTP = process.env.HOSTSMTP
const AMBIENTE = process.env.AMBIENTE
const URLFRN = process.env.URLFRN

let  EMAILBCC = ''
let URLPUBLICIDADEMAIL = ''
let ISPUBLICIDAD = '0'

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
process.env['OPENSSL_CONF'] = '/dev/null';

export async function setFacturacion (req: Request, res: Response): Promise<Response | void> {
    // try {
        
        const { id, rif, razonsocial, email, direccion, validarinterno } = req;
        const { rifcedulacliente, nombrecliente, telefonocliente, direccioncliente, idtipodocumento, trackingid, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, tasacambio } = req.body;
        const { emailcliente, subtotal, total, exento, tasar, baser, impuestor, relacionado, idtipocedulacliente, cuerpofactura, sendmail, sucursal, numerointerno, formasdepago, observacion } = req.body;
        const { tasaa, basea, impuestoa } = req.body;
        // console.log(req)
        // console.log('baseigtf, impuestog')
        // console.log(baseigtf, impuestog)
        await pool.query('BEGIN')
        const _tasacambio = tasacambio || 0
      
        const lotepiedepagina = await obtenerLote(res, id)
        if(lotepiedepagina === '0') {
            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 12,
                    message: 'Mo tiene disponibilidad de ASIGNADOS!'
                }
            });
        } 
        if(formasdepago.length === 0) {
            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 13,
                    message: 'Debe incluir al menos una forma de PAGO!'
                }
            });
        } 
        const piedepagina = 'Este documento se emite bajo la providencia administrativa Nro. SNAT/2014/0032 de fecha 31/07/2014.<br>Imprenta SMART INNOVACIONES TECNOLOGICAS, C.A. RIF J-50375790-6, Autorizada según Providencia Administrativa Nro. SENIAT/INTI/011 de fecha 10/11/2023.<br>' + lotepiedepagina
        // console.log('rifcedulacliente')
        // console.log(rifcedulacliente)
        if(rifcedulacliente.length === 0) {

            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de RIF CLIENTE no válido!'
                }
            });
        }
        if(nombrecliente.length === 0) {

            await pool.query('ROLLBACK')

            return res.status(202).json({
                success: false,            
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de NOMBRE CLIENTE no válido!'
                }
            });
        }
        // console.log(Number(baseg) * Number(tasag) / 100, Number(impuestog))
        let totalimp = 0
        let totalbase = 0
        // console.log( (Number(baseg) * (Number(tasag) / 100)), Number(impuestog))
        // console.log( (Number(baseg) * (Number(tasag) / 100)).toFixed(2), Number(impuestog).toFixed(2))
        if(Number(baseg) > 0 && Number(tasag) > 0) {
            if((Number(baseg) * (Number(tasag) / 100)).toFixed(2) !== Number(impuestog).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO IVA ' + tasag + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestog)
                totalbase += Number(baseg)
            }
        }

        if(Number(baser) > 0 && Number(tasar) > 0) {
            if((Number(baser) * (Number(tasar) / 100)).toFixed(2) !== Number(impuestor).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO REDUCIDO ' + tasar + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestor)
                totalbase += Number(baser)
            }
        }
        if(Number(basea) > 0 && Number(tasaa) > 0) {
            if((Number(basea) * (Number(tasaa) / 100)).toFixed(2) !== Number(impuestoa).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO AL LUJO ' + tasar + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestoa)
                totalbase += Number(basea)
            }
        }
        if(Number(baseigtf) > 0 && Number(tasaigtf) > 0) {
            if((Number(baseigtf) * (Number(tasaigtf) / 100)).toFixed(2) !== Number(impuestoigtf).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO IGTF ' + tasaigtf + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestoigtf)
                // console.log(totalimp, Number(impuestoigtf))

                // totalbase += Number(baseigtf)
            }
        }
        if(Number(exento) > 0) {
            totalbase += Number(exento)
        }
        if(Number(subtotal) > 0) {
            // console.log(Number(totalbase), Number(subtotal))
            if(Number(totalbase).toFixed(2) !== Number(subtotal).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de SUBTOTAL MAL CALCULADO!'
                    }
                });
            } 
            // console.log(Number(subtotal), Number(totalimp), Number(total))
            // console.log((Number(subtotal) + Number(totalimp)).toFixed(2), Number(total).toFixed(2))
            if((Number(subtotal) + Number(totalimp)).toFixed(2) !== Number(total).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de TOTAL MAL CALCULADO!'
                    }
                });
            } 
        } else {

            await pool.query('ROLLBACK')

            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 4,
                    message: 'Debe agregar valor de SUBTOTAL!'
                }
            });

        }
        // console.log('idtipodocumento, relacionado')
        // console.log(idtipodocumento, relacionado)
        if((idtipodocumento === 2 || idtipodocumento === 3) && !relacionado) {

            await pool.query('ROLLBACK')

            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 5,
                    message: 'Campo RELACIONADO es requerido!'
                }
            });
        }
        let numeroafectado = '';
        let fechaafectado = '';
        let idtipoafectado = '';
        if(idtipodocumento === 2 || idtipodocumento === 3) {

            const sqlrel = " SELECT * FROM t_registros ";
            const whererel = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
            // console.log(sqlupd + whereupd)

            const resprel = await pool.query(sqlrel + whererel, [id, relacionado])           

            if(resprel.rows.length === 0 ) {
            
                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 11,
                        message: 'NUMERO DOCUMENTO no corresponde al cliente emisor!'
                    }
                });
            } else {
                // console.log('resprel.rows[0]')
                // console.log(resprel.rows[0])
                numeroafectado = resprel.rows[0].numerointerno.length > 0 ? resprel.rows[0].numerointerno : relacionado
                fechaafectado = resprel.rows[0].fecha
                idtipoafectado = resprel.rows[0].idtipodocumento
                
            }
        }
        if (cuerpofactura.length === 0) {

            await pool.query('ROLLBACK')

            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 10,
                    message: 'Cuerpo de DETALLE FACTURA es requerido!'
                }
            });
        }
      
        const sql = " UPDATE t_serviciosdoc ";
        let set = " SET identificador = CASE WHEN corelativo = 99999999 THEN identificador + 1 ELSE identificador END, ";
        set += " corelativo = CASE WHEN corelativo = 99999999 THEN 1 ELSE corelativo + 1 END ";
        const where = " where idserviciosmasivo = $1 RETURNING idserviciosmasivo, identificador, corelativo ";
      
        // console.log(sql + set + where);
        const resp = await pool.query(sql + set + where, [id]);

        let identificador = Number(resp.rows[0].identificador)
        let corelativo = Number(resp.rows[0].corelativo)
       
        // AQUI VALIDAR NU8MERO INTERNO
       
        if(validarinterno > 0) {
            // console.log('Aqui función para validar numero interno 1:', numerointerno)
            if(numerointerno?.length === 0) {
                // console.log('Aqui función para validar numero interno 2:', numerointerno)
                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 7,
                        message: 'Falta valor del NÚMERO INTERNO!'
                    }
                });
            } else {

                const sqlinterno = "SELECT * FROM t_registros";
                const whareinterno = " WHERE numerointerno = $1 AND idtipodocumento = $2 AND idserviciosmasivo = $3  ";
                const respinterno = await pool.query(sqlinterno + whareinterno, [numerointerno, idtipodocumento, id]); 
              
                if(respinterno.rows.length > 0) {
                    await pool.query('ROLLBACK')

                    return res.status(202).json({
                        success: false,
                        data: null,
                        error: {
                            code: 8,
                            message: 'NÚMERO INTERNO para este TIPO DE DOCUMENTO, ya existe!'
                        }
                    });
                } else {
                    // console.log('Aqui función para validar numero interno 3 :', numerointerno)                  
                    const respinterno2 = await obtenerNumInterno(idtipodocumento, id)
                     if( Number(respinterno2) > 0 && (Number(respinterno2) + 1 !== Number(numerointerno))) {
              
                        await pool.query('ROLLBACK')

                        return res.status(202).json({
                            success: false,
                            data: null,
                            error: {
                                code: 9,
                                message: 'NÚMERO INTERNO no corresponde numeración esperada! Actual:' + respinterno2
                            }
                        });

                    }

                }

            }
            // console.log('Aqui función para validar numero interno :', numerointerno)
        }
     
        const numerocompleto =  identificador.toString().padStart(2, '0') + '-' + corelativo.toString().padStart(8, '0')
        const relacionadoBD = relacionado || ''
        const observacionBD = observacion || ''
        const fechaenvio = moment().format('YYYY-MM-DD HH:mm:ss')
        const insert = 'INSERT INTO t_registros (numerodocumento, idtipodocumento, idserviciosmasivo, trackingid, cedulacliente, nombrecliente, subtotal, total, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, fecha, exento, tasar, baser, impuestor, estatus, relacionado, idtipocedulacliente, emailcliente, sucursal, numerointerno, piedepagina, direccioncliente, telefonocliente, secuencial, tasacambio, observacion ) '
        const values = ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 1, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING id '
        const respReg = await pool.query(insert + values, [numerocompleto, idtipodocumento, id, trackingid, rifcedulacliente, nombrecliente, subtotal, total, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, fechaenvio, exento, tasar, baser, impuestor, relacionadoBD, idtipocedulacliente, emailcliente, sucursal, numerointerno, piedepagina, direccioncliente, telefonocliente, Number(numerointerno), _tasacambio, observacionBD])
        // console.log(respReg.rows[0].id)
        const idRegistro = respReg.rows[0].id
        for(const ind in cuerpofactura) {
            const item = cuerpofactura[ind]
           
            console.log(Math.round((item.precio * item.cantidad - item.descuento) * 100) / 100, Math.round(item.monto * 100) / 100)
            if(Math.round((item.precio * item.cantidad - item.descuento) * 100) / 100 !== Math.round(item.monto * 100) / 100) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor del MONTO DE UN REGISTRO, MAL CALCULADO!'
                    }
                });
            } 

            const insertDet = 'INSERT INTO t_registro_detalles (idregistro, codigo, descripcion, precio, cantidad, tasa, monto, exento, comentario, descuento ) '
            const valuesDet = ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) '
            await pool.query(insertDet + valuesDet, [idRegistro, item.codigo, item.descripcion, item.precio, item.cantidad, item.tasa, item.monto, item.exento, item.comentario, item.descuento])
            // console.log(insertDet + valuesDet)
        }
        
        for(const ind in formasdepago) {
            const item2 = formasdepago[ind]
           
            // console.log((Number(item.precio) * Number(item.cantidad) + Number(item.impuesto)).toFixed(2), Number(item.monto).toFixed(2))
            if(item2.forma.length === 0 ){

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 14,
                        message: 'Informacion de forma de pago NO VALIDA!'
                    }
                });
            } 

            const insertForma = 'INSERT INTO t_formasdepago (idregistro, forma, valor ) '
            const valuesForma = ' VALUES ($1, $2, $3) '
            await pool.query(insertForma + valuesForma, [idRegistro, item2.forma, item2.valor])
            // console.log(insertDet + valuesDet)
        }
       
        await pool.query('COMMIT')
       
        if (cuerpofactura.length > 0) {
            console.log('va a Crear pdf correo')
            await crearFactura(res, rif, razonsocial, direccion, numerocompleto, nombrecliente, cuerpofactura, emailcliente, rifcedulacliente, idtipocedulacliente, telefonocliente, direccioncliente, numerointerno, id, email, idtipodocumento, numeroafectado, impuestoigtf, fechaafectado, idtipoafectado, piedepagina, baseigtf, fechaenvio, formasdepago, sendmail, _tasacambio, observacionBD, 1)
            
        } else {
            console.log('Sin Factura pdf correo')
        }
        const data = {
            success: true,
            error: null,
            data: {
                numerodocumento:  numerocompleto,
                identificador: identificador.toString().padStart(2, '0'),
                corelativo: corelativo.toString().padStart(8, '0'),
                datatime: moment().format('YYYY-MM-DD HH:mm:ss'),
                fecha: moment().format('YYYYMMDD'),
                hora: moment().format('HH:mm:ss')
            }           
        };
        return res.status(200).json(data); 

    /* }
    catch (e) {
        return res.status(400).send('Error Creando correlativo o cuerpo de factura ' + e);
    } */
}
async function obtenerNumInterno(idtipodocumento: any, idserviciosmasivo: any) {
    const sql = "SELECT MAX(secuencial) FROM t_registros";
    const where = " WHERE idtipodocumento = " + idtipodocumento + " AND idserviciosmasivo = " + idserviciosmasivo;
    // console.log(sqlinterno2 + whareinterno2)
    const resp = await pool.query(sql + where); 
    return resp.rows[0].max;    
}
export async function getNumerointerno (req: Request, res: Response): Promise<Response | void> {
    try {
        
        const { id } = req;
        const { idtipodocumento } = req.body;
        const resp = await obtenerNumInterno(idtipodocumento, id) 
        const numeronext = Number(resp) + 1
        const data = {
            success: true,
            error: null,
            data: {
                numerointerno:  numeronext.toString().padStart(8, '0')
            }           
        };
        return res.status(200).json(data); 
    }catch (e) {
        return res.status(400).send('Error Obteniendo numero Interno ' + e);
    }
}

export async function crearFactura (res: Response,_rif: any, _razonsocial: any, _direccion: any, _pnumero: any, _nombrecliente: any, productos: any, _emailcliente: any, _rifcliente: any, _idtipocedula: any, _telefonocliente: any, _direccioncliente: any, _numerointerno: any, _id: any, _emailemisor: any, _idtipodoc: any, _numeroafectado: any, _impuestoigtf: any, _fechaafectado: any, _idtipoafectado: any, _piedepagina: any, _baseigtf: any, _fechaenvio: any, _formasdepago: any, _sendmail: any, _tasacambio: any, _observacion: any, _estatus: any) {
    try {
        const sqlsede = "SELECT a.email, a.telefono, a.sitioweb, a.banner, b.colorfondo1, b.colorfuente1, b.colorfondo2, b.colorfuente2, a.textoemail, b.banner, a.emailbcc, a.enviocorreo, a.publicidad  ";
        const fromsede = " FROM t_serviciosmasivos a ";
        let leftjoin = " left join t_plantillacorreos b ON a.banner = b.banner and a.id = b.idserviciosmasivo  ";
        const wheresede = " WHERE a.id = $1";
        const respsede = await pool.query(sqlsede + fromsede + leftjoin + wheresede, [_id]); 
        const enviocorreo = respsede.rows[0].enviocorreo || 0
        const emailbcc = respsede.rows[0].emailbcc || ''
        const sitioweb = respsede.rows[0].sitioweb
        const colorfondo1 = respsede.rows[0].colorfondo1 || '#d4e5ff'
        const colorfuente1 = respsede.rows[0].colorfuente1 || '#000000'
        const colorfondo2 = respsede.rows[0].colorfondo2 || '#edfbf4'
        const colorfuente2 = respsede.rows[0].colorfuente2 || '#666666'
        const textoemail = respsede.rows[0].textoemail || '0'
        const banner = respsede.rows[0].banner || '1'
        const _telefono = respsede.rows[0].telefono
        ISPUBLICIDAD = respsede.rows[0].publicidad || '0'
        let URLPUBLICIDAD = ''
        let publicidad = ''
        let csstabla = 'sinpublicidad'
        console.log('ISPUBLICIDAD')
        console.log(ISPUBLICIDAD)
        if (ISPUBLICIDAD === '1') {
            csstabla = 'conpublicidad'
            URLPUBLICIDAD = IMGPDF+_rif + "_publi01.png"
            URLPUBLICIDADEMAIL = SERVERIMG+_rif + "_publi01.png"
            publicidad = `<tr>
                    <td colspan="2" class="text-center" style="padding-top:5px;">
                        <img class="img-fluid" src="${URLPUBLICIDAD}" alt="Publicidad" width="100%" height="80" >
                    </td>
                </tr>`
        }

        // const ubicacionPlantilla = require.resolve("../plantillas/factura.html");
        const ubicacionPlantilla = require.resolve("../plantillas/" + _rif + ".html");
        let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')
        contenidoHtml = contenidoHtml.replace("{{csstabla}}", csstabla)        
        const annioenvio = moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("YYYY")
        const mesenvio = moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("MM")
        const diaenvio = moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD")
        const infoQR = URLFRN + '/#/viewqrinvoice/' + _rif + 'SM' + _pnumero

        await crearCodeQR(infoQR, _rif, annioenvio, mesenvio, _pnumero) 

        const formateador = new Intl.NumberFormat("eu");
        // Generar el HTML de la tabla
        let tabla = "";
        let subtotal = 0;
        let exentos = 0;
        // let descuento = 0;
        // let impuestos = 0;
        let _impuestog = 0;
        let _impuestor = 0;
        let _impuestoa = 0;
        
        for (const producto of productos) {
            // Aumentar el total
            const totalProducto = (producto.cantidad * producto.precio) - producto.descuento;
            subtotal += totalProducto;
            // descuento += producto.descuento
            if (producto.exento === true || producto.exento === 'true') { 
                exentos += totalProducto
            } else {
                if (Number(producto.tasa) === 16) {
                    _impuestog += totalProducto * producto.tasa / 100
                }
                if (Number(producto.tasa) === 8) {
                    _impuestor += totalProducto * producto.tasa / 100
                }
                if (Number(producto.tasa) === 31) {
                    _impuestoa += totalProducto * producto.tasa / 100
                }
                // baseiva += totalProducto;

            }
            let productoitem = `<span>${producto.descripcion}</span>`
           
            if(producto.comentario.length > 0) {
                productoitem += `<br><span>${producto.comentario}</span>`
            }
            // Y concatenar los productos
            
            tabla += `<tr style="height: 25px;">
            <td style="vertical-align: baseline;font-size: 8px;padding: 3px;">${producto.codigo}</td>
            <td style="vertical-align: baseline;font-size: 8px;border-left: 1px dashed;padding: 3px;">${productoitem}</td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;">${producto.cantidad}</td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;">${completarDecimales(Number(producto.precio))}</td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;">${producto.tasa}%</td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;">${completarDecimales(Number(producto.descuento))}</td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;">${completarDecimales(Number(producto.monto))}</td>
        </tr>`;
            
        }
        const tipodoc = Number(_idtipodoc) === 1 ? 'Factura' : Number(_idtipodoc) === 2 ? 'Nota de débito' : Number(_idtipodoc) === 3 ? 'Nota de crédito' : Number(_idtipodoc) === 4 ? 'Orden de entrega' : 'Guía de despacho'

        // const coletillaigtf = "En caso de " + tipodoc + " emitida en divisas según articulo Nro. 25 del Decreto con rango valor y fuerza de ley que establece el IVA modificado en GACETA OFICIAL Nro. 6152 de fecha 18/11/2014. "
        // const coletillabcv = "Artículo 25: "
        // const coletillabcv2 = '"En los casos en que la base imponible de la venta o prestación de servicios estuviese expresada en moneda extranjera se establecerá la equivalencia en moneda nacional al tipo de cambio corriente en el mercado del día en que ocurra el hecho imponible salvo que este ocurra en un día no hábil para el sector financiero en cuyo caso se aplicará el vigente en el día hábil inmediatamente siguiente el de la operación."'
        // let coletilla = coletillaigtf + coletillabcv + coletillabcv2

        // COLETILLA
        const coletilla1 = "En caso que la " + tipodoc + " se genere con Divisas, la misma estará sujeta al cobro adicional del 3% de Impuesto Grandes Transacciones Financieras de conformidad a lo establecido en la Providencia Administrativa SNAT/2022/000013, publicada en Gaceta Oficial 42.339 de fecha 17/03/2022."
        const coletilla2 = " El equivalente en Bs., a tasa de cambio Oficial BCV a Bs/USD de " +_tasacambio + " del día " + moment().format("DD/MM/YYYY") + ", según lo establecido en la Gaceta Oficial Nro. 6405 del convenio cambiario Nro. 1 de fecha 07/09/2018, expresándose en Bolívares, para dar cumplimiento a articulo Nro. 25 de la Ley de Impuesto al Valor Agregado y el articulo Nro. 38 de su respectivo reglamento."
        let coletilla = coletilla1 + coletilla2
        
        tabla += `<tr style="height: 25px;">
            <td style="vertical-align: baseline;font-size: 8px;padding: 3px;"></td>
            <td style="vertical-align: baseline;font-size: 8px;border-left: 1px dashed;padding: 3px;">${_observacion}</td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;"></td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;"></td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;"></td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;"></td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 3px;font-size: 8px;"></td>
            </tr>`;
        tabla += `<tr style="height: auto;">
            <td style="border-bottom: 2px solid #65778D;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 2px solid #65778D;border-left: 1px dashed;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 2px solid #65778D;border-left: 1px dashed;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 2px solid #65778D;border-left: 1px dashed;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 2px solid #65778D;border-left: 1px dashed;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 2px solid #65778D;border-left: 1px dashed;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 2px solid #65778D;border-left: 1px dashed;font-size: 8px;line-height: 1;">&nbsp;</td>
        </tr>`;

        let trbaseg = `<tr>
            <td class=" text-right" style="font-size: 8px;">IVA 16% Bs.:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestog))}</td>
        </tr>`
        let trbaser = `<tr>
            <td class=" text-right" style="font-size: 8px;">Reducido 8% Bs.:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestor))}</td>
        </tr>`
        let trbasea = `<tr>
            <td class=" text-right" style="font-size: 8px;">Al lujo 31% Bs.:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoa))}</td>
        </tr>`
       
        
        let _impuestoigtfusd = 0
        let _baseigtfusd = 0
        let _baseivausd = 0
        
        _baseigtfusd = Number(_baseigtf)/Number(_tasacambio)

        let trbaseigtf = `<tr>
            <td class=" text-right" style="font-size: 8px;">IGTF 3%($${completarDecimales(Number(_baseigtfusd))}) Bs.:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoigtf))}</td>
        </tr>`

        /* if (_tasacambio > 0) {
            _impuestoigtfusd = Number(_impuestoigtf)/Number(_tasacambio)
            _baseigtfusd = Number(_baseigtf)/Number(_tasacambio)
            _baseivausd = Number(baseiva)/Number(_tasacambio)
           
            trbaseigtf = `<tr>
            <td class="text-right" style="font-size: 8px;">IGTF 3%(Sobre ${completarDecimales(Number(_baseigtfusd))}) $:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoigtfusd))}</td>
            <td class="text-right" style="font-size: 8px;">IGTF 3%(Sobre ${completarDecimales(Number(_baseigtf))}) Bs.:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoigtf))}</td>
            </tr>` 
                   
            contenidoHtml = contenidoHtml.replace("{{tasatotales}}", _tasacambio.toString().padEnd(9, '0'));           

        } */
        // const subtotalConDescuento = subtotal - descuento;        
        const subtotalConDescuento = subtotal;
        // console.log(subtotalConDescuento, impuestos, _impuestoigtf)
        const total = subtotalConDescuento + _impuestog + _impuestor + _impuestoa + Number(_impuestoigtf);
        // console.log(total)
        // const fecha = moment().format('DD/MM/YYYY hh:mm:ss a');
        // Remplazar el valor {{tablaProductos}} por el verdadero valor
        contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", tabla);

        let formasdepago = "";
        for (const forma of _formasdepago) {
            formasdepago += `${forma.forma} Bs.: ${completarDecimales(Number(forma.valor))}<br>`            
        }

        const emailpdf =_emailcliente.split('|').join(', ')

        const tipocedula = Number(_idtipocedula) === 1 ? 'CI' : Number(_idtipocedula) === 2 ? 'Pasaporte' : 'RIF'
        const tipoafectado = Number(_idtipoafectado) === 1 ? 'Factura' : Number(_idtipoafectado) === 2 ? 'Nota de débito' : Number(_idtipoafectado) === 3 ? 'Nota de crédito' : Number(_idtipodoc) === 4 ? 'Orden de entrega' : 'Guía de despacho'
        const docafectado = (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) ? 'Aplica a ' + tipoafectado + ' ' +  _numeroafectado : ''
        const numeroafectado = (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) ?  'del ' + moment(_fechaafectado).format('DD/MM/YYYY hh:mm:ss a') : ''
        console.log("AMBIENTE")
        console.log(AMBIENTE)
        
        if(Number(_estatus) === 2) { // Si es anulado
            const ANULADO = FILEPDF + 'utils/anulado.gif'
            const fondoanulado= `<img src="${ANULADO}" style="position: absolute; left:0; top:0; z-index:-10; width: 100%; height: 100%; "/>`
            contenidoHtml = contenidoHtml.replace("{{fondomarca}}", fondoanulado);
        } else {
            if(AMBIENTE === 'local' || AMBIENTE === 'test') { // Si NO es Produccion
                const BORRADOR = FILEPDF + 'utils/borrador.png'
                const fondoborrador = `<img src="${BORRADOR}" style="position: absolute; left:0; top:0; z-index:-10; width: 100%; height: 100%; "/>`
                contenidoHtml = contenidoHtml.replace("{{fondomarca}}", fondoborrador);
            } else {
                contenidoHtml = contenidoHtml.replace("{{fondomarca}}", '');
            }
        }
        let afectado = ''
        if (docafectado.length > 0){
            afectado = `<tr>
                        <td class="text-right afectado" style="font-size: 7px;">${docafectado}</td>
                        <td class="text-left afectado" style="font-size: 7px;">&nbsp;${numeroafectado}</td>
                    </tr>`
        }
        const folderPathQr = IMGPDF + 'codeqr/' + _rif + '/' + annioenvio + '-' + mesenvio + '/qrcode_' + _rif + _pnumero + '.png';
        contenidoHtml = contenidoHtml.replace("{{codeqr}}", folderPathQr);
        contenidoHtml = contenidoHtml.replace("{{logo}}", IMGPDF+_rif + ".png");
        contenidoHtml = contenidoHtml.replace("{{direccion}}", _direccion);
        contenidoHtml = contenidoHtml.replace("{{razonsocial}}", _razonsocial);
        contenidoHtml = contenidoHtml.replace("{{rif}}", _rif);
        contenidoHtml = contenidoHtml.replace("{{telefono}}", _telefono);
        contenidoHtml = contenidoHtml.replace("{{numerodocumento}}", _pnumero);
        contenidoHtml = contenidoHtml.replace("{{numerointerno}}", _numerointerno);
        contenidoHtml = contenidoHtml.replace("{{tipodocumento}}", tipodoc);
        contenidoHtml = contenidoHtml.replace("{{afectado}}", afectado);
        contenidoHtml = contenidoHtml.replace("{{tipocedula}}", tipocedula);
        contenidoHtml = contenidoHtml.replace("{{direccioncliente}}", _direccioncliente);
        contenidoHtml = contenidoHtml.replace("{{telefonocliente}}", _telefonocliente);
        contenidoHtml = contenidoHtml.replace("{{emailcliente}}", emailpdf);
        contenidoHtml = contenidoHtml.replace("{{cedulacliente}}", _rifcliente);

        // contenidoHtml = contenidoHtml.replace("{{monedabs}}", 'Moneda Bs.');

        contenidoHtml = contenidoHtml.replace("{{nombrecliente}}", _nombrecliente);
        contenidoHtml = contenidoHtml.replace("{{fechaasignacion}}", moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY"));
        contenidoHtml = contenidoHtml.replace("{{fecha}}", moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY"));
        contenidoHtml = contenidoHtml.replace("{{hora}}", moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("hh:mm:ss a"));

        contenidoHtml = contenidoHtml.replace("{{piedepagina}}", _piedepagina);
        contenidoHtml = contenidoHtml.replace("{{formasdepago}}", formasdepago);
        console.log(_impuestog, _impuestor, _impuestoa,_impuestoigtf )
        if (_impuestog === 0) {
            trbaseg = ''
        }
        if (_impuestor === 0) {
            trbaser = ''        
        }
        if (_impuestoa === 0) {
            trbasea = ''        
        }
        if (_impuestoigtf === 0) {
            trbaseigtf = ''
        }
        contenidoHtml = contenidoHtml.replace("{{trbaseg}}", trbaseg);
        contenidoHtml = contenidoHtml.replace("{{trbaser}}", trbaser);
        contenidoHtml = contenidoHtml.replace("{{trbasea}}", trbasea);
        contenidoHtml = contenidoHtml.replace("{{trbaseigtf}}", trbaseigtf);
        
        if(ISPUBLICIDAD) {
            contenidoHtml = contenidoHtml.replace("{{publicidad}}", publicidad);
        } else {
            contenidoHtml = contenidoHtml.replace("{{publicidad}}", '');
        }
        let subtotalusd = 0
        let impuestosusd = 0
        let exentosusd = 0
        let totalusd = 0
        if (_tasacambio > 0) {
            
            subtotalusd = Number(subtotal)/Number(_tasacambio)
            // impuestosusd = Number(impuestos)/Number(_tasacambio)
            exentosusd = Number(exentos)/Number(_tasacambio)
            totalusd = Number(total)/Number(_tasacambio)
         
           //  contenidoHtml = contenidoHtml.replace("{{baseivausd}}", completarDecimales(Number(_baseivausd)));
            contenidoHtml = contenidoHtml.replace("{{subtotalusd}}", completarDecimales(Number(subtotalusd)));
            contenidoHtml = contenidoHtml.replace("{{impuestosusd}}", completarDecimales(Number(impuestosusd)));
            contenidoHtml = contenidoHtml.replace("{{exentosusd}}", completarDecimales(Number(exentosusd)));
            contenidoHtml = contenidoHtml.replace("{{totalusd}}", completarDecimales(Number(totalusd)));            
        
        }
        contenidoHtml = contenidoHtml.replace("{{subtotal}}", completarDecimales(Number(subtotal)));
        // contenidoHtml = contenidoHtml.replace("{{baseiva}}", completarDecimales(Number(baseiva)));
        // contenidoHtml = contenidoHtml.replace("{{impuestos}}", completarDecimales(Number(impuestos)));
        contenidoHtml = contenidoHtml.replace("{{exentos}}", completarDecimales(Number(exentos)));        
        contenidoHtml = contenidoHtml.replace("{{total}}", completarDecimales(Number(total)));
            
        
        contenidoHtml = contenidoHtml.replace("{{coletilla}}", coletilla);     
        // NOTA DE ENTREGA GUIA DE DESPACHOS
        let creditofiscal = '';
            if (Number(_idtipodoc) === 4 || Number(_idtipodoc) === 5) {
                creditofiscal =`<tr>
                        <td colspan="2" class="text-left" style="padding-top:5px;">
                            <p style="font-size: 7px;font-family:'Calibri'">Sin derecho a crédito fiscal.</p>
                        </td>
                    </tr>`;
            } 
            contenidoHtml = contenidoHtml.replace("{{creditofiscal}}", creditofiscal);

        const pathPdf1 = "dist/controllers/temp/" + _rif + "/" + annioenvio + "-"  + mesenvio + "/" + _rif + _pnumero + ".pdf"
        // const icFirmaDocumentosInput = "/opt/icFirmaDocumentos/var/lib/icFirmaDocumentos/input"
        // const icFirmaDocumentosInput = __dirname
        const icFirmaDocumentosInput = "C:/Users/personal/proyectos/quasar/sit"
        
        // console.log(icFirmaDocumentosInput)

        pdf.create(contenidoHtml, { format: "Letter" }).toFile(pathPdf1, async (error) => {
            if (error) {
                // console.log("Error creando PDF: " + error)
                return res.status(400).send('Error Interno Creando pdf :  ' + error);
            } else {
                console.log("PDF creado correctamente");               
                //////////////
                // FIRMAR PDF
                //////////////
                console.log(enviocorreo, _sendmail, productos.length, _emailcliente)

                if (enviocorreo == 1 && _sendmail == 1 && productos.length > 0 && _emailcliente?.length > 0) {
                    console.log('va a Enviar correo')
                    await envioCorreo(res, _nombrecliente, _pnumero, _rif, _emailcliente, _telefono, colorfondo1, colorfuente1, colorfondo2, colorfuente2, sitioweb, textoemail, banner, _emailemisor, _numerointerno, tipodoc, annioenvio, mesenvio, diaenvio, emailbcc, _estatus)

                } else {
                    console.log('Sin correo')
                }
            }
        });
    } catch (e) {
        return res.status(400).send('Error Externo Creando pdf :  ' + e);
    }

}
function crearCodeQR (informacion: any, rif: any, annio: any, mes: any, numerodocumento: any ) {
    const folderPath = __dirname + '/temp/' + rif + '/codeqr/' + annio + '-' + mes; // Reemplaza con la ruta de tu carpeta
    fs.mkdirSync(folderPath,{recursive:true});
    QRCode.toFile(path.join(folderPath, 'qrcode_' + rif + numerodocumento + '.png'), informacion, (err)=>{
        if (err) throw err;
    });
}
function completarDecimales (cadena: any) {
    cadena = Intl.NumberFormat('de-DE').format(cadena.toFixed(2))
    const arreglo = cadena.split(',')
    cadena = arreglo.length === 1 ? cadena + ',00' : arreglo[1].length === 1 ? cadena + '0' : cadena
    return cadena
}
async function obtenerLote (res: Response, id: any) {
    try {

        const sql = "SELECT a.id, a.inicia, a.termina, a.fechaproduccion, a.utilizado ";
        const from = " FROM t_tranzascorrelativo a, t_serviciosdoc b  ";
        const where = " WHERE a.idserviciosmasivo = b.idserviciosmasivo and b.corelativo + 1 >= a.inicia::numeric and b.corelativo < a.termina::numeric and a.estatus = 1 and a.idserviciosmasivo = $1";
        const respReg = await pool.query(sql + from + where, [id])
        // console.log(respReg.rows)
        if(respReg.rows.length > 0) {

            const id = respReg.rows[0].id
          
            const utilizado = Number(respReg.rows[0].utilizado) + 1
            const update = "update t_tranzascorrelativo ";
            let set = " set utilizado = $1 ";
            let fechapiedepagina = moment().format('DD/MM/YYYY')
            // console.log(respReg.rows[0].fechaproduccion)
            if(!respReg.rows[0].fechaproduccion || respReg.rows[0].fechaproduccion == null || respReg.rows[0].fechaproduccion == 'null') {
                // console.log('respReg.rows[0].fechaproduccion')
                set += ", fechaproduccion = '" + moment().format("YYYY-MM-DD") + "'";                
            } else {
                fechapiedepagina = moment(respReg.rows[0].fechaproduccion).format('DD/MM/YYYY')
            }
            const whereupdate = " where id = $2";
            await pool.query(update + set + whereupdate, [utilizado, id])
        
            const numerolote = ' Desde Nro. de Control 00-' + respReg.rows[0].inicia.toString().padStart(8, '0') + ' Hasta Nro. 00-' + respReg.rows[0].termina.toString().padStart(8, '0') + ' de fecha ' + fechapiedepagina + '.'
            return numerolote
        } else {
            return '0'
        }
    }
    catch (e) {
        console.log('Error Consultando asignacion :  ' + e);
        return '0'
    }
}

export async function envioCorreo (res: Response, _pnombre: any, _pnumero: any, _prif: any, _email: any, _telefono: any, _colorfondo1: any, _colorfuente1: any, _colorfondo2: any, _colorfuente2: any, _sitioweb: any, _texto: any, _banner: any, _emailemisor: any, _numerointerno: any, _tipodoc: any, _annioenvio: any, _mesenvio: any, _diaenvio: any, _emailbcc: any, _estatus: any) {
    // try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: USERMAIL,
                pass: PASSMAIL
            }
            /* host: HOSTSMTP,
            port: 25,
            secure: false */
        });
        
        const numerocuerpo = _numerointerno.length > 0 ? _numerointerno : _pnumero
        let htmlpublicidad = ``
        if(ISPUBLICIDAD === '1') {
            htmlpublicidad = `<tr>
                <td style="padding:  0px 30px 20px;" colspan="3">               
                    <img src="${URLPUBLICIDADEMAIL}" style="max-width: 540px;">
                </td>
            </tr>`
        }
        const footer = `<tr height="50px">
                            <td style="text-align:center; width: 20%;">
                                <img src="${SERVERFILE}utils/logosmartcorreo.png" style="width: 130px;">
                            </td>
                            <td style="text-align:center;"  colspan="2">
                                <span style="font-size: 10px;">Este documento se emite bajo la providencia administrativa Nro. SNAT/2014/0032 de fecha 31/07/2014. Imprenta SMART INNOVACIONES TECNOLOGICAS, C.A. RIF J-50375790-6, Autorizada según Providencia Administrativa Nro. SENIAT/INTI/011 de fecha 02/10/2023.</span>
                            </td>
                        </tr>`;
        const texto_1 = _texto !== '0' ? `<tr>  
                            <td colspan="3">      
                                <div style="background: ${_colorfondo2}; margin-bottom: 30px; padding: 15px; font-size: 16px; color: ${_colorfuente2};">
                                <p style="text-align:left;">
                                    ${_texto}
                                </p>
                            </div> 
                            </td>
                        </tr>` : ''
        // console.log(_estatus)
        const mensaje = Number(_estatus) === 2 ? 'fué ANULADO.' : 'ya está disponible.' 
        const html_1 = `
        <table style="width: 100%;">
        <tr>
        <td style="text-align: -webkit-center !important; background: #d6d6d6;">
          <div style="width: 600px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600px" bgcolor="#fff" style="border: 1px solid #d6d6d6;">
                <tr height="240px">  
                    <td colspan="3" style="background: url(${SERVERFILE}utils/bannercorreo_${_banner}.png); text-align: left; padding-left: 50px; padding-top: 30px;">
                        <img src="${SERVERIMG}${_prif}.png" style="max-width: 130px;">                            
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 0 5px 0px 25px;" colspan="2">
                        <p style="text-align:left; display: grid;">
                            <span style="color: #f25004; font-weight: bolder; font-size: 24px;">${_pnombre}</span><br>
                            <span style="color: #632508; font-size: 16px;">Con gusto le notificamos que su ${_tipodoc},</span>
                            <span style="color: #632508; font-size: 16px;">${mensaje} </span>
                        </p>
                    </td>
                    <td style="text-align: center; padding-top: 30px; width: 217px;">
                        <img src="${SERVERFILE}utils/correoenviado.png" style="max-width: 200px;">            
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 30px; text-align: center;" colspan="2">   
                        <img src="${SERVERIMG}codeqr/${_prif}/${_annioenvio}-${_mesenvio}/qrcode_${_prif}${_pnumero}.png" style="max-width: 150px;">            
                    </td>
                    <td style="padding: 20px 30px 0 0;">
                            <p style="text-align:right; color: #632508; font-size: 16px;">
                            <span>Número documento: <br><span style="font-weight: bolder;">${numerocuerpo}</span></span> <br>
                            <span>Fecha emisión: <br><span style="font-weight: bolder;">${_diaenvio}/${_mesenvio}/${_annioenvio}</span></span> <br><br><br>
                            <span style="font-weight: bolder;background: #f25004;border-radius: 10px;padding: 7px 12px;font-size: 11px;">
                                <a style="text-decoration: none;color: #ffffff" href="${SERVERFILE}${_prif}/${_annioenvio}-${_mesenvio}/${_prif}${_pnumero}">Ver ${_tipodoc}</a>.
                            </span>
                        </p>
                    </td>
                </tr>
                ${htmlpublicidad}
                ${texto_1}
                <tr height="40px" style="background: #f25004;">
                    <td colspan="3" style="text-align: center;">
                        <span style="color: #fff; font-weight: bolder;">${_telefono}</span>
                        <span style="text-decoration: none; color: #ffffff; font-weight: bolder;margin: 30px;">${_emailemisor}</span>
                        <span style="text-decoration: none; color: #ffffff; font-weight: bolder;">${_sitioweb}</span>
                    </td>
                </tr>
                ${footer}
            </table></div></td></tr></table>
            `;            
        // const htmlfinal = _banner === '1' ? html_1 : _banner === '2' ? html_2 : html_3
        const htmlfinal = html_1
        const arregloemail = _email.split('|')
        const arreglocorreobcc = _emailbcc.split('|')
        // console.log('arreglocorreobcc')
        // console.log(arreglocorreobcc)
        const correobcc = arreglocorreobcc ? arreglocorreobcc.join(';') : ''
        // console.log('correobcc')
        // console.log(correobcc)

        let p = 0;
         for(let i = 0; i< arregloemail.length; i++) {
            let mail_options = {
                from: 'Mi Factura Digital<no-reply@smartfactura.net>',
                to: arregloemail[i],
                bcc: correobcc,
                subject: 'Envío de ' + _tipodoc + ' digital',
                html: htmlfinal,
                attachments: [
                {
                    filename: _tipodoc + '-' + numerocuerpo + '.pdf',
                    path: FILEPDF + _prif + '/' + _annioenvio + '-' + _mesenvio + '/' + _prif + _pnumero
                }
            ]
            };
            transporter.sendMail(mail_options, async (error: any, info: { response: string; }) => {
                if (error) {
                    // console.log(error);
                    return res.status(400).send('Error Interno Enviando correo :  ' + error);
                } else {                          
                    if(p === 0) {
                        const updcorreo = 'UPDATE t_registros SET estatuscorreo = 1 WHERE numerodocumento = $1 '
                        await pool.query(updcorreo, [_pnumero])  
                        p = 1;   
                    }                   
                    console.log('El correo a ' + arregloemail[i] + ' se envío correctamente ' + info.response);
                }
            });
        }
        

    /* }
    catch (e) {
        return res.status(400).send('Error Externo Enviando correo :  ' + e);
    } */

}
