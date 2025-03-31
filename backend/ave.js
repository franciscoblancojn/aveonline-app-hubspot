
const {fetch} = require('./fetch.js');
class Ave {
  urlApi = "https://api.aveonline.co/api-onboarding/public/api/v1";

  constructor() {}
  async onRequest({ body = undefined, method = "GET", url }) {
    try {
      const respond = await fetch(`${this.urlApi}${url}`, {
        headers: {
            "Content-Type": "application/json",
        },
        body,
        method,
      });
      const result = await respond.json();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async crearLead({ name, phone, id_hs, id_aveChat }) {
    const result = await this.onRequest({
      url: `/onboarding/createLeadWhatsapp`,
      method: "POST",
      body: JSON.stringify({
        name,
        phone,
        id_hs,
        id_keybe: id_aveChat,
      }),
    });
    return result;
  }
  
}

module.exports = {
  Ave,
};
