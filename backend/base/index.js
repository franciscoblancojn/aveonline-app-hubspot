require("dotenv").config();
const { AveChat } = require("../avechat.js");
const { Hubspot } = require("../hubspot.js");
const { Ave } = require("../ave.js");
const { CSC } = require("../csc.js");
const { Count } = require("../count.js");
const { fetch } = require("../fetch.js");
const { ASESORES } = require("../dataAcesot.js");
const NodeCache = require("node-cache");

const API_KEY = process.env.API_KEY;
const HOST = process.env.HOST;
const TOKEN_AVECHAT = process.env.TOKEN_AVECHAT;
const TOKEN_AVECHAT_LINEA_ESTANDARD = process.env.TOKEN_AVECHAT_LINEA_ESTANDARD;
const TOKEN_AVECHAT_CAMPANA = process.env.TOKEN_AVECHAT_CAMPANA;
const FLOW_ID = process.env.FLOW_ID;
const FLOW_ID_CAMPANA = process.env.FLOW_ID_CAMPANA;

class AppBase {
  hubspot;
  aveChat;
  aveChatLineaEstandar;
  aveChatCampana;
  ave;
  csc;
  count;
  ASESORES;
  accessTokenCache;
    _cache = {};
  constructor() {
    this.hubspot = new Hubspot(API_KEY);
    this.aveChat = new AveChat(TOKEN_AVECHAT);
    this.aveChatLineaEstandar = new AveChat(TOKEN_AVECHAT_LINEA_ESTANDARD);
    this.aveChatCampana = new AveChat(TOKEN_AVECHAT_CAMPANA, {
      campana: true,
    });
    this.ave = new Ave();
    this.csc = new CSC();
    this.count = new Count();
    this.ASESORES = ASESORES;
    this.accessTokenCache = new NodeCache({ deleteOnExpire: true });
  }
  prosesingPhone = (phone) => `${phone ?? ""}`.replace(/\D/g, "");
  fetch = fetch;
  sCache = (key_kache)=> (key, d) => {
    this._cache[key_kache] ??= {}
    this._cache[key_kache][key] = d;
    this.accessTokenCache.set(key_kache, this._cache[key_kache][key]);
  };
}

module.exports = {
  AppBase,
};
