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
exports.redistribuir = exports.exportFacturas = exports.getUtils = exports.getFactura = void 0;
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const moment_1 = __importDefault(require("moment"));
const database_1 = require("../database");
function getFactura(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rifid = req.params.rifid;
            const rif = req.params.rif;
            const anniomes = req.params.anniomes;
            // console.log(__dirname)
            const path = __dirname + '/temp/' + rif + '/' + anniomes + '/' + rifid + '.pdf';
            // console.log(path)
            if (fs_1.default.existsSync(path)) {
                fs_1.default.readFile(path, function (err, data) {
                    res.contentType("application/pdf");
                    res.send(data);
                });
            }
            else {
                return res.status(202).send({ message: 'Archivo no encontrado!' });
            }
        }
        catch (e) {
            return res.status(400).send('Error buscando archivo pdf Documento ' + e);
        }
    });
}
exports.getFactura = getFactura;
function getUtils(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const img = req.params.img;
            const path = __dirname + '/utils/' + img;
            if (fs_1.default.existsSync(path)) {
                return res.sendFile(path);
            }
            else {
                return res.status(202).send({ message: 'Imagen de formato de correo no encontrada!' });
            }
        }
        catch (e) {
            return res.status(400).send('Error Enviando imagen de formato de correo ' + e);
        }
    });
}
exports.getUtils = getUtils;
function exportFacturas(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rif, idserviciosmasivo, idtipodocumento, numerodocumento, desde, hasta, exento, impuestog, impuestor, impuestoigtf, estatus, cedulacliente, idcodigocomercial } = req.body;
            let sql = "select a.id, a.idserviciosmasivo, c.razonsocial, c.rif, c.direccion, c.telefono, a.numerodocumento, a.cedulacliente, a.nombrecliente, a.direccioncliente, a.telefonocliente, a.idtipodocumento, b.tipodocumento, c.enviocorreo, a.estatuscorreo, a.emailcliente, c.idcodigocomercial, ";
            sql += " a.trackingid, a.fecha, a.tasag, a.baseg, a.impuestog, a.tasar, a.baser, a.impuestor, a.tasaigtf, a.baseigtf, a.impuestoigtf, a.subtotal, a.total, a.exento, a.estatus, a.observacion, a.relacionado, a.fechaanulado, d.abrev, a.idtipocedulacliente, a.numerointerno, a.piedepagina ";
            const from = " from t_registros a  ";
            // let leftjoin = " where a.idtipodocumento = b.id and a.idserviciosmasivo = c.id and a.idtipocedulacliente = d.id and a.estatus = " + estatus;
            let leftjoin = " left join t_tipodocumentos b ON a.idtipodocumento = b.id  ";
            leftjoin += " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
            leftjoin += " left join t_tipocedulacliente d ON a.idtipocedulacliente = d.id  ";
            let where = " where a.idserviciosmasivo > 0 ";
            if (estatus !== 4) {
                where += " and a.estatus = " + estatus;
            }
            if (idcodigocomercial) {
                where += " and c.idcodigocomercial = " + idcodigocomercial;
            }
            if (idserviciosmasivo) {
                where += " and a.idserviciosmasivo = " + idserviciosmasivo;
            }
            if (idtipodocumento) {
                where += " and a.idtipodocumento in (" + idtipodocumento + ")";
            }
            if (numerodocumento) {
                where += " and a.numerodocumento = '" + numerodocumento + "'";
            }
            if (cedulacliente) {
                where += " and a.cedulacliente = '" + cedulacliente + "'";
            }
            if (desde && hasta) {
                where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
            }
            if (exento) {
                where += " and a.exento > 0 ";
            }
            if (impuestog) {
                where += " and a.impuestog > 0 ";
            }
            if (impuestor) {
                where += " and a.impuestor > 0 ";
            }
            if (impuestoigtf) {
                where += " and a.impuestoigtf > 0 ";
            }
            const orderBy = ' order by a.fecha asc, a.numerodocumento asc ';
            // const limit =' LIMIT 135'
            // console.log(sql + from + leftjoin+ where + orderBy + limit)
            const resp = yield database_1.pool.query(sql + from + leftjoin + where + orderBy);
            const seleccion = resp.rows.map(item => ({
                correlativo: item.numerodocumento,
                annio: (0, moment_1.default)(item.fecha, 'DD/MM/YYYY hh:mm:ss a').format('YYYY'),
                mes: (0, moment_1.default)(item.fecha, 'DD/MM/YYYY hh:mm:ss a').format('MM')
            }));
            // console.log(seleccion)
            const outputPath = __dirname + '/temp/' + rif + '/tempsmart.zip'; // Ruta para el archivo ZIP de salida
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            const output = fs_1.default.createWriteStream(outputPath);
            const ttal = seleccion.length;
            // console.log(ttal)
            for (let i = 0; i < ttal; i++) {
                const annio = seleccion[i].annio;
                const mes = seleccion[i].mes;
                const correlativo = seleccion[i].correlativo;
                const folderPath = __dirname + '/temp/' + rif + '/' + annio + '-' + mes + '/'; // Reemplaza con la ruta de tu carpeta
                console.log(folderPath);
                fs_1.default.readdir(folderPath, (err, files) => {
                    if (err) {
                        console.error('Error al leer la carpeta:', err);
                        return;
                    }
                    if (Number(i) === 0) {
                        archive.pipe(output);
                    }
                    // Filtra solo los archivos PDF
                    const pdfFiles = files.filter((file) => file.endsWith('.pdf'));
                    // console.log('pdfFiles.length');
                    // console.log(pdfFiles.length);
                    if (pdfFiles.length > 0) {
                        pdfFiles.forEach((file) => {
                            // console.log(file.substring(file.length - 15));
                            const sub1 = file.substring(file.length - 15);
                            const sub2 = sub1.substring(0, 11);
                            if (correlativo === sub2) {
                                // console.log('sub2')
                                const filePath = `${folderPath}/${file}`;
                                archive.append(fs_1.default.createReadStream(filePath), { name: file });
                            }
                        });
                    }
                    if (Number(i) === seleccion.length - 1) {
                        archive.finalize();
                    }
                });
            }
            archive.on('end', () => __awaiter(this, void 0, void 0, function* () {
                // console.log('Archivos PDF comprimidos en', outputPath);
                if (fs_1.default.existsSync(outputPath)) {
                    // res.sendFile(outputPath)
                    fs_1.default.readFile(outputPath, function (err, data) {
                        /* fs.unlink(outputPath, (err) => {
                            if (err) {
                                throw err;
                            }
                        }) */
                        init();
                        res.contentType("application/zip");
                        // return res.sendFile(data);
                        res.send(data);
                    });
                }
                else {
                    return res.status(202).send({ message: 'Archivo no encontrado!' });
                }
            }));
        }
        catch (e) {
            return res.status(400).send('Error Exporando ' + e);
        }
    });
}
exports.exportFacturas = exportFacturas;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(1);
        yield sleep(4000);
        // console.log(2);
    });
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function redistribuir(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rif } = req.body;
            let sql = "select a.fecha, a.numerodocumento ";
            const from = " from t_registros a  ";
            const leftjoin = " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
            let where = " where c.rif = '" + rif + "'";
            const orderBy = ' order by a.fecha asc ';
            // console.log(sql + from + leftjoin + where)
            const resp = yield database_1.pool.query(sql + from + leftjoin + where + orderBy);
            const ano = (0, moment_1.default)().format('YYYY');
            for (let i = 1; i <= Number((0, moment_1.default)().format('MM')); i++) {
                const mes = i < 10 ? '0' + i : i;
                const nueva = __dirname + '/temp/' + rif + '/' + ano + '-' + mes + '/';
                fs_1.default.mkdirSync(nueva, { recursive: true });
            }
            const seleccion = resp.rows.map(item => ({
                correlativo: item.numerodocumento,
                annio: (0, moment_1.default)(item.fecha, 'DD/MM/YYYY hh:mm:ss a').format('YYYY'),
                mes: (0, moment_1.default)(item.fecha, 'DD/MM/YYYY hh:mm:ss a').format('MM')
            }));
            // console.log(seleccion)
            const ttal = seleccion.length;
            // console.log(ttal)
            for (let i = 0; i < ttal; i++) {
                const annio = seleccion[i].annio;
                const mes = seleccion[i].mes;
                const correlativo = seleccion[i].correlativo;
                const archivopdf = __dirname + '/temp/' + rif + correlativo + '.pdf';
                if (fs_1.default.existsSync(archivopdf)) {
                    // console.log('Existe!!!')
                    const nuevacarpeta = __dirname + '/temp/' + rif + '/' + annio + '-' + mes + '/';
                    fs_1.default.mkdirSync(nuevacarpeta, { recursive: true });
                    fs_1.default.renameSync(archivopdf, nuevacarpeta + rif + correlativo + '.pdf');
                }
            }
            res.send('Archivos redistribuidos ');
        }
        catch (e) {
            return res.status(400).send('Error Redistribuyendo ' + e);
        }
    });
}
exports.redistribuir = redistribuir;
