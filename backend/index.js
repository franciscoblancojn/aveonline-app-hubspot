require("dotenv").config();
const express = require("express");
const request = require("request-promise-native");
const NodeCache = require("node-cache");
const session = require("express-session");
const { AveChat } = require("./avechat.js");
const { Hubspot } = require("./hubspot.js");
const { Ave } = require("./ave.js");
const { CSC } = require("./csc.js");
const { Count } = require("./count.js");
const { fetch } = require("./fetch.js");
const { ASESORES } = require("./dataAcesot.js");
const { onLoadWebhook } = require("./webhook/_index.js");
const { log } = require("./log/index.js");

const app = express();

// rute server /var/www/clients/client1/web32/web/api
const PORT = 3005;

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });
const cacheNotExpire = new NodeCache({ deleteOnExpire: false });

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  throw new Error("Missing CLIENT_ID or CLIENT_SECRET environment variable.");
}

//===========================================================================//
//  HUBSPOT APP CONFIGURATION
//
//  All the following values must match configuration settings in your app.
//  They will be used to build the OAuth URL, which users visit to begin
//  installing. If they don't match your app's configuration, users will
//  see an error page.

// Replace the following with the values from your app auth config,
// or set them as environment variables before running.
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_KEY = process.env.API_KEY;
const ASSOCIATION_TYPE_ID = process.env.ASSOCIATION_TYPE_ID;
const HOST = process.env.HOST;
const TOKEN_AVECHAT = process.env.TOKEN_AVECHAT;
const TOKEN_AVECHAT_CAMPANA = process.env.TOKEN_AVECHAT_CAMPANA;
const FLOW_ID = process.env.FLOW_ID;
const FLOW_ID_CAMPANA = process.env.FLOW_ID_CAMPANA;

const hubspot = new Hubspot(API_KEY);
const aveChat = new AveChat(TOKEN_AVECHAT);
const aveChatCampana = new AveChat(TOKEN_AVECHAT_CAMPANA, { campana: true });
const ave = new Ave();
const csc = new CSC();
const count = new Count();
const prosesingPhone = (phone) => `${phone ?? ""}`.replace(/\D/g, "");

// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = ["crm.objects.contacts.read"];
if (process.env.SCOPE) {
  SCOPES = process.env.SCOPE.split(/ |, ?|%20/).join(" ");
}

// On successful install, users will be redirected to /oauth-callback
const REDIRECT_URI = `${HOST}/oauth-callback`;

//===========================================================================//

// Use a session to keep track of client ID
app.use(
  session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(log);
//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1
// Build the authorization URL to redirect a user
// to when they choose to install the app
const authUrl =
  "https://app.hubspot.com/oauth/authorize" +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

// Redirect the user from the installation page to
// the authorization URL
app.get("/install", (req, res) => {
  console.log("");
  console.log("=== Initiating OAuth 2.0 flow with HubSpot ===");
  console.log("");
  console.log("===> Step 1: Redirecting user to your app's OAuth URL");
  res.redirect(authUrl);
  console.log("===> Step 2: User is being prompted for consent by HubSpot");
});

// Step 2
// The user is prompted to give the app access to the requested
// resources. This is all done by HubSpot, so no work is necessary
// on the app's end

// Step 3
// Receive the authorization code from the OAuth 2.0 Server,
// and process it based on the query parameters that are passed
app.get("/oauth-callback", async (req, res) => {
  console.log("===> Step 3: Handling the request sent by the server");

  // Received a user authorization code, so now combine that with the other
  // required values and exchange both for an access token and a refresh token
  if (req.query.code) {
    console.log("       > Received an authorization token");

    const authCodeProof = {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code,
    };

    // Step 4
    // Exchange the authorization code for an access token and refresh token
    console.log(
      "===> Step 4: Exchanging authorization code for an access token and refresh token"
    );
    const token = await exchangeForTokens(req.sessionID, authCodeProof);
    if (token.message) {
      return res.redirect(`/error?msg=${token.message}`);
    }

    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    res.redirect(`/`);
  }
});
const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post(
      "https://api.hubapi.com/oauth/v1/token",
      {
        form: exchangeProof,
      }
    );
    // Usually, this token data should be persisted in a database and associated with
    // a user identity.
    const tokens = JSON.parse(responseBody);
    refreshTokenStore[userId] = tokens.refresh_token;
    accessTokenCache.set(
      userId,
      tokens.access_token,
      Math.round(tokens.expires_in * 0.75)
    );

    console.log("       > Received an access token and refresh token");
    return tokens.access_token;
  } catch (e) {
    console.error(
      `       > Error exchanging ${exchangeProof.grant_type} for access token`
    );
    return JSON.parse(e.response.body);
  }
};

const isAuthorized = (userId) => {
  return refreshTokenStore[userId] ? true : false;
};

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  // res.write(`<h2>HubSpot OAuth 2.0 Quickstart App</h2>`);
  if (isAuthorized(req.sessionID)) {
    // const accessToken = await getAccessToken(req.sessionID);
    // const contact = await getContact(accessToken);
    res.write(`<h4>Aplication installed ok</h4>`);
    // displayContactName(res, contact);
  } else {
    res.write(`<a href="/install"><h3>Install the app</h3></a>`);
  }
  res.end();
});

