const {db} = require("../../db");

const onWebhookGetLog =
  ({}) =>
  async (req, res) => {
    try {
      const guia = req?.query?.guia;
      if (!guia) {
        throw new Error("Guia is required");
      }
      let items = await db.onGetRows("ave_guia_send_message", {
        guia,
      });
      items = items.map((item) => {
        try {
          item.body = JSON.parse(item.body);
        } catch (error) {
          item.body = {};
        }
        return item;
      });
      const respond = {
        success: true,
        message: "✅ Log",
        items,
      };
      return res.status(200).json(respond);
    } catch (error) {
      const err = {
        success: false,
        message: error.message ?? error ?? "❌ Error Log.",
        error: error,
      };
      return res.status(500).json(err);
    }
  };

module.exports = {
  onWebhookGetLog,
};
