const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "تخيل",
    aliases: ["ارسم", "توليد"],
    version: "1.0",
    author: "حسين يعقوبي",
    role: 0,
    countDown: 10,
    longDescription: {
      en: "Generates an anime-style image based on the provided description."
    },
    category: "متعة",
    guide: {
      en: "{pn} <وصف الصورة>\nمثال: {pn} فتاة لطيفة"
    }
  },

  onStart: async function ({ args, api, event }) {
    if (args.length === 0) {
      api.sendMessage("⚠️ | يرجى إدخال وصف لتوليد الصورة.", event.threadID, event.messageID);
      return;
    }

    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    try {
      const prompt = args.join(" ");

      // ترجمة النص من العربية إلى الإنجليزية إذا لزم الأمر
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

      // استخدام رابط API الجديد
      const apiUrl = `https://kaiz-apis.gleeze.com/api/flux-1.1-pro?prompt=${encodeURIComponent(translatedPrompt)}`;
      const startTime = Date.now();

      // إرسال طلب لجلب الصورة مباشرة عبر stream
      const imageResponse = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;
      const timeString = moment.tz(endTime, "Africa/Casablanca").format("hh:mm:ss A");
      const dateString = moment.tz(endTime, "Africa/Casablanca").format("YYYY-MM-DD");

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      await api.sendMessage({
        body: `✅❪𝒈𝒆𝒏𝒆𝒓𝒂𝒕𝒆𝒅 𝒔𝒖𝒄𝒄𝒆𝒔𝒔𝒇𝒖𝒍𝒍𝒚❫✅\n\n⌬︙𝒆𝒙𝒆𝒄𝒖𝒕𝒊𝒐𝒏 𝒕𝒊𝒎𝒆 ➭『${executionTime}』s\n⌬︙𝖙𝖎𝖒𝖊 ➭『${timeString}』\n⌬︙𝖉𝖆𝖙𝖊 ➭『${dateString}』`,
        attachment: imageResponse.data
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | حدث خطأ. يرجى المحاولة لاحقاً.", event.threadID, event.messageID);
    }
  }
};
