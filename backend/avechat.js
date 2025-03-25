class AveChat {
  urlApi = "https://chat.aveonline.co/api/";
  token = "";

  constructor(token) {
    this.token = token;
  }
  async onRequest({ body = undefined, method = "GET", url }) {
    try {
      const respond = await fetch(`${this.urlApi}${url}`, {
        headers: {
          accept: "application/json",
          "X-ACCESS-TOKEN": this.token,
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

  async getIdCustomField(key) {
    const result = await this.onRequest({
      url: "/accounts/custom_fields",
    });
    const id = result.find((e) => e.name == key).id;

    return id;
  }
  async setCustomField({ key, value, user_id }) {
    const id = await this.getIdCustomField(key);
    const result = await this.onRequest({
      url: `/users/${user_id}/custom_fields/${id}`,
      method: "POST",
      body: new URLSearchParams({
        value: value,
      }),
    });
    return result;
  }
  async saveCustomFields({ user_id, obj }) {
    return await Promise.all(
      Object.keys(obj).map(async (key) => {
        return await this.setCustomField({
          user_id,
          key,
          value: obj[key],
        });
      })
    );
  }
  async createUser({ phone, first_name, last_name, gender }) {
    const result = await this.onRequest({
      url: `/users`,
      method: "POST",
      body: JSON.stringify({
        phone,
        first_name,
        last_name,
        gender,
      }),
    });
    return result;
  }
  async getAdmin() {
    const result = await this.onRequest({
      url: `/accounts/admins`,
      method: "GET",
    });
    return result;
  }
  async sendMessage({user_id,message}) {
    const result = await this.onRequest({
      url: `/users/${user_id}/send/text`,
      method: "POST",
      body:JSON.stringify({
        "text": message,
        "channel": "whatsapp"
      })
    });
    return result;
  }
}

module.exports = {
  AveChat,
};
