const axios = require('axios');
const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "movieinfo",
    desc: "Fetch detailed information about a movie.",
    category: "utility",
    react: "🎞️",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const movieName = args.join(' ');
        if (!movieName) return reply("📽️ Please provide the name of the movie.");

        if (!config.OMDB_API_KEY) return reply("❌ OMDB API key not configured.");

        const apiUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${config.OMDB_API_KEY}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!response || data.Response === "False") return reply("❌ Movie not found.");

        const movieInfo = `
*🎬 NIMA-MD-V1 MOVIE SEARCH 🎬*

*ᴛɪᴛʟᴇ:* ${data.Title}
*ʏᴇᴀʀ:* ${data.Year}
*ʀᴀᴛᴇᴅ:* ${data.Rated}
*ʀᴇʟᴇᴀꜱᴇᴅ:* ${data.Released}
*ʀᴜɴᴛɪᴍᴇ:* ${data.Runtime}
*ɢᴇɴʀᴇ:* ${data.Genre}
*ᴅɪʀᴇᴄᴛᴏʀ:* ${data.Director}
*ᴡʀɪᴛᴇʀ:* ${data.Writer}
*ᴀᴄᴛᴏʀꜱ:* ${data.Actors}
*ʟᴀɴɢᴜᴀɢᴇ:* ${data.Language}
*ᴄᴏᴜɴᴛʀʏ:* ${data.Country}
*ᴀᴡᴀʀᴅꜱ:* ${data.Awards}
*ɪᴍᴅʙ ʀᴀᴛɪɴɢ:* ${data.imdbRating}
*ᴘʟᴏᴛ:* ${data.Plot}

> POWERED BY LOKU NIMA 1V
`;

        const imageUrl = (data.Poster && data.Poster !== 'N/A') ? data.Poster : config.ALIVE_IMG || 'https://i.imgur.com/placeholder.png';

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `${movieInfo}\n> CREATED BY LOKU NIMA`
        }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});
