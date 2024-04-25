import { Request, Response } from 'express';
// DB
import { pool } from '../database'

export async function getBitacora (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idusuario, idevento, desde, hasta } = req.body;

        const sql = "select a.idusuario, a.idevento, c.evento, b.usuario, b.nombre, b.idrol, a.ip, a.fecha, a.observacion ";
        const from = " from t_bitacoras a, t_usuarios b, t_eventos c ";
        let where = " where a.idusuario = b.id AND a.idevento = c.id ";
        if(idusuario) {
            where += " AND a.idusuario = " + idusuario;
        }
        if(idevento) {
            where += " AND a.idevento = " + idevento;
        }
        if(desde && hasta) {
            where += " AND a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        const resp = await pool.query(sql + from + where);             
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
}
export async function setBitacora (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idusuario, idevento, ip, observacion, fecha } = req.body;
       const insert = "insert into t_bitacoras (idusuario, idevento, fecha, ip, observacion) ";
        const values = " values ($1, $2, $3, $4, $5)";
        await pool.query(insert + values, [idusuario, idevento, fecha, ip, observacion]);        
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
}

export async function getEventos (req: Request, res: Response): Promise<Response | void> {
    try {

        const sql = "select * from t_eventos ";
        const resp = await pool.query(sql);             
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
}