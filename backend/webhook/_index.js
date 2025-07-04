const { AppBase } = require("../base");
const { onWebhookSendMessage } = require("./send-message");


class AppWebhook extends AppBase {

  onLoadSendMessage = ({app}) => {
    const path = "/api/webhook/send-message";
    const sCache = this.sCache(path);
    app.post(path, onWebhookSendMessage({ 
        sCache ,
        aveChatLineaEstandar: this.aveChatLineaEstandar,
        prosesingPhone: this.prosesingPhone,
        ifExistAvechat: this.ifExistAvechat("linea_estandar"),
        onCreateUserAvechatIfNotExist: this.onCreateUserAvechatIfNotExist("linea_estandar"),
        createUser:this.aveChatLineaEstandar.createUser.bind(this.aveChatLineaEstandar),
        onGetUser: this.onGetUser("linea_estandar"),
        onCreateUser:this.onCreateUser("linea_estandar"),
        onUpdateUser:this.onUpdateUser("linea_estandar")
    }));
  }

  onLoad({ app }) {
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
