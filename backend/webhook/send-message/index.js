const { cola } = require("../../cola");
const { db } = require("../../db");

const onWebhookSendMessage =
  ({
    sCache,
    aveChatLineaEstandar,
    prosesingPhone,
    ifExistAvechat,
    onCreateUserAvechatIfNotExist,
    createUser,
    onGetUser,
    onCreateUser,
    onUpdateUser,
  }) =>
  async (req, res) => {
    // {
    //   "guia": "1112016134910111",
    //   "pedido_id": "2222281115431432",
    //   "numeropedidoExterno": "00000",
    //   "nombre_estado": "Entregada",
    //   "fechacreacion": "2023-06-02 12:37:58",
    //   "fechanovedad": "2023-12-02 17:04:06",
    //   "comentarionovedad": "DESTINATARIO SE TRASLADO",
    //   "complementariosnovedad": "13:21 : NOMBRE CONFIRMA NUEVA DIRECCION: dueñoNUEVA DIRECCION: 0000 ",
    //   "tiponovedad": "SC",
    //   "guiadigitalizada": "https://ruta_guia_digitalizada",
    //   "fechaentrega": "2023-06-02 10:01:00",
    //   "fechapagovendedor": "2023-06-22",
    //   "pagovendedor": 269700,
    //   "comprobantepagovendedor": "274593",
    //   "fechapagoproveedor": "023-06-02 10:01:00",
    //   "pagoproveedor": 9700,
    //   "comprobantepagoproveedor": "RX3456",
    //   "dataStandartLine": {
    //       "firstName": "",
    //       "type": "pending",
    //       "companyName": "AVE -ALEJANDRA  ORIENTAL",
    //       "operatorName": "COORDINADORA MERCANTIL",
    //       "guideNumber": "86732638432",
    //       "collectedValue": 461336,
    //       "companyPhoneNumber": "3225753109",
    //       "guidePdf": "https://app.aveonline.co/assets/data/guias/interrapidisimo/INTERRAPIDISIMO-guia-86732638432.pdf",
    //       "clientAddress": "BARRIO LLANO DE BOLIVAR EN TODA LA TORRE  Casa: CALLE 13B 152",
    //       "clientPhoneNumber": "3135642819",
    //       "clientCity": "SANTA FE DE ANTIOQUIA(ANTIOQUIA)",
    //       "operatorLocationAddress": "BARRIO LLANO DE BOLIVAR EN TODA LA TORRE  Casa: CALLE 13B 152",
    //       "freightValue": "14735",
    //       "bankName": "BANCOLOMBIA",
    //       "bankAccount": "CA",
    //       "bankAccountNumber": "03742429872",
    //       "aveNoveltyName": null,
    //       "agentId": 12152
    //   }
    // }

    //     {
    //   "guia": "valor_de_guia",
    //   "pedido_id": "valor_de_pedido",
    //   "numeropedidoExterno": "valor_de_numeropedidoexterno",
    //   "estado_id": 123,
    //   "nombre_estado": "nombre_del_estado",
    //   "fechacreacion": "fecha_de_creacion",
    //   "tiponovedad": "responsable_de_solucion",
    //   "dataStandartLine": {
    //     "type": "pending",
    //     "firstName": "nombre_destinatario",
    //     "companyName": "nombre_empresa",
    //     "operatorName": "nombre_transportadora",
    //     "guideNumber": "valor_de_guia",
    //     "collectedValue": 50000,
    //     "companyPhoneNumber": "telefono_empresa",
    //     "guidePdf": null,
    //     "clientAddress": "direccion_destinatario",
    //     "clientPhoneNumber": "telefono_cliente",
    //     "clientCity": "ciudad_destinatario",
    //     "operatorLocationAddress": "direccion_destinatario",
    //     "freightValue": 10000,
    //     "bankName": null,
    //     "bankAccount": null,
    //     "bankAccountNumber": null,
    //     "aveNoveltyName": "nombre_estado_novedad",
    //     "agentId": 456,
    //     "noveltyResponsible": "encargado_de_solucion"
    //   }
    // }
    //   "estado_id": 12, if != 16  noveltyResponsible => 1 else validate noveltyResponsible
    //     "noveltyResponsible":1(companyPhoneNumber),2(clientPhoneNumber),3(ambos)
    const body = req.body;
    sCache("body", body);
    try {
      //tipo_pedido
      //tienda
      //transportadora
      //guia
      //telefono_del_comercio
      //url_pdf_guia
      //valor
      //direccion
      //productos
      //novedad_homologada
      const swFlow = {
        tradicional: {
          0: {
            id: 1742399439329,
            name: "ave_tradicional_guia_generada",
          },
          1: {
            id: 1742399439329,
            name: "ave_tradicional_guia_generada",
          },
          2: {
            id: 1742399439329,
            name: "ave_tradicional_guia_generada",
          },
          10003: {
            id: 1742326976324,
            name: "pedido_en_manos_de_trasportadora",
          },
          10005: {
            id: 1742323154201,
            name: "reparto_pedido",
          },
          12: {
            id: 1742334680842,
            name: "pedido_entregado_ave_tradicional",
          },
          10017: {
            id: 1742334680842,
            name: "pedido_entregado_ave_tradicional",
          },
        },
        crm: {
          2: {
            id: 1711404694846,
            name: "guia_pedido",
          },
          10003: {
            id: 1711404694846,
            name: "CRM_pedido_en_manos_trasportadora",
          },
          10005: {
            id: 1711450461431,
            name: "reparto_pedido",
          },
          12: {
            id: 1738236609877,
            name: "entregado_pedido",
          },
          10017: {
            id: 1738236609877,
            name: "entregado_pedido",
          },
          "?1": {
            id: 1745084674287,
            name: "pedido_en_novedad_con_gestion",
          },
          "?2": {
            id: 1745083529015,
            name: "pedido_en_novedad_operativa_sin_gestion",
          },
        },
      };
      let estado_id = `${req?.body?.estado_id ?? "-1"}`;
      const type =
        !body.pedido_id && !body.numeropedidoExterno ? "tradicional" : "crm";

      const { dataStandartLine } = body;

      const id_avechats = [];

      if (estado_id != "-1" && estado_id !== "16") {
        dataStandartLine.noveltyResponsible = 1; // companyPhoneNumber
      }

      const sendTemplate = swFlow?.[type]?.[estado_id]?.name;
      if (!sendTemplate) {
        throw "estado_id invalid";
      }

      const noveltyResponsible = dataStandartLine.noveltyResponsible ?? 1; // default to companyPhoneNumber

      //SET PHONES
      //PENDING: remove
      dataStandartLine.companyPhoneNumber = "3183558548";
      dataStandartLine.clientPhoneNumber = "3103557200";

      if (noveltyResponsible === 1 || noveltyResponsible === 3) {
        id_avechats.push({
          id_avechat: prosesingPhone(
            "+57" + dataStandartLine.companyPhoneNumber
          ),
          first_name: dataStandartLine.companyName ?? "User",
          last_name: "",
          address: dataStandartLine.operatorLocationAddress,
        });
      }
      if (noveltyResponsible === 2 || noveltyResponsible === 3) {
        id_avechats.push({
          id_avechat: prosesingPhone(
            "+57" + dataStandartLine.clientPhoneNumber
          ),
          first_name: dataStandartLine.firstName ?? "User",
          last_name: "",
          address: dataStandartLine.clientAddress,
        });
      }

      for (let i = 0; i < id_avechats.length; i++) {
        const { id_avechat, first_name, last_name, address } = id_avechats[i];
        if (id_avechat.length < 12) {
          continue;
        }
        // const n = await ifExistAvechat(id_avechat);
        // return res.status(200).json({n});
        const data = {
          tipo_pedido: dataStandartLine.type,
          tienda: dataStandartLine.companyName,
          transportadora: dataStandartLine.operatorName,
          guia: body.guia,
          telefono_del_comercio: dataStandartLine.companyPhoneNumber,
          url_pdf_guia: dataStandartLine.guidePdf,
          valor: dataStandartLine.freightValue,
          direccion: address,
          novedad_homologada:dataStandartLine?.aveNoveltyName,
          productos:dataStandartLine?.products
        };
        let user = await onGetUser(id_avechat);
        if (!user) {
          await createUser({
            phone: id_avechat,
            first_name,
            last_name,
            cola: false,
          });
          await onCreateUser(id_avechat, {});
          user = await onGetUser(id_avechat);
        }
        const keysObj = Object.keys(data);
        for (let i = 0; i < keysObj.length; i++) {
          const key = keysObj[i];
          const value = data[key];

          if (value != undefined && value != user?.data?.[key]) {
            aveChatLineaEstandar.saveCustomField({
              user_id: id_avechat,
              key,
              value,
            });
          }
        }
        // console.log("sendTemplate", sendTemplate);

        aveChatLineaEstandar.saveCustomField({
          user_id: id_avechat,
          key: "sendTemplate",
          value: sendTemplate,
        });
        await onUpdateUser(id_avechat, data);
      }

      const respond = {
        success: true,
        message: "✅ Mensaje Enviado correctamente.",
        data: {
          // listMessage,
        },
      };
      sCache("respond", respond);
      return res.status(200).json(respond);
    } catch (error) {
      const err = {
        success: false,
        message: error.message ?? error ?? "❌ Error al enviar el message.",
        error: error,
      };
      sCache("error", err);
      return res.status(500).json(err);
    }
  };

module.exports = {
  onWebhookSendMessage,
};
