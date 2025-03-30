
const fs = require('fs').promises; 

const FILE_PATH = 'data.json';
class File {
    n_asesor_comercial = 0
    constructor(){
        
    }
    async getStoredNumber(){
        return this.n_asesor_comercial
        try {
            const data = await fs.readFile(FILE_PATH, 'utf8');
            return JSON.parse(data).n_asesor_comercial || 0;
        } catch (error) {
            return 0; // Si el archivo no existe o hay un error, devuelve 0
        }
    };
    
    // Función para guardar el número en el archivo
    async saveNumber(n_asesor_comercial){
        this.n_asesor_comercial = n_asesor_comercial
        return
        await fs.writeFile(FILE_PATH, JSON.stringify({ n_asesor_comercial }));
    };
}


module.exports = {
    File
}