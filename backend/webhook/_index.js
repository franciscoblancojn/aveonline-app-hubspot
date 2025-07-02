const { AppBase } = require("../base");
const { onWebhookSendMessage } = require("./send-message");


class AppWebhook extends AppBase {

  onLoadSendMessage = ({app}) => {
    const path = "/api/webhook/send-message";
    const sCache = this.sCache(path);
    app.post(path, onWebhookSendMessage({ 
        sCache ,
        aveChat: this.aveChat,
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
