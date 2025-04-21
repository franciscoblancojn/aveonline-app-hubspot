const {fetch} = require('./fetch.js');

class Count {
  urlApi = "https://aveonline.co/wp-json/avagb";
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
  async getCount(id="") {
    const result = await this.onRequest({
      url: `/count?id=${id}`,
    });
    return result.n_asesor_comercial;
  }
  // Función para guardar el número en el archivo
  async setCount(n_asesor_comercial,id="") {
    const result = await this.onRequest({
      url: `/count?id=${id}`,
      method:"POST",
      body:JSON.stringify({n_asesor_comercial})
    });
    return result;
  }
}

module.exports = {
  Count,
};