app.get("/error", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write(`<h4>Error: ${req.query.msg}</h4>`);
  res.end();
});

// app.get("/test", async (req, res) => {
//   try {
//     const response = await aveChat.getIdCustomField("NIT")

//     return res.json({
//       success: true,
//       message: "✅ Ok.",
//       data: response,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "❌ Error en la solicitud.",
//       error: error.message,
//     });
//   }
// });

//Permite guardar mensajes en Hubspot como Notas.
app.post("/api/create-note", async (req, res) => {
  const accessToken = API_KEY;
  const contactId = req?.body?.contactId; // ID del contacto
  const message = req?.body?.message; // ID del contacto
  const associationTypeId = parseInt(ASSOCIATION_TYPE_ID); // ID correcto para asociar notas a contactos

  const url = "https://api.hubapi.com/crm/v3/objects/notes";

  // Body example
  // {
  //  "contactId":"105323010669",
  //  "message":"Hola"
  // }
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
      hs_note_body: `📱 WhatsApp: ${message}`,
      hs_timestamp: Date.now(), // Tiempo en milisegundos
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.status === 201) {
      return res.json({
        success: true,
        message: "✅ Nota creada correctamente.",
        data: result,
      });
    } else {
      return res.status(response.status).json({
        success: false,
        message: "❌ Error al crear la nota.",
        error: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error en la solicitud.",
      error: error.message,
    });
  }
});

//Permite obtener datos guardados en cache, ya sea guardados manualmente o guardados por otros enpoints.
app.get("/api/log", async (req, res) => {
  try {
    const cachedData = accessTokenCache.get(req?.query?.cache ?? "cache");
    return res.json({ cachedData });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error en la solicitud.",
      error: error.message,
    });
  }
});
//Permite guardar datos guardados en cache manualmente.
app.post("/api/log", async (req, res) => {
  try {
    accessTokenCache.set(req?.query?.cache ?? "cache", req.body);
    return res.json({ ok: 1, data: req.body });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error en la solicitud.",
      error: error.message,
    });
  }
});

//Enpoint que se ejecuta desde avechat después de crear un nuevo usuario.
// Esta función crea e contacto en **hubspot**, luego crear una empresa(con los mismo datos del usuario), luego crear o conecta con un **lead en ave** y asigna un asesor comercial y logístico en caso de que lo tenga en ave, termina guardando dichos datos en avechat
app.post("/api/callback/ave-chat/create-contact", async (req, res) => {
  // "id": "573103557200",
  // "account_id": "1052476",
  // "page_id": "1052476",
  // "external_id": "",
  // "first_name": "Francisco",
  // "last_name": "",
  // "full_name": "Francisco",
  // "channel": "5",
  // "email": "",
  // "phone": "+573103557200",
  // "profile_pic": "",
  // "locale": "es_CO",
  // "gender": "2",
  // "timezone": "-5",
  // "last_sent": "0",
  // "last_delivered": "1741903671520",
  // "last_seen": "1741903672000",
  // "last_interaction": "1741903672000",
  // "subscribed_date": "2025-03-13 22:07:52",
  // "subscribed": "1"

  const _cache = {};

  const sCache = (key, d) => {
    _cache[key] = d;
    accessTokenCache.set("/api/callback/ave-chat/create-contact", _cache);
  };
  sCache("body", req.body);

  try {
    let userHubspot = await hubspot.getConctactByKeyValue({
      key: "phone",
      value: "+" + req.body.id,
    });
    sCache("getConctactByKeyValue", req.userHubspot);
    if (!userHubspot?.id) {
      userHubspot = await hubspot.crearContact({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: "+" + req.body.id,
      });
      sCache("crearContact", req.userHubspot);
    }

    const id_hs = userHubspot?.id;
    let companyHubspot = await hubspot.getCompanyByKeyValue({
      key: "phone",
      value: "+" + req.body.id,
    });
    sCache("getCompanyByKeyValue", req.companyHubspot);
    if (!companyHubspot?.id) {
      companyHubspot = await hubspot.crearCompany({
        id_hs,
        name: req?.body?.first_name,
        phone: "+" + req?.body?.id,
      });
      sCache("crearCompany", req.companyHubspot);
    }
    const id_company_hs = companyHubspot?.id;
    const url_hs = `https://app.hubspot.com/contacts/47355542/contact/${id_hs}/`;
    if (!id_hs) {
      throw new Error("user hubspot not created");
    }
    const code = req?.body?.locale?.split?.("_")?.[1] ?? "";
    const country = await csc.getCountrysByCode({ code });
    const indicativo_telefono = country?.code_phone ?? "";
    const phone = prosesingPhone(
      `+${req.body.id}`.replaceAll(indicativo_telefono, "")
    );
    sCache(" ave.crearLead body", {
      id_aveChat: req.body.id,
      name: `${req.body.first_name} ${req.body.last_name}`,
      phone,
      id_hs,
      indicativo_telefono,
      id_company_hs,
    });
    const userAve = await ave.crearLead({
      id_aveChat: req.body.id,
      name: `${req.body.first_name} ${req.body.last_name}`,
      phone,
      id_hs,
      indicativo_telefono,
      id_company_hs,
    });
    sCache(" ave.crearLead result", userAve);
    const id_empresa_ave = userAve?.data?.company?.idempresa;
    const id_user_ave = userAve?.data?.lead?.id;
    const url_ave_pre_register = userAve?.data?.lead?.urlPreRegister;
    const idAssessor = userAve?.data?.lead?.idAssessor;
    const idlogistico = userAve?.data?.company?.idlogistico;

    if (!id_user_ave && !id_empresa_ave) {
      throw new Error("user ave not created");
    }
    const asesor_comercial = ASESORES.find((e) => e.id == idAssessor);
    const asesor_logistico = ASESORES.find((e) => e.id == idlogistico);

    const email_asesor_logistico = asesor_logistico?.dscorreo;

    const email_asesor_comercial = asesor_comercial?.dscorreo;

    sCache(" aveChat.saveCustomFields body", {
      user_id: req.body.id,
      obj: {
        id_hs,
        id_company_hs,
        url_hs,
        id_user_ave,
        id_lead: id_user_ave,
        url_ave_pre_register,
        id_empresa_ave,
        email_asesor_logistico,
        email_asesor_comercial,
      },
    });
    const resultAveChatSaveFields = await aveChat.saveCustomFields({
      user_id: req.body.id,
      obj: {
        id_hs,
        id_company_hs,
        url_hs,
        id_user_ave,
        id_lead: id_user_ave,
        url_ave_pre_register,
        id_empresa_ave,
        email_asesor_logistico,
        email_asesor_comercial,
      },
    });
    sCache(" aveChat.saveCustomFields result", resultAveChatSaveFields);

    return res.json({
      success: true,
      message: "✅ Contacto creado correctamente.",
    });
  } catch (error) {
    sCache(" error", {
      message: error.message,
      ...error,
    });
    return res.status(500).json({
      success: false,
      message: "❌ Error al crear el contacto.",
      error: error.message,
    });
  }
});

