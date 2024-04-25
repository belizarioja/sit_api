import { Request, Response } from 'express';
// import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import md5 from 'md5'
import nodemailer from 'nodemailer';

const USERMAIL = process.env.USERMAIL
const PASSMAIL = process.env.PASSMAIL
const SERVERFILE = process.env.SERVERFILE
const SERVERIMG = process.env.SERVERIMG

const SECRET = process.env.SECRET || '123456';
// DB
import { pool } from '../database'
import moment from 'moment';

export async function getLogin (req: Request, res: Response): Promise<Response | void> {
    try {
        const { usuario, clave } = req.body;
        const sql = "select a.id, a.idrol, a.idserviciosmasivo, a.nombre, c.razonsocial, b.rol, c.rif, a.estatus, a.emailbcc, a.horaentrada, a.horasalida, a.fecharecuperacion ";
        const from = " from t_usuarios a ";
        let leftjoin = " left join t_roles b ON a.idrol = b.id  ";
        leftjoin += " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
        const where = " where a.usuario ='" + usuario + "' and a.clave = '" + clave + "'";
        // console.log(sql + from + leftjoin + where);
        const resp = await pool.query(sql + from + leftjoin + where);
        // console.log(resp.rows[0])
        const cant = resp.rows.length;
        if (cant > 0) {
            if(resp.rows[0].estatus === '0') {
                
                const data = {
                    message: "Usuario no autorizado!"
                };
                return res.status(202).json(data);
               
            } else {
               
                const accessToken: string = jwt.sign({ user: resp.rows[0] }, SECRET);
                const data = {
                    message: "Acceso válido",
                    resp: resp.rows[0],
                    accessToken: accessToken
                };
                return res.status(200).json(data);
            }
            
        } else {
            const data = {
                message: "Credenciales Incorrectas!"
            };
            return res.status(202).json(data);
        }
    }
    catch (e) {
        return res.status(400).send('Error Logueando ' + e);
    }
}
export async function getUsuarios (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select a.id, a.idrol, a.usuario, a.clave, a.idserviciosmasivo, a.nombre, c.razonsocial, b.rol, a.estatus, a.emailbcc, a.emailrecuperacion, a.horaentrada, a.horasalida, a.fecharecuperacion ";
        const from = " from t_usuarios a ";
        let leftjoin = " left join t_roles b ON a.idrol = b.id  ";
        leftjoin += " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
        const resp = await pool.query(sql + from + leftjoin);
        const cant = resp.rows.length;
        const data = {
            success: true,
            resp: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Usuarios ' + e);
    }
}
export async function getRoles (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select * ";
        const from = " from t_roles ";
        const resp = await pool.query(sql + from);
        const cant = resp.rows.length;
        const data = {
            success: true,
            resp: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Roles ' + e);
    }
}
export async function setUsuarios (req: Request, res: Response): Promise<Response | void> {
    try {
        const { nombre, usuario, clave, idrol, idserviciosmasivo, estatus } = req.body;

        const insert = "insert into t_usuarios (nombre, usuario, clave, idrol, idserviciosmasivo, estatus ) ";
        const values = " values ($1, $2, $3, $4, $5, $6) ";
        const resp = await pool.query(insert + values, [nombre, usuario, clave, idrol, idserviciosmasivo, estatus]);
        const cant = resp.rows.length;
        const data = {
            success: true,
            resp: {
                message: "Usuario creado con éxito"
            }
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Ingesando Usuario ' + e);
    }
}
export async function updateEstatus (req: Request, res: Response): Promise<Response | void> {
    try {
        const { estatus } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_usuarios set estatus = $1 where id = $2 ";
        await pool.query(sqlupd, [estatus, id])
        const data = {
            success: true,
            resp: {
                message: "Estatus de Usuario actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Estatus de Usuarios ' + e);
    }
}
export async function updateClave (req: Request, res: Response): Promise<Response | void> {
    try {
        const { nuevaclave } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_usuarios set clave = $1, fecharecuperacion = null where id = $2 ";
        await pool.query(sqlupd, [nuevaclave, id])
        const data = {
            success: true,
            resp: {
                message: "Clave de Usuario actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Clave de Usuarios ' + e);
    }
}
export async function updateEmail (req: Request, res: Response): Promise<Response | void> {
    try {
        const { nuevoemail, accion } = req.body;
        const { id } = req.params;       

        // const sqlupd = "update t_usuarios set emailbcc = $1 where id = $2 ";
        let sqlupd = "update t_usuarios set ";
        if(accion === 1) {
            sqlupd += " emailbcc = $1 ";
        }
        if(accion === 2) {
            sqlupd += " emailrecuperacion = $1 ";
        }        
        sqlupd += "where id = $2 ";
        await pool.query(sqlupd, [nuevoemail, id])
        const data = {
            success: true,
            resp: {
                message: "Email de Usuario actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Clave de Usuarios ' + e);
    }
}
export async function updateHora (req: Request, res: Response): Promise<Response | void> {
    try {
        const { nuevahora, accion } = req.body;
        const { id } = req.params;       

        let sqlupd = "update t_usuarios set ";
        if(accion === 1) {
            sqlupd += " horaentrada = $1 ";
        }
        if(accion === 2) {
            sqlupd += " horasalida = $1 ";
        }        
        sqlupd += "where id = $2 ";
        await pool.query(sqlupd, [nuevahora, id])
        const data = {
            success: true,
            resp: {
                message: "Hora de sesion de Usuario actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Clave de Usuarios ' + e);
    }
}

function generateRandomString () {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result1 = ''
    const charactersLength = characters.length
    for (let i = 0; i < 9; i++) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result1
  }
  
export async function recoverLogin (req: Request, res: Response): Promise<Response | void> {
    try {
        const { usuario, email } = req.body;
        const sql = "select a.id, a.emailbcc, a.emailrecuperacion from t_usuarios a ";
        const where = " where a.usuario ='" + usuario + "' and (a.emailbcc = '" + email + "' or a.emailrecuperacion = '" + email + "') ";
        // console.log(sql + where);
        const resp = await pool.query(sql + where);
        // console.log(resp.rows)
        const cant = resp.rows.length;
        if (cant > 0) {
            
            const nuevaclave = await generateRandomString()
            const sqlupd = "update t_usuarios set clave = $1, fecharecuperacion = $2 where id = $3 ";
            await pool.query(sqlupd, [md5(nuevaclave), moment().format("YYYY-MM-DD HH:mm:ss"), resp.rows[0].id])
            // console.log(md5(nuevaclave)) 
            console.log(nuevaclave) 
            if(resp.rows[0].emailbcc) {
                console.log('ENVIAR CORREO DE RECUPERACIÓN') 
                await envioCorreo (res, resp.rows[0].emailbcc, resp.rows[0].emailrecuperacion, nuevaclave)
            }
        }
        const data = {
            message: "Si la dirección de correo electrónico está registrada con nosotros, recibirá una clave temporal. Tendrá 24 horas para usarla."
        };
        return res.status(200).json(data);
    }
    catch (e) {
        return res.status(400).send('Error Recuperando clave ' + e);
    }
}

export async function envioCorreo (res: Response, _emailbcc: any, _emailrecuperacion: any, _nuevaclave: any) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: USERMAIL,
                pass: PASSMAIL
            }
        });

        const html_1 = `
        <table style="width: 100%;">
        <tr>
        <td style="text-align: -webkit-center !important; background: #d6d6d6;">
          <div style="width: 600px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600px" bgcolor="#fff" style="border: 1px solid #d6d6d6;">
                <tr height="240px">  
                    <td colspan="3" style="background: url(${SERVERFILE}utils/bannercorreo_1.png); text-align: left; padding-left: 40px; padding-top: 85px;">
                        <img src="${SERVERFILE}utils/logosmartcorreo.png" style="max-width: 160px;">                            
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 0 5px 0px 25px;" colspan="2">
                        <p style="text-align:left; display: grid;">
                            <span style="color: #f25004; font-weight: bolder; font-size: 24px;">Estimado Usuario</span><br>
                            <span style="color: #632508; font-size: 16px;">Con gusto le enviamos su clave temporal ${_nuevaclave}</span>
                            <span style="color: #632508; font-size: 16px;">Tendrá 24 horas para utilzarla.</span>
                        </p>
                    </td>
                    <td style="text-align: center; padding-top: 30px; width: 217px;">
                        <img src="${SERVERFILE}utils/correoenviado.png" style="max-width: 200px;">            
                    </td>
                </tr>
                <tr height="40px" style="background: #f25004;">
                    <td colspan="3" style="text-align: center;">
                    </td>
                </tr>
            </table></div></td></tr></table>
            `;            
        const htmlfinal = html_1
        let correos = _emailbcc
        if (_emailrecuperacion) {
            correos += '; ' + _emailrecuperacion
        }
       
        let p = 0;
        let mail_options = {
            from: 'SMART Servicios<no-reply@smartfactura.net>',
            to: correos,
            subject: 'Recuperar contraseña',
            html: htmlfinal
        };
        transporter.sendMail(mail_options, async (error: any, info: { response: string; }) => {
            if (error) {
                // console.log(error);
                return res.status(400).send('Error Interno Enviando correo :  ' + error);
            } else {                          
                console.log('El correo a ' + correos + ' se envío correctamente >>> ' + info.response);
            }
        });
        

    }
    catch (e) {
        return res.status(400).send('Error Externo Enviando correo de recuperación :  ' + e);
    }

}
