const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "delete",
    react: "🧹",
    alias: ["del"],
    desc: "delete message",
    category: "group",
    use: '.del',
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, isGroup, isOwner, isAdmins, isBotAdmins, reply
}) => {
    if (!isGroup) return reply('❌ This command can only be used in groups.');
    
    if (!(isOwner || isAdmins)) return reply('❌ You must be a group admin or bot owner to use this command.');

    if (!isBotAdmins) return reply('❌ I need to be a group admin to delete messages.');

    if (!m.quoted) return reply('❌ Please reply to a message you want to delete.');

    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: m.quoted.key.participant || m.quoted.participant || m.quoted.sender
        };

        await conn.sendMessage(m.chat, { delete: key });
    } catch (e) {
        console.error(e);
        reply('❌ Failed to delete message.');
    }
});
