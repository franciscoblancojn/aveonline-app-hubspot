require("dotenv").config();
const express = require("express");
const request = require("request-promise-native");
const NodeCache = require("node-cache");
const session = require("express-session");
const { AveChat } = require("./avechat.js");
const { Hubspot } = require("./hubspot.js");
const { Ave } = require("./ave.js");
const app = express();

const PORT = 3000;

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

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

const hubspot = new Hubspot(API_KEY);
const aveChat = new AveChat(TOKEN_AVECHAT);
const ave = new Ave();

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

//==========================================//
//   Exchanging Proof for an Access Token   //
//==========================================//

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
app.post("/api/log", async (req, res) => {
  try {
    accessTokenCache.set(req?.query?.cache ?? "cache", req.body);
    return res.json({ ok: 1 ,data:req.body});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error en la solicitud.",
      error: error.message,
    });
  }
});
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

  try {
    const userHubspot = await hubspot.crearContact({
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone,
    })
    accessTokenCache.set("create-contact-hubspot", userHubspot);
    const id_hs = userHubspot?.id;
    const url_hs = `https://app.hubspot.com/contacts/47355542/contact/${id_hs}/`
    if(!id_hs){
      throw new Error("user hubspot not created")
    }

    const phone = `${req.body.phone}`.replaceAll("+57","")
    const userAve = await ave.crearLead({
      id_aveChat: req.body.id,
      name: `${req.body.first_name} ${req.body.last_name}`,
      phone,
      id_hs,
    })
    const  id_user_ave = userAve?.data?.lead?.id
    const  url_ave_pre_register = userAve?.data?.lead?.urlPreRegister

    if(!id_user_ave){
      throw new Error("user ave not created")
    }

    const resultAveChatSaveFields = await aveChat.saveCustomFields({
      id_hs,
      url_hs,
      id_user_ave,
      url_ave_pre_register
    });
    accessTokenCache.set("create-contact-ave-chat-resultAveChatSaveFields", resultAveChatSaveFields);

    return res.json({
      success: true,
      message: "✅ Contacto creado correctamente.",
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

app.listen(PORT, () =>
  console.log(`=== Starting your app on ${REDIRECT_URI} ===`)
);