//Enpoint para crear un contacto en avechat manualmente y asignarle asesor comercial
app.post("/api/ave-chat/create-contact", async (req, res) => {
  try {
    const id_user_ave = req.body.id;
    const url_ave_pre_register = req.body.url_ave_pre_register;
    const id_hs = req.body.id_hs;
    const email_asesor_comercial = req.body.email_asesor_comercial;
    const url_hs = `https://app.hubspot.com/contacts/47355542/contact/${id_hs}/`;
    const userAveChat = await aveChat.createUser({
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone,
    });
    const id_user_ave_chat = userAveChat?.data?.id;
    const admins = await aveChat.getAdmin();
    const admin = admins.find((e) => e.email === email_asesor_comercial);
    const id_asesor_comercial = admin.id;

    if (!id_user_ave_chat) {
      throw new Error("user aveChat not created");
    }
    const resultAveChatSaveFields = await aveChat.saveCustomFields({
      user_id: id_user_ave_chat,
      obj: {
        id_hs,
        url_hs,
        id_user_ave,
        url_ave_pre_register,
        id_asesor_comercial,
        email_asesor_comercial,
        id_asesor_comercial_inicial: id_asesor_comercial,
        email_asesor_comercial_inicial: email_asesor_comercial,
      },
    });
    accessTokenCache.set(
      "create-contact-ave-chat-resultAveChatSaveFields",
      resultAveChatSaveFields
    );

    return res.json({
      success: true,
      message: "✅ Contacto creado correctamente.",
      data: userAveChat,
    });
  } catch (error) {
    accessTokenCache.set("create-contact-error", error);
    return res.status(500).json({
      success: false,
      message: "❌ Error al crear el contacto.",
      error: error.message,
    });
  }
});

//Enpoint para obtener el numero actual de la cola de asignación de asesor comercial.
app.get("/api/n_asesor_comercial", async (req, res) => {
  try {
    let n_asesor_comercial = await count.getCount();
    return res.json({
      success: true,
      n_asesor_comercial,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al asiganar el Asesor.",
      error: error.message,
    });
  }
});

//Enpoint para aumentar en 1 el numero actual de la cola de asignación de asesor comercial.
app.post("/api/n_asesor_comercial", async (req, res) => {
  try {
    let n_asesor_comercial = await count.getCount();
    n_asesor_comercial++;
    if (n_asesor_comercial >= 5) {
      n_asesor_comercial = 1;
    }
    await count.setCount(n_asesor_comercial);
    return res.json({
      success: true,
      n_asesor_comercial,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al asiganar el Asesor.",
      error: error.message,
    });
  }
});

