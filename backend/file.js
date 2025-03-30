
const fs = require('fs').promises; 

const FILE_PATH = 'data.json';
class File {

    constructor(){
        
    }
    async getStoredNumber(){
        try {
            const data = await fs.readFile(FILE_PATH, 'utf8');
            return JSON.parse(data).n_asesor_comercial || 0;
        } catch (error) {
            return 0; // Si el archivo no existe o hay un error, devuelve 0
        }
    };
    
    // Función para guardar el número en el archivo
    async saveNumber(n_asesor_comercial){
        await fs.writeFile(FILE_PATH, JSON.stringify({ n_asesor_comercial }));
    };
}


module.exports = {
    File
}