import fetch from 'node-fetch';

export default {
  name: 'ghibli',
  command: ['ghibli'],
  handler: async (m, { conn }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
      return conn.reply(m.chat, 'කරුණාකර පෝටෝ එකක් quote කරලා `.ghibli` කියන්න.', m);
    }

    const imageBuffer = await q.download();
    const base64Image = imageBuffer.toString('base64');

    const payload = {
      version: "f958f1fcaa1e060c17909b6c72a1fd82e9c24f1835b46bcbe640e1c25437977b", // Ghibli-style model
      input: {
        prompt: "ghibli style",
        image: `data:image/jpeg;base64,${base64Image}`
      }
    };

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': 'r8_AnFKwnYFCLoIe54DjcdXV2YmRDEkO6R10BeAx', // <--- මෙතැනට ඔයාගේ API key එක privately දාන්න
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return conn.reply(m.chat, 'Image generate වෙන්නෙ නැහැ. පසුව උත්සහ කරන්න.', m);
    }

    const json = await res.json();

    // Polling for the result
    let output;
    for (let i = 0; i < 10; i++) {
      const poll = await fetch(json.urls.get, {
        headers: {
          'Authorization': 'r8_AnFKwnYFCLoIe54DjcdXV2YmRDEkO6R10BeAx' // <--- මෙතැනටත් ඔබේ API key එක privately යොදන්න
        }
      });
      const result = await poll.json();
      if (result.status === 'succeeded') {
        output = result.output;
        break;
      }
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!output) {
      return conn.reply(m.chat, 'පෝටෝ generate වෙන්නෙ නැහැ.', m);
    }

    await conn.sendFile(m.chat, output[0], 'ghibli.jpg', 'Ghibli-style image එක මෙන්න!', m);
  }
  }