//Enpoint para asignar asesor comercial con la cola de asignación .
app.post(
  "/api/callback/ave-chat/asignar-asesor-comercial",
  async (req, res) => {
    try {
      const list_asesor_comercial = [
        "comercial1@aveonline.co",
        "daniela.gomez@aveonline.co",
        // "comercial2@aveonline.co",
        "comercial3@aveonline.co",
      ];
      let n_asesor_comercial = await count.getCount();
      n_asesor_comercial++;
      if (n_asesor_comercial >= list_asesor_comercial.length + 1) {
        n_asesor_comercial = 1;
      }

      const admins = await aveChat.getAdmin();

      //COMERCIAL
      // MARIA CAROLINA CORDOBA CALLEJAS	ASESOR COMERCIAL 	comercial1@aveonline.co
      // DANIELA GOMEZ ISAZA	ASESOR COMERCIAL 	daniela.gomez@aveonline.co
      // JUAN MANUEL YEPES RODRIGUEZ	ASESOR COMERCIAL 	comercial3@aveonline.co

      //LOGISTICO
      // ANDRES FELIPE MOLINA ARROYAVE	ANALISTA SERVICIO AL CLIENTE	sc13@aveonline.co
      // SANTIAGO CASTAÑO ARBOLEDA 	ANALISTA SERVICIO AL CLIENTE	sc12@aveonline.co
      // LAURA GALEANO BETANCUR	ANALISTA SERVICIO AL CLIENTE	sc11@aveonline.co
      // AMALIA GARCIA	ANALISTA SERVICIO AL CLIENTE	sc2@aveonline.co
      // JHOANA ANDREA PINEDA MUÑOZ	ANALISTA SERVICIO AL CLIENTE	jhoana.pineda@aveonline.co
      // ALEJANDRA MURIEL MOLINA	ANALISTA SERVICIO AL CLIENTE	sc3@aveonline.co

      const email_asesor_comercial =
        list_asesor_comercial?.[n_asesor_comercial - 1];

      const admin = admins.find((e) => e.email === email_asesor_comercial);

      const id_asesor_comercial = admin.id;

      const result = await aveChat.saveCustomFields({
        user_id: req.body.id,
        obj: {
          n_asesor_comercial,
          id_asesor_comercial,
          id_asesor_comercial_inicial: id_asesor_comercial,
          email_asesor_comercial,
          email_asesor_comercial_inicial: email_asesor_comercial,
        },
      });
      await count.setCount(n_asesor_comercial);

      return res.json({
        success: true,
        message: "✅ Asesor asignado correctamente.",
        result,
      });
    } catch (error) {
      accessTokenCache.set("create-contact-error", error);
      return res.status(500).json({
        success: false,
        message: "❌ Error al asiganar el Asesor.",
        error: error.message,
      });
    }
  }
);

//Enpoint para asignar asesor logistico con la cola de asignación.
app.post(
  "/api/callback/ave-chat/asignar-asesor-logistico",
  async (req, res) => {
    try {
      let n_asesor_logistico = await count.getCount("logistico");
      n_asesor_logistico++;
      const list_asesor_logistico = [
        "sc13@aveonline.co",
        "sc12@aveonline.co",
        "sc11@aveonline.co",
        "sc2@aveonline.co",
        "sc1@aveonline.co",
        "sc3@aveonline.co",
      ];
      if (n_asesor_logistico >= list_asesor_logistico.length + 1) {
        n_asesor_logistico = 1;
      }

      const admins = await aveChat.getAdmin();

      const email_asesor_logistico =
        list_asesor_logistico?.[n_asesor_logistico - 1];
      const admin = admins.find((e) => e.email === email_asesor_logistico);
      // throw {admin}

      const id_asesor_logistico = admin.id;

      // throw {id_asesor_logistico,id:req.body.id}
      const result = await aveChat.saveCustomFields({
        user_id: req.body.id,
        obj: {
          // n_asesor_logistico,
          id_asesor_logistico,
          // id_asesor_logistico_inicial: id_asesor_logistico,
          email_asesor_logistico,
          name_asesor_logistico: admin.full_name,
          // email_asesor_logistico_inicial: email_asesor_logistico,
        },
      });
      await count.setCount(n_asesor_logistico, "logistico");

      return res.json({
        success: true,
        message: "✅ Asesor asignado correctamente.",
        result,
      });
    } catch (error) {
      accessTokenCache.set("create-contact-error", error);
      return res.status(500).json({
        success: false,
        message: "❌ Error al asiganar el Asesor.",
        error: error.message,
        err: error,
      });
    }
  }
);

