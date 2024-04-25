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
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const multer = require("multer");
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const usuarios_routes_1 = __importDefault(require("./routes/usuarios.routes"));
const sedes_routes_1 = __importDefault(require("./routes/sedes.routes"));
const tipodocumentos_routes_1 = __importDefault(require("./routes/tipodocumentos.routes"));
const facturacion_routes_1 = __importDefault(require("./routes/facturacion.routes"));
const anulacion_routes_1 = __importDefault(require("./routes/anulacion.routes"));
const reportes_routes_1 = __importDefault(require("./routes/reportes.routes"));
const imagen_routes_1 = __importDefault(require("./routes/imagen.routes"));
const archivos_routes_1 = __importDefault(require("./routes/archivos.routes"));
const bitacoras_routes_1 = __importDefault(require("./routes/bitacoras.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const asignaciones_routes_1 = __importDefault(require("./routes/asignaciones.routes"));
class App {
    constructor(
    // aqui variables y constantes
    ) {
        this.app = (0, express_1.default)();
        this.settings();
        this.middlewares();
        this.routes();
    }
    settings() {
        this.app.set('port', process.env.PORT);
        this.app.set('server', process.env.SERVIDOR);
        //this.app.set('server', process.env.SERVER || '/api_impredigital');
    }
    middlewares() {
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)({
            origin: '*'
        }));
    }
    routes() {
        this.app.use(this.app.get('server'), index_routes_1.default);
        this.app.use(this.app.get('server') + '/usuario', usuarios_routes_1.default);
        this.app.use(this.app.get('server') + '/sede', sedes_routes_1.default);
        this.app.use(this.app.get('server') + '/tipodocumento', tipodocumentos_routes_1.default);
        this.app.use(this.app.get('server') + '/facturacion', facturacion_routes_1.default);
        this.app.use(this.app.get('server') + '/anulacion', anulacion_routes_1.default);
        this.app.use(this.app.get('server') + '/reporte', reportes_routes_1.default);
        this.app.use(this.app.get('server') + '/imagen', imagen_routes_1.default);
        this.app.use(this.app.get('server') + '/archivos', archivos_routes_1.default);
        this.app.use(this.app.get('server') + '/bitacora', bitacoras_routes_1.default);
        this.app.use(this.app.get('server') + '/email', email_routes_1.default);
        this.app.use(this.app.get('server') + '/asignaciones', asignaciones_routes_1.default);
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.listen(this.app.get('port'));
            console.log('Servidor en puerto ', this.app.get('port'));
            console.log('Servidor en carpeta ', this.app.get('server'));
        });
    }
}
exports.App = App;
