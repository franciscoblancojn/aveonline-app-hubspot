const { fetch } = require("./fetch.js");

class Hubspot {
  urlApi = "https://api.hubapi.com/crm/v3/objects";
  token = "";

  constructor(token) {
    this.token = token;
  }
  async onRequest({ body = undefined, method = "POST", url }) {
    try {
      const respond = await fetch(`${this.urlApi}${url}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
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

  async crearContact({ email, first_name, last_name, phone,campana }) {
    const properties = {
      email,
      firstname: first_name,
      lastname: last_name,
      phone,
      campana,
      company: "AveChat",
    };
    const data = {
      properties,
    };
    const result = await this.onRequest({
      url: `/contacts`,
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  }
  async crearCompany({ name, phone, id_hs }) {
    const properties = {
      name,
      phone,
    };
    const data = {
      properties,
      associations: [
        {
          to: {
            id: id_hs,
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 2,
            },
          ],
        },
      ],
    };
    let result = await this.onRequest({
      url: `/companies`,
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  }
  async crearNote({ associationTypeId, message, user, contactId }) {
    const data = {
      associations: [
        {
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: associationTypeId,
            },
          ],
          to: {
            id: contactId,
          },
        },
      ],
      properties: {
        // hs_note_body: message,
        hs_note_body: `📱 WhatsApp (${`${user}`.trim()}): ${message}`,
        hs_timestamp: Date.now(), // Tiempo en milisegundos
      },
    };
    const result = await this.onRequest({
      url: `/notes`,
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  }
  async getCompanyByNIT({ NIT }) {
    const data = {
      limit: 1,
      properties: [
        "createdate",
        "asesor_logistico",
        "documento",
        "hs_lastmodifieddate",
        "hs_object_id",
        "hubspot_owner_id"
      ],
      filterGroups: [
        {
          filters: [{ propertyName: "documento", value: NIT, operator: "EQ" }],
        },
      ],
    };
    const result = await this.onRequest({
      url: `/companies/search`,
      method: "POST",
      body: JSON.stringify(data),
    });
    if(!result?.results?.[0]?.id){
      throw new Error("Company not found")
    }
    return result?.results?.[0];
  }
  async getConctactByKeyValue({ key,value }) {
    const data = {
      limit: 1,
      properties: [
        "phone",
        "hs_object_id"
      ],
      filterGroups: [
        {
          filters: [{ propertyName: key, value: value, operator: "EQ" }],
        },
      ],
    };
    const result = await this.onRequest({
      url: `/contacts/search`,
      method: "POST",
      body: JSON.stringify(data),
    });
    if(!result?.results?.[0]?.id){
      throw new Error("contacts not found")
    }
    return result?.results?.[0];
  }
  async getConctactById({ ID }) {
    const data = {
      limit: 1,
      properties: [
        "phone",
        "hs_object_id"
      ],
      filterGroups: [
        {
          filters: [{ propertyName: "hs_object_id", value: ID, operator: "EQ" }],
        },
      ],
    };
    const result = await this.onRequest({
      url: `/contacts/search`,
      method: "POST",
      body: JSON.stringify(data),
    });
    if(!result?.results?.[0]?.id){
      throw new Error("contacts not found")
    }
    return result?.results?.[0];
  }
  async getCompanyByKeyValue({ key,value }) {
    const data = {
      limit: 1,
      properties: [
        "phone",
        "hs_object_id"
      ],
      filterGroups: [
        {
          filters: [{ propertyName: key, value: value, operator: "EQ" }],
        },
      ],
    };
    const result = await this.onRequest({
      url: `/companies/search`,
      method: "POST",
      body: JSON.stringify(data),
    });
    if(!result?.results?.[0]?.id){
      throw new Error("companies not found")
    }
    return result?.results?.[0];
  }
  async getCompanytById({ ID }) {
    const data = {
      limit: 1,
      properties: [
        "phone",
        "hs_object_id"
      ],
      filterGroups: [
        {
          filters: [{ propertyName: "hs_object_id", value: ID, operator: "EQ" }],
        },
      ],
    };
    const result = await this.onRequest({
      url: `/companies/search`,
      method: "POST",
      body: JSON.stringify(data),
    });
    if(!result?.results?.[0]?.id){
      throw new Error("companies not found")
    }
    return result?.results?.[0];
  }
  async asignarCompanyToContact({ contact_id, company_id }) {
    const result = await this.onRequest({
      url: `/contacts/${contact_id}/associations/companies/${company_id}/contact_to_company`,
      method: "PUT",
    });
    if(!result?.id){
      throw new Error("Asignar Company to Contact error")
    }
    return result
  }
}

module.exports = {
  Hubspot,
};
