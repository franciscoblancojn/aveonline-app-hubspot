class Hubspot {
    urlApi = 'https://api.hubapi.com/crm/v3/objects'
    token = ''

    constructor(token){
        this.token = token
    }
    async onRequest({body = undefined,method = 'POST',url}){
        try {
            const respond = await fetch(`${this.urlApi}${url}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
                body,
                method
            });
            const result = await respond.json()
            return result
        } catch (error) {
            console.error(error)
            throw error
        }
    }
    
    async crearContact({email,first_name,last_name,phone}){
        const properties = {
          email,
          firstname: first_name,
          lastname: last_name,
          phone,
          company: "AveChat",
        };
        const data = {
          properties,
        };
        const result = await this.onRequest({
            url:`/contacts`,
            method:"POST",
            body:JSON.stringify(data)
        })
        return result;
    }
}


module.exports = {
    Hubspot
}