// Enpoint para asignar asesor logistico pasado por parametros.
app.post("/api/ave-chat/asignar-asesor-logistico", async (req, res) => {
  try {
    const user_id = req.body.id;
    const email_asesor_logistico = req.body.email_asesor_logistico;
    const admins = await aveChat.getAdmin();

    const admin = admins.find((e) => e.email === email_asesor_logistico);

    const id_asesor_logistico = admin.id;
    const resultAveChatSaveFields = await aveChat.saveCustomFields({
      user_id: user_id,
      obj: {
        email_asesor_logistico,
        id_asesor_logistico,
      },
    });
    cacheNotExpire.set(
      "asignar-asesor-logistico-resultAveChatSaveFields",
      resultAveChatSaveFields
    );
    return res.json({
      success: true,
      message: "✅ Asesor asignado correctamente.",
    });
  } catch (error) {
    accessTokenCache.set("create-contact-error", error);
    return res.status(500).json({
      success: false,
      message: "❌ Error al asiganar el Asesor.",
      error: error.message,
    });
  }
});

//Enpoint para guardar el chat del usuario en hubspot tomando la variable **all_chat** y validando con **time_last_input** si x mensaje ya se guardo en hubspot.
app.post("/api/ave-chat/save-all-chat", async (req, res) => {
  try {
    accessTokenCache.set("chat-request", {
      query: req.query,
      body: req.body,
    });
    const type = req.query.type; //logistico | comercial | cartera
    const id_hs = req.body.id_hs;
    const user_id = req.body.user_id;
    const time_last_input = req.body.time_last_input;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const userName = `${first_name ?? ""} ${last_name ?? ""}`;
    const email_asesor_cartera = req.body.email_asesor_cartera;
    const email_asesor_comercial = req.body.email_asesor_comercial;
    const email_asesor_logistico = req.body.email_asesor_logistico;

    const email_asesor =
      type == "comercial"
        ? email_asesor_comercial
        : type == "cartera"
        ? email_asesor_cartera
        : email_asesor_logistico;

    const admins = await aveChat.getAdmin();
    const admin = admins.find((e) => e.email === email_asesor);
    const adminName = `${admin?.first_name ?? ""} ${admin?.last_name ?? ""}`;

    let all_chat = `${req?.body?.all_chat ?? ""}`.split("\n\n").map((e) => {
      const a = e.split(/ \(|\): /);
      const user = `${a[0]}`
        .replaceAll("Yo", adminName)
        .replaceAll("Usuario", userName);
      const time = a[1];
      const text = a[2];
      return {
        user,
        time,
        text,
      };
    });
    if (time_last_input) {
      const timeLastInput = new Date(time_last_input);
      all_chat = all_chat.filter((chat) => {
        const chatTime = new Date(
          chat.time.replace(
            /(\d{4}-\d{2}-\d{2}) (\d{1,2}:\d{2})(am|pm)/,
            (_, date, time, meridian) => {
              let [hours, minutes] = time.split(":").map(Number);
              if (meridian === "pm" && hours !== 12) hours += 12;
              if (meridian === "am" && hours === 12) hours = 0;
              return `${date}T${String(hours).padStart(
                2,
                "0"
              )}:${minutes}:00-05:00`; // Asumiendo zona horaria -05:00
            }
          )
        );
        return chatTime >= timeLastInput;
      });
    }

    const associationTypeId = parseInt(ASSOCIATION_TYPE_ID);
    const listCreateChat = all_chat.map(async (msg) => {
      return await hubspot.crearNote({
        associationTypeId,
        contactId: id_hs,
        message: msg.text,
        user: msg.user,
      });
    });
    const listCreateChatResult = await Promise.all(listCreateChat);

    return res.json({
      success: true,
      message: "✅ Chat guardador correctamente.",
      listCreateChatResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al guardar el Chat.",
      error: error.message,
    });
  }
});

//Enpoint para guardar variables personalizadas en un usuario.
app.post("/api/ave-chat/change-custom-field", async (req, res) => {
  try {
    const user_id = req?.body?.user_id;
    if (!user_id) {
      throw new Error("user_id is required");
    }
    const fields = req?.body?.fields;
    if (!fields) {
      throw new Error("fields is required");
    }

    const result = await aveChat.saveCustomFields({
      user_id: user_id,
      obj: fields,
    });

    return res.json({
      success: true,
      message: "✅ Campos guardados correctamente.",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al guardar los Campos.",
      error: error.message,
    });
  }
});

//Enpoint para enviar un mensaje a un usuario.
app.post("/api/ave-chat/send-message", async (req, res) => {
  try {
    const user_id = req?.body?.user_id;
    if (!user_id) {
      throw new Error("user_id is required");
    }
    const message = req?.body?.message;
    if (!message) {
      throw new Error("message is required");
    }

    const result = await aveChat.sendMessage({
      user_id,
      message,
      flow_id: FLOW_ID,
    });

    return res.json({
      success: true,
      message: "✅ Mensaje enviado correctamente.",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al enviar mensaje.",
      error: error.message,
    });
  }
});

