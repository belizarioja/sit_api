import { Request, Response } from 'express';
import moment from 'moment';

import { crearFactura } from './facturacion.controller';

import { pool } from '../database'

export async function sendFacturaEmail (req: Request, res: Response): Promise<Response | void> {
    // try {
        
        const { rif, email, numerodocumento } = req.body;
        let sql = "select a.id, a.idserviciosmasivo, c.razonsocial, c.rif, c.email, c.direccion, c.telefono, a.numerodocumento, a.cedulacliente, a.nombrecliente, a.direccioncliente, a.telefonocliente, a.idtipodocumento, b.tipodocumento, a.relacionado, a.impuestoigtf, a.baseigtf, a.fecha, ";
        sql += " a.trackingid, a.fecha, d.abrev, a.idtipocedulacliente, a.numerointerno, a.piedepagina, c.enviocorreo, a.tasacambio, a.observacion, a.estatus  ";
        const from = " from t_registros a, t_tipodocumentos b, t_serviciosmasivos c , t_tipocedulacliente d ";
        const where = " where a.idtipodocumento = b.id and a.idserviciosmasivo = c.id and a.idtipocedulacliente = d.id and a.numerodocumento = $1 and c.rif = $2";
        const respdoc = await pool.query(sql + from + where, [numerodocumento, rif]); 
        // console.log(respdoc.rows[0])
        const idregistro = respdoc.rows[0].id
        const idserviciosmasivo = respdoc.rows[0].idserviciosmasivo
        const razonsocial = respdoc.rows[0].razonsocial
        const emailemisor = email || respdoc.rows[0].email
        const nombrecliente = respdoc.rows[0].nombrecliente
        const direccion = respdoc.rows[0].direccion
        const cedulacliente = respdoc.rows[0].cedulacliente
        const idtipocedulacliente = respdoc.rows[0].idtipocedulacliente
        const idtipodocumento = respdoc.rows[0].idtipodocumento
        const telefonocliente = respdoc.rows[0].telefonocliente || ''
        const direccioncliente = respdoc.rows[0].direccioncliente || ''
        const impuestoigtf = respdoc.rows[0].impuestoigtf     
        const baseigtf = respdoc.rows[0].baseigtf     
        const numerointerno = respdoc.rows[0].numerointerno     
        const piedepagina = respdoc.rows[0].piedepagina     
        const tasacambio = respdoc.rows[0].tasacambio     
        const observacion = respdoc.rows[0].observacion || ''
        const estatus = respdoc.rows[0].estatus
        const sendmail = 1 
        const fechaenvio =  moment(respdoc.rows[0].fecha).format('YYYY-MM-DD hh:mm:ss')
        // console.log('respdoc.rows[0].fecha, fechaenvio')
        // console.log(respdoc.rows[0].fecha, fechaenvio)
        let numeroafectado = respdoc.rows[0].relacionado.length > 0 ? respdoc.rows[0].relacionado : ''
        
        let fechaafectado = ''    
        let idtipoafectado = ''  
        if(idtipodocumento === '2' || idtipodocumento === '3') {

            const sqlrel = " SELECT * FROM t_registros ";
            const whererel = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
            // console.log(sqlupd + whereupd)

            const resprel = await pool.query(sqlrel + whererel, [idserviciosmasivo, respdoc.rows[0].relacionado])  
            if(resprel.rows.length > 0 ) {
                numeroafectado = resprel.rows[0].numerointerno.length > 0 ? resprel.rows[0].numerointerno : numeroafectado
                fechaafectado = resprel.rows[0].fecha
                idtipoafectado = resprel.rows[0].idtipodocumento
            }
        }

        const sqldet= "select id, codigo, descripcion, precio, cantidad, tasa, monto, exento, descuento, comentario ";
        const fromdet = " from t_registro_detalles ";
        const wheredet = " where idregistro = " + idregistro;
        // console.log(sql + from + where)
        const respdet = await pool.query(sqldet + fromdet + wheredet);
        // console.log(respdet.rows)
        const cuerpofactura = respdet.rows

        const sqlformas= "select forma, valor ";
        const fromformas = " from t_formasdepago ";
        const whereformas = " where idregistro = " + idregistro;
        // console.log(sql + from + where)
        const respformas = await pool.query(sqlformas + fromformas + whereformas);
        // console.log(respdet.rows)
        const formasdepago = respformas.rows
        // console.log('va a Crear PDF')
        await crearFactura(res, rif, razonsocial, direccion, numerodocumento, nombrecliente, cuerpofactura, email, cedulacliente, idtipocedulacliente, telefonocliente, direccioncliente, numerointerno, idserviciosmasivo, emailemisor, idtipodocumento, numeroafectado, impuestoigtf, fechaafectado, idtipoafectado, piedepagina, baseigtf, fechaenvio, formasdepago, sendmail, tasacambio, observacion, estatus)
        .then(()=> {
            const data = {
                success: true,
                error: null,
                data: {
                    mensaje:  'Correo enviado con éxito'
                }
            };
            return res.status(200).json(data); 
        })
    

    /*}
    catch (e) {
        return res.status(400).send('Error Creando correlativo y cuerpo de factura ' + e);
    }*/
}
