function hi() {
  console.log("Hello World!");
}
hi();
const {
  cmd
} = require('../command');
const axios = require("axios");
const fs = require('fs');
const path = require("path");
const fetchJson = async _0x43bc12 => {
  try {
    const _0x41beb2 = await axios.get(_0x43bc12);
    return _0x41beb2.data;
  } catch (_0x2745ae) {
    console.error("fetchJson Error: " + _0x2745ae.message);
    if (_0x2745ae.response) {
      console.error("Response Status: " + _0x2745ae.response.status);
      console.error("Response Data: " + JSON.stringify(_0x2745ae.response.data, null, 0x2));
    }
    return null;
  }
};
cmd({
  'pattern': "xdownload",
  'alias': ["xnxxdl", "xxx"],
  'react': '📥',
  'desc': "Download videos from Xvideos.",
  'category': "utility",
  'filename': __filename
}, async (_0x509f29, _0x3fdef7, _0x3a57db, {
  q: _0x1beb9,
  reply: _0x1703bd
}) => {
  try {
    if (!_0x1beb9) {
      return _0x1703bd("❌ Please provide a valid Xvideos URL.");
    }
    const _0x14fdaf = "https://api.giftedtech.web.id/api/download/xvideosdl?apikey=gifted&url=" + encodeURIComponent(_0x1beb9);
    console.log("Requesting API with URL:", _0x14fdaf);
    const _0x409351 = await fetchJson(_0x14fdaf);
    if (!_0x409351 || !_0x409351.result) {
      console.error("❌ Failed to fetch video. Please check the URL or try again later.");
      return _0x1703bd("❌ Failed to fetch video. Please check the URL or try again later.");
    }
    const _0x16da0a = _0x409351.result;
    const _0x2f57fa = _0x16da0a.download_url;
    const _0x2c9ae2 = _0x16da0a.title.replace(/[<>:"/\\|?*]/g, '');
    const _0x2ed21c = path.join(__dirname, _0x2c9ae2 + '.mp4');
    console.log("Subzero Downloading video...");
    const _0x687ec7 = await axios({
      'url': _0x2f57fa,
      'method': 'GET',
      'responseType': 'stream'
    });
    const _0x5279e9 = fs.createWriteStream(_0x2ed21c);
    _0x687ec7.data.pipe(_0x5279e9);
    await new Promise((_0x466c78, _0x4aa2bf) => {
      _0x5279e9.on("finish", _0x466c78);
      _0x5279e9.on("error", _0x4aa2bf);
    });
    console.log("Subzero downloaded video successfully: " + _0x2ed21c);
    await _0x509f29.sendMessage(_0x3a57db.chat, {
      'video': fs.readFileSync(_0x2ed21c),
      'caption': "*`NIMA-MD XVIDEOS` \n\n🎥 *Title:* " + _0x16da0a.title + "\n👀 *Views:* " + _0x16da0a.views + "\n👍 *Likes:* " + _0x16da0a.likes
    });
    fs.unlinkSync(_0x2ed21c);
    console.log("Video sent and file cleaned up.");
  } catch (_0x5a8d55) {
    console.error("Unexpected Error:", _0x5a8d55.message);
    return _0x1703bd("❌ An error occurred while processing your request. Please try again.");
  }
});
