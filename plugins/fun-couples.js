function hi() {
  console.log("Hello World!");
}
hi();
const {
  cmd,
  commands
} = require("../command");
const axios = require("axios");
cmd({
  'pattern': "couplepp",
  'alias': ["couple", "cpp"],
  'react': '💑',
  'desc': "Get a male and female couple profile picture.",
  'category': 'image',
  'use': ".couplepp",
  'filename': __filename
}, async (_0x50edc5, _0xc5df33, _0x1b198a, {
  from: _0x4da616,
  args: _0x15071c,
  reply: _0x59b37a
}) => {
  try {
    _0x59b37a("*💑 Fetching couple profile pictures...*");
    const _0xb820c3 = await axios.get("https://api.davidcyriltech.my.id/couplepp");
    if (!_0xb820c3.data || !_0xb820c3.data.success) {
      return _0x59b37a("❌ Failed to fetch couple profile pictures. Please try again later.");
    }
    const _0x355e74 = _0xb820c3.data.male;
    const _0x4470cd = _0xb820c3.data.female;
    if (_0x355e74) {
      await _0x50edc5.sendMessage(_0x4da616, {
        'image': {
          'url': _0x355e74
        },
        'caption': "👨 Male Couple Profile Picture By Nima"
      }, {
        'quoted': _0xc5df33
      });
    }
    if (_0x4470cd) {
      await _0x50edc5.sendMessage(_0x4da616, {
        'image': {
          'url': _0x4470cd
        },
        'caption': "👩 Female Couple Profile Picture By Nima"
      }, {
        'quoted': _0xc5df33
      });
    }
  } catch (_0x305b06) {
    console.error(_0x305b06);
    _0x59b37a("❌ An error occurred while fetching the couple profile pictures.");
  }
});
