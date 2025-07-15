const { cola } = require("./cola/index.js");
const { AveChatAdmin } = require("./data/avechat-Admin.js");
const {
  AveChatFields,
  AveChatFiedsCampana,
  AveChatFiedsSendTemplate,
} = require("./data/avechat-fields.js");
const { fetch } = require("./fetch.js");

class AveChat {
  urlApi = "https://chat.aveonline.co/api/";
  token = "";
  campana = false;
  sendTemplate = false;
  cola = false;

  constructor(token, options = {}) {
    const { campana = false, sendTemplate = false, cola = false } = options;
    this.token = token;
    this.campana = campana;
    this.sendTemplate = sendTemplate;
    this.cola = cola;
  }
  async onRequest({
    _await = false,
    swcola = true,
    body = undefined,
    method = "GET",
    url,
    callBack,
  }) {
    const f = async () => {
      try {
        const timeAwait = 2000;
        if (_await) {
          await new Promise((r) => setTimeout(r, timeAwait));
        }
        const respond = await fetch(`${this.urlApi}${url}`, {
          headers: {
            accept: "application/json",
            "X-ACCESS-TOKEN": this.token,
          },
          body,
          method,
        });
        const result = await respond.json();
        console.log({
          result,
          cola: this.cola,
          swcola,
        });
        if (
          this.cola &&
          swcola &&
          result?.error?.message ==
            "Your account exceeded the limit of 100 requests per 60 seconds"
        ) {
          await new Promise((r) => setTimeout(r,40000 ));
          return this.onRequest({
            _await,
            swcola,
            body,
            method,
            url,
          });
        }
        // if (_await) {
        //   await new Promise((r) => setTimeout(r, timeAwait));
        // }
        if (callBack) {
          callBack(result);
        }
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    if (this.cola && swcola) {
      cola.schedule(f);
      return "cola";
    }
    return await f();
  }

  async getIdCustomFieldApi() {
    const result = await this.onRequest({
      url: "/accounts/custom_fields",
    });
    return result;
  }
  async getIdCustomField(key) {
    const id = (
      this.campana
        ? AveChatFiedsCampana
        : this?.sendTemplate
        ? AveChatFiedsSendTemplate
        : AveChatFields
    ).find((e) => e.name == key).id;

    return id;
  }
  async setCustomField({ key, value, user_id, _await = false, callBack }) {
    const id = await this.getIdCustomField(key);
    // console.log("setCustomField",{ id, key, value ,user_id});

    const result = await this.onRequest({
      _await,
      url: `/users/${user_id}/custom_fields/${id}`,
      method: "POST",
      body: new URLSearchParams({
        value: value,
      }),
      callBack,
    });
    return result;
  }
  // async saveCustomFields({ user_id, obj }) {
  //   return await Promise.all(
  //     Object.keys(obj).map(async (key) => {
  //       return await this.setCustomField({
  //         user_id,
  //         key,
  //         value: obj[key],
  //       });
  //     })
  //   );
  // }
  async saveCustomField({ user_id, key, value, _await = false, callBack }) {
    const result = await this.setCustomField({
      user_id,
      key,
      value,
      _await,
      callBack,
    });
    // console.log({result,key,value,user_id});

    if (
      result?.error?.message ==
      "Your account exceeded the limit of 100 requests per 60 seconds"
    ) {
      this.setCustomField({
        user_id,
        key,
        value,
      });
    }
  }
  async saveCustomFields({ user_id, obj }) {
    const listResult = [];
    const listkey = Object.keys(obj);
    for (let i = 0; i < listkey.length; i++) {
      const key = listkey[i];
      const value = obj[key];
      if (value == null || value == undefined || value == "undefined") {
        continue;
      }
      const result = await this.setCustomField({
        user_id,
        key,
        value,
      });
      // console.log({result,key,value,user_id});

      if (
        result?.error?.message ==
        "Your account exceeded the limit of 100 requests per 60 seconds"
      ) {
        i--;
        // console.log("await save filed " + key + ": " + value);
        await sleep(1000 * 55);
        continue;
      }

      listResult.push(result);
    }
    return listResult;
  }
  async createUser({ phone, first_name, last_name, gender, cola }) {
    const result = await this.onRequest({
      swcola: cola,
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
    return AveChatAdmin;
  }
  async sendMessage({ user_id, flow_id, message }) {
    const saveCustomFields = await this.saveCustomFields({
      user_id,
      obj: {
        message,
      },
    });
    const result = await this.onRequest({
      url: `/users/${user_id}/send/${flow_id}`,
      method: "POST",
    });
    return {
      ...result,
      saveCustomFields,
    };
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
        const resutCreate = await this.createUser({
          first_name,
          last_name,
          phone,
          email,
        });
        const resutCustonField = await this.saveCustomFields({
          user_id: id_avechat,
          obj: {
            id_hs,
            url_hs,
          },
        });
        return {
          isNew: true,
          create: true,
          resutCreate,
          resutCustonField,
        };
      }
      return {
        isNew: false,
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
  async asignarAsesor({ user_id }) {
    const result = await this.onRequest({
      url: `/users/${user_id}/send/1744048919301`,
      method: "POST",
    });
    return result;
  }
  async sendMessageTemplate({ user_id, flow_id, id_template }) {
    const scf = await this.saveCustomFields({
      user_id,
      obj: {
        id_template,
      },
    });
    const result = await this.onRequest({
      url: `/users/${user_id}/send/${flow_id}`,
      method: "POST",
    });
    return {
      ...result,
      scf,
      user_id,
    };
  }
}

module.exports = {
  AveChat,
};
