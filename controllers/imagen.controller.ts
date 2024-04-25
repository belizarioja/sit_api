import { Request, Response } from 'express';
import fs from 'fs';
import formidable from 'formidable';
import path from 'path';
  
export async function getImagen (req: Request, res: Response): Promise<Response | void> {
    try {
        const img = req.params.img
        const path = __dirname + '/images/' + img
        if (fs.existsSync(path)) {
        // const imgbase64 = fs.readFileSync(path, { encoding: 'base64' })
        return res.sendFile(path)
        // return res.status(200).send({ imgbase64, message: 'Imagen encontrada!' })
        } else {
        return res.status(202).send({ message: 'Imagen no encontrada!' })
        }
    }
    catch (e) {
        return res.status(400).send('Error buscando logo de cliente emisor ' + e);
    }
}
export async function getImagenCodeQr (req: Request, res: Response): Promise<Response | void> {
    try {
        const { rif, anniomes, filecodeqr} = req.params
        const path = __dirname + '/temp/' + rif + '/codeqr/' + anniomes + '/' + filecodeqr
        console.log(path)
        if (fs.existsSync(path)) {
        // const imgbase64 = fs.readFileSync(path, { encoding: 'base64' })
        return res.sendFile(path)
        // return res.status(200).send({ imgbase64, message: 'Imagen encontrada!' })
        } else {
        return res.status(202).send({ message: 'Imagen no encontrada!' })
        }
    }
    catch (e) {
        return res.status(400).send('Error buscando logo de cliente emisor ' + e);
    }
}
  
export async function setImagen (req: Request, res: Response): Promise<Response | void> {
    try {
        /// const folder = path.join(__dirname, 'images')
        //const form = new formidable.IncomingForm()

        var form = new formidable.IncomingForm({ 
            uploadDir: __dirname + '/images',  // don't forget the __dirname here
            keepExtensions: true
          });
       
        form.parse(req, (_: any, fields: any, files: {}) => {          
          res.send('Imagen cambiada con éxito')
        })

        form.on("fileBegin", function(name: any, file: { newFilename: string; filepath: string; }) {
          let regex = /[^.]*/;   
          let fileName = file.newFilename.replace(regex, req.params.rif);
          file.filepath = path.join( __dirname + '/images', fileName);
         });        
        
    }
    catch (e) {
        return res.status(400).send('Error Guardando logo de cliente emisor ' + e);
    }
}


