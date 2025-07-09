
const onWebhookGetLog =
  ({
    getCache,
  }) =>
  async (req, res) => {
    const data = getCache(req?.query?.cache ?? "cache")
    try {
      const respond = {
        success: true,
        message: "✅ Log",
        data
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
