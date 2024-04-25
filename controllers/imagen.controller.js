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
exports.setImagen = exports.getImagenCodeQr = exports.getImagen = void 0;
const fs_1 = __importDefault(require("fs"));
const formidable_1 = __importDefault(require("formidable"));
const path_1 = __importDefault(require("path"));
function getImagen(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const img = req.params.img;
            const path = __dirname + '/images/' + img;
            if (fs_1.default.existsSync(path)) {
                // const imgbase64 = fs.readFileSync(path, { encoding: 'base64' })
                return res.sendFile(path);
                // return res.status(200).send({ imgbase64, message: 'Imagen encontrada!' })
            }
            else {
                return res.status(202).send({ message: 'Imagen no encontrada!' });
            }
        }
        catch (e) {
            return res.status(400).send('Error buscando logo de cliente emisor ' + e);
        }
    });
}
exports.getImagen = getImagen;
function getImagenCodeQr(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rif, anniomes, filecodeqr } = req.params;
            const path = __dirname + '/temp/' + rif + '/codeqr/' + anniomes + '/' + filecodeqr;
            console.log(path);
            if (fs_1.default.existsSync(path)) {
                // const imgbase64 = fs.readFileSync(path, { encoding: 'base64' })
                return res.sendFile(path);
                // return res.status(200).send({ imgbase64, message: 'Imagen encontrada!' })
            }
            else {
                return res.status(202).send({ message: 'Imagen no encontrada!' });
            }
        }
        catch (e) {
            return res.status(400).send('Error buscando logo de cliente emisor ' + e);
        }
    });
}
exports.getImagenCodeQr = getImagenCodeQr;
function setImagen(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            /// const folder = path.join(__dirname, 'images')
            //const form = new formidable.IncomingForm()
            var form = new formidable_1.default.IncomingForm({
                uploadDir: __dirname + '/images',
                keepExtensions: true
            });
            form.parse(req, (_, fields, files) => {
                res.send('Imagen cambiada con éxito');
            });
            form.on("fileBegin", function (name, file) {
                let regex = /[^.]*/;
                let fileName = file.newFilename.replace(regex, req.params.rif);
                file.filepath = path_1.default.join(__dirname + '/images', fileName);
            });
        }
        catch (e) {
            return res.status(400).send('Error Guardando logo de cliente emisor ' + e);
        }
    });
}
exports.setImagen = setImagen;
