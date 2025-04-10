const { fetch } = require("./fetch.js");

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
      body: JSON.stringify({
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
  async sendMessage({ user_id, flow_id, message }) {
    await this.saveCustomFields({
      user_id,
      obj: {
        message,
      },
    });
    const result = await this.onRequest({
      url: `/users/${user_id}/send/${flow_id}`,
      method: "POST",
    });
    return result;
  }
  async getUsersByCustomField({ key, value }) {
    const field_id = await this.getIdCustomField(key);
    if (!field_id) {
      throw new Error("key custom field invalid");
    }
    const result = await this.onRequest({
      url: `/users/find_by_custom_field?field_id=${field_id}&value=${value}`,
      method: "GET",
    });
    result.field_id = field_id;
    return result;
  }
  async getUsersById({ id }) {
    if (!id) {
      throw new Error("id invalid");
    }
    try {
      const result = await this.onRequest({
        url: `/users/${id}`,
        method: "GET",
      });

      if (result.first_name == "") {
        return undefined;
      }

      return result;
    } catch {
      return undefined;
    }
  }

  async createUserIfNotExist({
    id_avechat,
    first_name,
    last_name,
    phone,
    email,
    id_hs,
    url_hs,
  }) {
    try {
      const user = await this.getUsersById({ id: id_avechat });
      if (user == undefined) {
        await this.createUser({
          first_name,
          last_name,
          phone,
          email,
        });
        await this.saveCustomFields({
          user_id: id_avechat,
          obj: {
            id_hs,
            url_hs,
          },
        });
      }
      return {
        create: true,
      };
    } catch (error) {
      return {
        create: false,
        message: error.message,
        error,
      };
    }
  }
}

module.exports = {
  AveChat,
};
