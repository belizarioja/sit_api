import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const SECRET = process.env.SECRET || '123456';
// DB
import { pool } from '../database'

export async function getCodes (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select * ";
        const from = " from t_codigoscomercial ";
        const resp = await pool.query(sql + from);        
        const data = {
            success: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Códigos comerciales ' + e);
    }
}
export async function getSedes (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select a.* , b.codigocomercial  ";
        const from = " from t_serviciosmasivos a ";
        let leftjoin = " left join t_codigoscomercial b ON a.idcodigocomercial = b.id  ";
        const resp = await pool.query(sql + from + leftjoin);        
        const data = {
            success: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Servicios masivos ' + e);
    }
}
export async function getSede (req: Request, res: Response): Promise<Response | void> {
    const { rif } = req.body;

    try {
        const sql = "select id  ";
        const from = " from t_serviciosmasivos where rif = $1 ";
        const resp = await pool.query(sql + from, [rif]);        
        // console.log(resp)
        const data = {
            success: true,
            data: resp.rows[0]
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Buscando ID de Servicio masivos ' + e);
    }
}
export async function setSede (req: Request, res: Response): Promise<Response | void> {
    try {
        const { rif, razonsocial, direccion, email, emailbcc, telefono, enviocorreo, asignados, sitioweb, validarinterno } = req.body;
       
        const insert = "insert into t_serviciosmasivos (rif, razonsocial, direccion, email, telefono, enviocorreo, asignados, sitioweb, validarinterno, emailbcc, banner, estatus) ";
        const values = " values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, 1) RETURNING id";
        let resp = await pool.query(insert + values, [rif, razonsocial, direccion, email, telefono, enviocorreo, asignados, sitioweb, validarinterno, emailbcc]);
        // console.log(resp.rows[0].id)
        const id = resp.rows[0].id
        const datatoken = {
            id,
            rif, 
            razonsocial, 
            direccion, 
            email, 
            telefono,
            validarinterno
        }
        const tokenservicios: string = jwt.sign({ user: datatoken }, SECRET);
        const sqlupd = "update t_serviciosmasivos set tokenservicios = $1 where id = $2 ";
        await pool.query(sqlupd, [tokenservicios, id])
        const insertselect = "INSERT INTO t_serviciosdoc (idserviciosmasivo, identificador, corelativo ) values ($1, 0, 0) ";
        await pool.query(insertselect, [id])        
        // crear plantillas por defectos a clientes
        const insertplantilla = "INSERT INTO public.t_plantillacorreos(banner, colorfondo1, colorfondo2, colorfuente1, colorfuente2, idserviciosmasivo) VALUES ";
        const values1 = "('1', '#F3C492', '#EAF6FE', '#000000', '#575756', $1) ";
        // const values2 = "('2', '#0d3b81', '#e3e4e5', '#FFFFFF', '#575756', $1), ";
        // const values3 = "('3', '#FFFFFF', '#e3e4e5', '#575756', '#575756', $1);";
        await pool.query(insertplantilla + values1, [id])

        const archivoplantilla = path.join(__dirname, '../bases/factura1.html')
        const datafile = fs.readFileSync(archivoplantilla)
        const nuevaplantilla = path.join(__dirname, '../plantillas/' + rif + '.html')

        if (fs.existsSync(archivoplantilla)) {
            // console.log('Existe!!!')
            fs.renameSync(archivoplantilla, nuevaplantilla)
            fs.writeFileSync(archivoplantilla, datafile)
        }
        const data = {
            success: true,
            resp: {
                message: "Cliente Emisor y su plantilla creado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Listando Servicios masivos ' + e);
    }
}
export async function getSedeCorelativo (req: Request, res: Response): Promise<Response | void> {
    try {
        const { id } = req.params;       
        const sql = "SELECT identificador, corelativo FROM t_serviciosdoc WHERE idserviciosmasivo = $1";
        const resp = await pool.query(sql, [id]);   
        const identificador =  resp.rows[0].identificador    
        const corelativo =  resp.rows[0].corelativo 
        
        const sqllote = "SELECT * FROM t_tranzascorrelativo WHERE idserviciosmasivo = $1 order by id asc ";
        const resplote = await pool.query(sqllote, [id]);   

        const data = {
            success: true,
            identificador: identificador,
            corelativo: corelativo,
            data: resplote.rows
        };  
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Listando Corelativos de Servicios masivos ' + e);
    }
}
export async function getTodosCorelativo (req: Request, res: Response): Promise<Response | void> {
    try {
        const { id } = req.body;       

        let sqllote = "SELECT * FROM t_tranzascorrelativo where estatus = 1 ";
        if (id) {
            sqllote += " and idserviciosmasivo = " + id;
        }
        sqllote += " order by id asc ";
        const resplote = await pool.query(sqllote);   

        const data = {
            success: true,
            data: resplote.rows
        };  
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Listando Corelativos de Servicios masivos ' + e);
    }
}

export async function updateSede (req: Request, res: Response): Promise<Response | void> {
    try {
        const { rif, razonsocial, direccion, email, emailbcc, telefono, enviocorreo, sitioweb, validarinterno, idcodigocomercial, publicidad } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_serviciosmasivos set rif = $1, razonsocial = $2, direccion = $3, email = $4, telefono = $5, enviocorreo = $6, sitioweb = $7, validarinterno = $8, idcodigocomercial= $9, publicidad = $10, emailbcc = $11 where id = $12 ";
        await pool.query(sqlupd, [rif, razonsocial, direccion, email, telefono, enviocorreo, sitioweb, validarinterno, idcodigocomercial, publicidad, emailbcc, id]);
        const datatoken = {
            id,
            rif, 
            razonsocial, 
            direccion, 
            email, 
            telefono,
            validarinterno
        }
        const tokenservicios: string = jwt.sign({ user: datatoken }, SECRET);
        const sqlupd2 = "update t_serviciosmasivos set tokenservicios = $1 where id = $2 ";
        await pool.query(sqlupd2, [tokenservicios, id])
        const data = {
            success: true,
            resp: {
                message: "Servicios actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Servicios masivos ' + e);
    }
}
export async function updateEstatus (req: Request, res: Response): Promise<Response | void> {
    try {
        const { estatus } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_serviciosmasivos set estatus = $1 where id = $2 ";
        await pool.query(sqlupd, [estatus, id])
        const data = {
            success: true,
            resp: {
                message: "Estatus de Servicios actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Estatus de Servicios masivos ' + e);
    }
}
export async function updatePlantilla (req: Request, res: Response): Promise<Response | void> {
    try {
        const { plantilla, rif } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_serviciosmasivos set plantillapdf = $1 where id = $2 ";
        await pool.query(sqlupd, [plantilla, id])

        const archivoplantilla = path.join(__dirname, '../bases/factura'+ plantilla + '.html')
        const datafile = fs.readFileSync(archivoplantilla)
        const nuevaplantilla = path.join(__dirname, '../plantillas/' + rif + '.html')

        if (fs.existsSync(archivoplantilla)) {
            // console.log('Existe!!!')
            fs.renameSync(archivoplantilla, nuevaplantilla)
            fs.writeFileSync(archivoplantilla, datafile)
        }
        const data = {
            success: true,
            resp: {
                message: "Plantilla PDF de Servicios actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Plantilla PDF de Servicios masivos ' + e);
    }
}