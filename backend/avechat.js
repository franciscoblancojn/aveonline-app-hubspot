class AveChat {
    urlApiAveChat = 'https://chat.aveonline.co/api/'
    tokenApiAveCaht = ''

    constructor(token){
        this.tokenApiAveCaht = token
    }
    async onRequest({body = undefined,method = 'GET',url}){
        try {
            const respond = await fetch(`${this.urlApiAveChat}${url}`, {
                headers: {
                  'accept': 'application/json',
                  'X-ACCESS-TOKEN': this.tokenApiAveCaht
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
    
    async getIdHs(){
        const result = await this.onRequest({
            url:"/accounts/custom_fields"
        })
        const id_hs = result.find(e=>e.name=="id_hs").id

        return id_hs
    }
    async postIdHs({user_id, id_hs}){
        const IDHS = await this.getIdHs()
        const result = await this.onRequest({
            url:`/users/${user_id}/custom_fields/${IDHS}`,
            method:"POST",
            body:new URLSearchParams({
                'value': id_hs
            })
        })
        return result;
    }
}


module.exports = {
    AveChat
}