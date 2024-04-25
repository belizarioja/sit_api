import { Request, Response } from 'express';
// DB
import { pool } from '../database'

export async function getTipoDocumento (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select * ";
        const from = " from t_tipodocumentos ";
        const resp = await pool.query(sql + from);
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
}
export async function getTipoCedula (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select * ";
        const from = " from t_tipocedulacliente ";
        const resp = await pool.query(sql + from);
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
}