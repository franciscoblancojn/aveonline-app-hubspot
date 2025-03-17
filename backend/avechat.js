class AveChat {
    urlApi = 'https://chat.aveonline.co/api/'
    token = ''

    constructor(token){
        this.token = token
    }
    async onRequest({body = undefined,method = 'GET',url}){
        try {
            const respond = await fetch(`${this.urlApi}${url}`, {
                headers: {
                  'accept': 'application/json',
                  'X-ACCESS-TOKEN': this.token
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
    
    async getIdCustomFiled(key){
        const result = await this.onRequest({
            url:"/accounts/custom_fields"
        })
        const id = result.find(e=>e.name==key).id

        return id
    }
    async setCustomFiled({key,value,user_id}){
        const id = await this.getIdCustomFiled(key)
        const result = await this.onRequest({
            url:`/users/${user_id}/custom_fields/${id}`,
            method:"POST",
            body:new URLSearchParams({
                'value': value
            })
        })
        return result;
    }
}


module.exports = {
    AveChat
}