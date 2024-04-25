import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
// const multer = require("multer");

import IndexRoutes from './routes/index.routes'
import UsuarioRoutes from './routes/usuarios.routes'
import SedesRoutes from './routes/sedes.routes'
import TipoDocumentosRoutes from './routes/tipodocumentos.routes'
import FacturacionRoutes from './routes/facturacion.routes'
import AnulacionRoutes from './routes/anulacion.routes'
import ReportesRoutes from './routes/reportes.routes'
import ImagenRoutes from './routes/imagen.routes'
import ArchivosRoutes from './routes/archivos.routes'
import BitacorasRoutes from './routes/bitacoras.routes'
import EmailRoutes from './routes/email.routes'
import AsignacionesRoutes from './routes/asignaciones.routes'

export class App {
    app: Application;

    constructor(
        // aqui variables y constantes
    ) {
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
        
    }

    private settings () {
        this.app.set('port', process.env.PORT);
        this.app.set('server', process.env.SERVIDOR);
        //this.app.set('server', process.env.SERVER || '/api_impredigital');
    }
    private middlewares () {
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(cors({
            origin: '*'
        }));
    }

    private routes () {
        this.app.use(this.app.get('server'), IndexRoutes);
        this.app.use(this.app.get('server') + '/usuario', UsuarioRoutes);
        this.app.use(this.app.get('server') + '/sede', SedesRoutes);
        this.app.use(this.app.get('server') + '/tipodocumento', TipoDocumentosRoutes);
        this.app.use(this.app.get('server') + '/facturacion', FacturacionRoutes);
        this.app.use(this.app.get('server') + '/anulacion', AnulacionRoutes);
        this.app.use(this.app.get('server') + '/reporte', ReportesRoutes);
        this.app.use(this.app.get('server') + '/imagen', ImagenRoutes);
        this.app.use(this.app.get('server') + '/archivos', ArchivosRoutes);
        this.app.use(this.app.get('server') + '/bitacora', BitacorasRoutes);       
        this.app.use(this.app.get('server') + '/email', EmailRoutes);       
        this.app.use(this.app.get('server') + '/asignaciones', AsignacionesRoutes);       

    }

    async listen () {
        await this.app.listen(this.app.get('port'));
        console.log('Servidor en puerto ', this.app.get('port'));
        console.log('Servidor en carpeta ', this.app.get('server'));
    }

}