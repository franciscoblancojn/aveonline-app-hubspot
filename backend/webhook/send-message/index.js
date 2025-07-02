const {cola} = require("../../cola");
const { db } = require("../../db");

const onWebhookSendMessage =
  ({ sCache, aveChatLineaEstandar }) =>
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
    sCache("body", req.body);
    try {
      // tipo_pedido
      // first_name
      // tienda
      // transportadora
      // guia
      // valor
      // telefono_del_comercio
      // url_pdf_guia
      // direccion
      // destino
      // ia_repitation
      // productos
      // token_edicion
      // imagen
      // direccion_oficina_trasnportadora
      // ia_suggested_direccion
      // adelanto
      // banco_comercio
      // numero_cuenta
      // tipo_cuenta
      // novedad_transportadora
      // novedad_homologada
      let listMessage = undefined;
      if (req.body.get) {
        listMessage = await db.onGetRows("ave_chat_linea_estandar_message", {});
      } else {
        for (let i = 0; i < 111; i++) {
          cola.schedule(async () => {
            await db.onCreateTable("ave_chat_linea_estandar_message", {
              id: "INTEGER PRIMARY KEY AUTOINCREMENT",
              id_avechat: "TEXT",
              message: "TEXT",
            });
            await db.onCreateRow("ave_chat_linea_estandar_message", {
              id_avechat: `${i}`,
              message: "test",
            });
          });
        }
      }

      const respond = {
        success: true,
        message: "✅ Contacto creado correctamente.",
        data: {
          listMessage,
        },
      };
      sCache("respond", respond);
      return res.status(200).json(respond);
    } catch (error) {
      const err = {
        success: false,
        message: "❌ Error al crear el contacto.",
        error: error.message,
      };
      sCache("error", err);
      return res.status(500).json(err);
    }
  };

module.exports = {
  onWebhookSendMessage,
};
