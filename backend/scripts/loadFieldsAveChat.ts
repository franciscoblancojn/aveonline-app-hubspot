import { AveChat } from "../avechat";

const TOKEN_AVECHAT = process.env.TOKEN_AVECHAT;
const aveChat = new AveChat(TOKEN_AVECHAT);

const main = async () => {
    const fields = await aveChat.getIdCustomFieldApi()
    await Bun.write("./backend/data/avechat-fields.js", `
          const AveChatFields = ${JSON.stringify(fields)};
        module.exports = {
            AveChatFields
        };
        `);
    
}
main()