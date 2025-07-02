
  const onWebhookSendMessage = ({
    sCache
  }) => async (req, res) => {
    // {
    //   "guia": "1112016134910111",
    //   "pedido_id": "2222281115431432",
    //   "numeropedidoExterno": "00000",
    //   "estado_id": 12,
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
      const respond = {
        success: true,
        message: "✅ Contacto creado correctamente.",
        data: {
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
 onWebhookSendMessage

};