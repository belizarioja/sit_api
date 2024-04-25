"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenFactura = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.SECRET;
// Authorization: Bearer <token>
function verifyTokenFactura(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    // const idusuario = req.body.idusuario;
    // console.log(typeof bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        try {
            const payload = jsonwebtoken_1.default.verify(bearerToken, SECRET || '123456');
            // console.log('payload.user')
            // console.log(payload.user)
            // console.log(req.body.rif, payload.user.rif)
            if (req.body.rif === payload.user.rif) {
                req.id = payload.user.id || 0;
                req.enviocorreo = payload.user.enviocorreo || 0;
                req.validarinterno = payload.user.validarinterno || 0;
                req.rif = payload.user.rif || '';
                req.razonsocial = payload.user.razonsocial || '';
                req.email = payload.user.email || '';
                req.direccion = payload.user.direccion || '';
                next();
            }
            else {
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 3,
                        message: 'Token NO CORRESPONDE al RIF'
                    }
                });
            }
        }
        catch (e) {
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 1,
                    message: 'Token NO VALIDO'
                }
            });
        }
    }
    else {
        res.status(401).json('Acceso denegado');
    }
}
exports.verifyTokenFactura = verifyTokenFactura;
