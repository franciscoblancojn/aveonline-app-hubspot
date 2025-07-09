const onWebhookTest =
  ({
    setCache,
  }) =>
  async (req, res) => {
    const body = req.body;
    setCache("body", body);
    try {

      const respond = {
        success: true,
        message: "✅ Test",
      };
      setCache("respond", respond);
      return res.status(200).json(respond);
    } catch (error) {
      const err = {
        success: false,
        message: error.message ?? error ?? "❌ Error al enviar el message.",
        error: error,
      };
      setCache("error", err);
      return res.status(500).json(err);
    }
  };
const onWebhookGetTest =
  ({
    getCache,
  }) =>
  async (req, res) => {
    const data = getCache()
    try {
      const respond = {
        success: true,
        message: "✅ Test",
        data
      };
      return res.status(200).json(respond);
    } catch (error) {
      const err = {
        success: false,
        message: error.message ?? error ?? "❌ Error al enviar el message.",
        error: error,
      };
      return res.status(500).json(err);
    }
  };

module.exports = {
  onWebhookTest,
  onWebhookGetTest,
};
