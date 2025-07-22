const { AppBase } = require("../base");
const { onWebhookGetLog } = require("./log");
const { onWebhookSendMessage } = require("./send-message");
const { onWebhookTest, onWebhookGetTest } = require("./test");


class AppWebhook extends AppBase {

  onLoadSendMessage = ({app}) => {
    const path = "/api/webhook/send-message";
    const setCache = this.setCache(path);
    app.post(path, onWebhookSendMessage({ 
        setCache ,
        aveChatLineaEstandar: this.aveChatLineaEstandar,
        prosesingPhone: this.prosesingPhone,
        ifExistAvechat: this.ifExistAvechat("linea_estandar"),
        onCreateUserAvechatIfNotExist: this.onCreateUserAvechatIfNotExist("linea_estandar"),
        createUser:this.aveChatLineaEstandar.createUser.bind(this.aveChatLineaEstandar),
        contactSaveCustonField:this.aveChatLineaEstandar.contactSaveCustonField.bind(this.aveChatLineaEstandar),
        onGetUser: this.onGetUser("linea_estandar"),
        onCreateUser:this.onCreateUser("linea_estandar"),
        onUpdateUser:this.onUpdateUser("linea_estandar"),
        onGetLog:this.onGetLog,
        onCreateLog:this.onCreateLog,
    }));
  }
  onLoadTest({ app }) {
    const path = "/api/webhook/test";
    const setCache = this.setCache(path);
    const getCache = ()=>this.getCache(path);
    app.post(path, onWebhookTest({ 
        setCache ,
    }));
    app.get(path, onWebhookGetTest({ 
        setCache ,
        getCache
    }));
  }
  onLoadLog({ app }) {
    const path = "/api/webhook/log";
    app.get(path, onWebhookGetLog({ 
        
    }));
  }

  onLoad({ app }) {
    this.onLoadLog({ app });
    this.onLoadTest({ app });
    this.onLoadSendMessage({ app });
  }
}

const onLoadWebhook = ({ app }) => {
    const appWebhook = new AppWebhook();
    appWebhook.onLoad({ app });
    return appWebhook;
};
module.exports = {
  onLoadWebhook,
};