//Enpoint que se ejecuta al enviar un mensaje a trabes de hubspot por medio de custon action "Avechat", este mensaje es almacenado y enviado al usuario por medio de avechat.
app.post("/api/callback/hubspot/send-message", async (req, res) => {
  //   {
  //     "callbackId": "ap-47355542-1589400750477-3-0",
  //     "origin": {
  //         "portalId": 47355542,
  //         "actionDefinitionId": 201903771,
  //         "actionDefinitionVersion": 4,
  //         "actionExecutionIndexIdentifier": {
  //             "enrollmentId": 1589400750477,
  //             "actionExecutionIndex": 0
  //         },
  //         "extensionDefinitionId": 201903771,
  //         "extensionDefinitionVersionId": 4
  //     },
  //     "context": {
  //         "workflowId": 1640937852,
  //         "actionId": 3,
  //         "actionExecutionIndexIdentifier": {
  //             "enrollmentId": 1589400750477,
  //             "actionExecutionIndex": 0
  //         },
  //         "source": "WORKFLOWS"
  //     },
  //     "object": {
  //         "objectId": 108456792064,
  //         "objectType": "CONTACT"
  //     },
  //     "fields": {
  //         "message": "test message"
  //     },
  //     "inputFields": {
  //         "message": "test message"
  //     }
  // }
  try {
    accessTokenCache.set("ssss", req.body);
    const id_hs = req?.body?.object?.objectId;
    const objectType = req?.body?.object?.objectType;
    accessTokenCache.set("id_hs", id_hs);
    if (!id_hs) {
      throw new Error("object.objectId is required");
    }
    const message =
      req?.body?.fields?.message ?? req?.body?.inputFields?.message;
    if (!message) {
      throw new Error("inputFields.message is required");
    }
    //         "objectType": "CONTACT"
    let userHs;
    if (objectType == "CONTACT") {
      userHs = await hubspot.getConctactById({ ID: id_hs });
    } else {
      userHs = await hubspot.getCompanytById({ ID: id_hs });
    }

    if (!userHs) {
      throw new Error("object.objectId is invalid");
    }
    const prosesingPhone = (phone) => `${phone ?? ""}`.replace(/\D/g, "");
    const user_id = prosesingPhone(userHs?.properties?.phone);

    if (!user_id) {
      throw new Error("object.objectId is invalid");
    }

    const result = await aveChat.sendMessage({
      user_id,
      message,
      flow_id: FLOW_ID,
    });

    return res.json({
      success: true,
      message: "✅ Mensaje enviado correctamente.",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al enviar mensaje.",
      error: error.message,
    });
  }
});

