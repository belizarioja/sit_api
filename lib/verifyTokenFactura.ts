import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
const SECRET = process.env.SECRET

interface IPaylod {
    user: {
        id: number,
        enviocorreo: number,
        validarinterno: number,
        razonsocial: string,
        rif: string,
        email: string,
        direccion: string
    }
}

// Authorization: Bearer <token>
export function verifyTokenFactura (req: Request, res: Response, next: NextFunction) {
    const bearerHeader = req.headers['authorization']
    // const idusuario = req.body.idusuario;
    // console.log(typeof bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        try {
            const payload = jwt.verify(bearerToken, SECRET || '123456') as IPaylod;
            // console.log('payload.user')
            // console.log(payload.user)
            // console.log(req.body.rif, payload.user.rif)
            if(req.body.rif === payload.user.rif)
            {
                req.id = payload.user.id || 0
                req.enviocorreo = payload.user.enviocorreo || 0
                req.validarinterno = payload.user.validarinterno || 0
                req.rif = payload.user.rif || ''
                req.razonsocial = payload.user.razonsocial || ''
                req.email = payload.user.email || ''
                req.direccion = payload.user.direccion || ''
                next();
            } else {
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 3,
                        message: 'Token NO CORRESPONDE al RIF'
                    }
            });
            }

        } catch (e) {
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 1,
                    message: 'Token NO VALIDO'
                }
            });
        }
    } else {
        res.status(401).json('Acceso denegado');
    }
}
declare global {
    namespace Express {
        interface Request {
            id: number;
            enviocorreo: number;
            validarinterno: number;
            razonsocial: string;
            rif: string;
            email: string;
            direccion: string;
        }
    }
}