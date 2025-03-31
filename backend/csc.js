
const {fetch} = require('./fetch.js');
class CSC {
  urlApi = "https://country-state-city-nextjs.vercel.app";

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

  async getCountrys() {
    const result = await this.onRequest({
      url: `/countrys.json`,
    });
    return result;
  }
  
  async getCountrysByCode({code}) {
    const contrys = await this.getCountrys()
    const contry = contrys.find(e=>e.code == code)
    return contry
  }
}

module.exports = {
  CSC,
};