app.post("/api/ave-chat/validate-date", async (req, res) => {
  try {
    const options = { timeZone: "America/Bogota", hour12: false };
    const now = new Date();

    // Obtener el día de la semana y la hora en zona horaria de Colombia
    const day = new Intl.DateTimeFormat("en-US", {
      ...options,
      weekday: "short",
    }).format(now);
    const timeString = new Intl.DateTimeFormat("en-US", {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    // Convertir el día a número (domingo = 0, lunes = 1, ..., sábado = 6)
    const daysMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayNumber = daysMap[day];

    // Convertir la hora a minutos
    const [hour, minute] = timeString.split(":").map(Number);
    const time = hour * 60 + minute;

    if (dayNumber === 0 || dayNumber === 6) {
      throw new Error("Día inválido");
    }

    if (time < 7 * 60 + 30 || time > 17 * 60 + 30) {
      throw new Error("Horario inválido");
    }

    return res.json({
      success: true,
      message: "✅ Horario correcto.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error, Horario Incorrecto.",
      error: error.message,
    });
  }
});

//Enpoint para crear company en hubspot.
app.post("/api/hubspot/create-company", async (req, res) => {
  try {
    const result = await hubspot.crearCompany({
      id_hs: req?.body?.id_hs,
      name: req?.body?.name,
      phone: req?.body?.phone,
    });
    return res.json({
      success: true,
      message: "✅ Company creado correctamente.",
      result,
    });
  } catch (error) {
    accessTokenCache.set("create-contact-error", error);
    return res.status(500).json({
      success: false,
      message: "❌ Error al crear el Company.",
      error: error.message,
    });
  }
});

//Enpoint que se ejecuta cuando se crea un usuario en hubspot, este crear el contacto en avechat si no existe.
app.post("/api/callback/hubspot/create-conctact", async (req, res) => {
  try {
    accessTokenCache.set(req?.query?.cache ?? "create-conctact", req.body);
    const data = req?.body ?? {};
    if (data?.context?.workflowId != 1645463712) {
      throw new Error("workflowId invalid");
    }
    const id_hs = data?.object?.objectId;
    const first_name = data?.object?.properties?.firstname ?? "";
    const last_name = data?.object?.properties?.lastname ?? "";
    const phone = data?.object?.properties?.phone ?? "";
    const email = data?.object?.properties?.email;
    const id_avechat = `${phone}`.replace(/\D/g, "");
    const url_hs = `https://app.hubspot.com/contacts/47355542/contact/${id_hs}/`;

    const result = await aveChat.createUserIfNotExist({
      id_avechat,
      phone,
      email,
      first_name,
      last_name,
      id_hs,
      url_hs,
    });

    return res.json({
      success: true,
      message: "✅ Contact creado correctamente.",
      result,
    });
  } catch (error) {
    accessTokenCache.set("create-contact-error", error);
    return res.status(500).json({
      success: false,
      message: "❌ Error al crear el Contact.",
      error: error.message,
    });
  }
});

//Enpoint que se ejecuta cuando se cambia el **NIT** en avechat, busca una company que tenga ese nit como documento, si al encuentra tomas su asesor comercial y logístico, y se lo asigna en avechat.
app.post("/api/callback/ave-chat/change-nit", async (req, res) => {
  try {
    const NIT = req?.body?.NIT ?? "";
    const phone = req?.body?.phone ?? "";
    const contact_id = req?.body?.id_hs ?? "";
    if (contact_id == "" || NIT == "") {
      throw new Error("Body Invalid");
    }
    const id_avechat = phone?.replaceAll("+", "");
    const company = await hubspot.getCompanyByNIT({ NIT });
    const company_id = company?.id;
    const id_asesor_logistico_hs = company?.properties?.asesor_logistico;
    const id_asesor_comercial_hs = company?.properties?.hubspot_owner_id;

    const association = await hubspot.asignarCompanyToContact({
      company_id,
      contact_id,
    });

    const asesorLogistico = ASESORES.find(
      (e) => e.hubspot == id_asesor_logistico_hs
    );

    const asesorComercial = ASESORES.find(
      (e) => e.hubspot == id_asesor_comercial_hs
    );
    const asignarAsesorLogistico = {};
    if (asesorLogistico || asesorComercial) {
      const url_company_hs = company_id
        ? `https://app.hubspot.com/contacts/47355542/company/${company_id}/`
        : null;

      asignarAsesorLogistico.fields = await aveChat.saveCustomFields({
        user_id: id_avechat,
        obj: {
          id_company_hs: company_id,
          url_company_hs,

          name_asesor_logistico: asesorLogistico?.dsnombre,
          email_asesor_logistico: asesorLogistico?.dscorreo,
          id_asesor_logistico: asesorLogistico?.id,
          id_asesor_logistico_hs,

          name_asesor_comercial: asesorComercial?.dsnombre,
          email_asesor_comercial: asesorComercial?.dscorreo,
          id_asesor_comercial: asesorComercial?.id,
          id_asesor_comercial_hs: asesorComercial?.hubspot,
        },
      });
      asignarAsesorLogistico.asignacion = await aveChat.asignarAsesor({
        user_id: id_avechat,
      });
    }

    return res.json({
      success: true,
      message: "✅ Asignacion correcta.",
      association,
      asignarAsesorLogistico,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error, Asignacion Incorrecta.",
      error: error.message,
      err: error,
    });
  }
});

//Enpoint para cambiar el **NIT** y **id_company_hs** manualmente .
app.post("/api/ave-chat/change-nit", async (req, res) => {
  try {
    const phone = req?.body?.phone ?? "";
    const NIT = req?.body?.NIT ?? "";
    const id_company_hs = req?.body?.id_company_hs ?? "";
    if (phone == "" || id_company_hs == "" || NIT == "") {
      throw new Error("Body Invalid");
    }
    const url_company_hs = `https://app.hubspot.com/contacts/47355542/company/${id_company_hs}/`;

    const result = await aveChat.saveCustomFields({
      user_id: phone,
      obj: {
        NIT,
        id_company_hs,
        url_company_hs,
      },
    });
    if (!result?.every((e) => e?.success === true)) {
      throw new Error("TIMEOUT");
    }

    return res.json({
      success: true,
      message: "✅ NIT Actualizado.",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error, Al Actualizar NIT.",
      error: error.message,
    });
  }
});

//Enpoint que se ejecuta al enviar un tempate a trabes de hubspot por medio de custon action "Avechat Enviar Template", este mensaje es almacenado y enviado al usuario por medio de avechat campañas.
app.post("/api/callback/hubspot/send-message-template", async (req, res) => {
  try {
    const id_hs = req?.body?.object?.objectId;
    const objectType = req?.body?.object?.objectType;
    accessTokenCache.set("id_hs", id_hs);
    // throw 1
    if (!id_hs) {
      throw new Error("object.objectId is required");
    }
    const template =
      req?.body?.fields?.template ?? req?.body?.inputFields?.template;
    if (!template) {
      throw new Error("inputFields.template is required");
    }

    let userHs;
    if (objectType == "CONTACT") {
      userHs = await hubspot.getConctactById({ ID: id_hs });
    } else {
      userHs = await hubspot.getCompanytById({ ID: id_hs });
    }
    if (!userHs) {
      throw new Error("object.objectId is invalid");
    }
    const prosesingPhone = (phone) => `${phone ?? ""}`.replace(/\D/g, "");
    const user_id = prosesingPhone(userHs?.properties?.phone);

    if (!user_id) {
      throw new Error("phone is invalid");
    }

    const result = await aveChatCampana.sendMessageTemplate({
      user_id,
      id_template: template,
      flow_id: FLOW_ID_CAMPANA,
    });

    return res.json({
      success: true,
      message: "✅ Mensaje enviado correctamente.",
      result,
      user_id,
      id_template: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error al enviar mensaje.",
      // err:error,
      error: error.message,
    });
  }
});

//Enpoint que se ejecuta desde avechat después de crear un nuevo usuario.
// Esta función crea e contacto en **hubspot**, luego crear una empresa(con los mismo datos del usuario), luego crear o conecta con un **lead en ave** y asigna un asesor comercial y logístico en caso de que lo tenga en ave, termina guardando dichos datos en avechat
app.post("/api/form-campana/ave-chat/create-contact", async (req, res) => {
  //   {
  //     "campana": "123",
  //     "name": "asdas",
  //     "phone": "3103557200",
  //      "code":"+57"
  // }
  // return res.status(200).json({
  //   success: true,
  //   message: "Ok",
  // });
  const _cache = {};

  const sCache = (key, d) => {
    _cache[key] = d;
    accessTokenCache.set("/api/form-campana/ave-chat/create-contact", _cache);
  };
  sCache("body", req.body);
  try {
    const tel = `${req?.body?.code}${req?.body?.phone}`;
    const data = {
      id_avechat: `${req?.body?.code}${req?.body?.phone}`?.replace(/\D/g, ""),
      name: req?.body?.name,
      phone: req?.body?.phone?.replace(/\D/g, ""),
      indicativo_telefono: req?.body?.code,
      campana: req?.body?.campana,
    };
    const userAveChat = await aveChat.createUserIfNotExist({
      id_avechat: data.id_avechat,
      first_name: data.name,
      last_name: "",
      phone: data.phone,
    });
    if (!(userAveChat.isNew && userAveChat.create)) {
      throw new Error("user exist");
    }
    let userHubspot = await hubspot.getConctactByKeyValue({
      key: "phone",
      value: tel,
    });
    sCache("getConctactByKeyValue", req.userHubspot);
    if (!userHubspot?.id) {
      userHubspot = await hubspot.crearContact({
        first_name: data?.name,
        last_name: "",
        phone: tel,
        campana: data?.campana,
      });
      sCache("crearContact", req.userHubspot);
    }

    const id_hs = userHubspot?.id;
    let companyHubspot = await hubspot.getCompanyByKeyValue({
      key: "phone",
      value: tel,
    });
    sCache("getCompanyByKeyValue", req.companyHubspot);
    if (!companyHubspot?.id) {
      companyHubspot = await hubspot.crearCompany({
        id_hs,
        name: data.name,
        phone: tel,
        campana: data?.campana,
      });
      sCache("crearCompany", req.companyHubspot);
    }
    const id_company_hs = companyHubspot?.id;
    const url_hs = `https://app.hubspot.com/contacts/47355542/contact/${id_hs}/`;
    if (!id_hs) {
      throw new Error("user hubspot not created");
    }
    const dataCrearLead = {
      id_aveChat: data.id_avechat,
      name: data.name,
      phone: data.phone,
      id_hs,
      indicativo_telefono: data.indicativo_telefono,
      id_company_hs,
      id_campana: data?.campana,
    };
    sCache("dataCrearLead", dataCrearLead);
    const userAve = await ave.crearLead(dataCrearLead);
    sCache("userAve", userAve);
    const id_empresa_ave = userAve?.data?.company?.idempresa;
    const id_user_ave = userAve?.data?.lead?.id;
    const url_ave_pre_register = userAve?.data?.lead?.urlPreRegister;
    const idAssessor = userAve?.data?.lead?.idAssessor;
    const idlogistico = userAve?.data?.company?.idlogistico;

    if (!id_user_ave && !id_empresa_ave) {
      throw new Error("user ave not created");
    }
    const asesor_comercial = ASESORES.find((e) => e.id == idAssessor);
    const asesor_logistico = ASESORES.find((e) => e.id == idlogistico);

    const email_asesor_logistico = asesor_logistico?.dscorreo;

    const email_asesor_comercial = asesor_comercial?.dscorreo;

    const dataSaveCustomFields = {
      user_id: data.id_avechat,
      obj: {
        id_hs,
        id_company_hs,
        url_hs,
        id_user_ave,
        id_lead: id_user_ave,
        url_ave_pre_register,
        id_empresa_ave,
        email_asesor_logistico,
        email_asesor_comercial,
        campana: data?.campana,
      },
    };
    sCache("dataSaveCustomFields", dataSaveCustomFields);
    const resultAveChatSaveFields = await aveChat.saveCustomFields(
      dataSaveCustomFields
    );
    sCache("resultAveChatSaveFields", resultAveChatSaveFields);

    return res.status(200).json({
      success: true,
      message: "✅ Contacto creado correctamente.",
      data: {
        userAve,
      },
    });
  } catch (error) {
    accessTokenCache.set("/api/form-campana/ave-chat/create-contact/error", {
      success: false,
      message: "❌ Error al crear el contacto.",
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: "❌ Error al crear el contacto.",
      error: error.message,
    });
  }
});



onLoadWebhook({app})




app.listen(PORT, () =>
  console.log(`=== Starting your app on ${REDIRECT_URI} ===`)
);
