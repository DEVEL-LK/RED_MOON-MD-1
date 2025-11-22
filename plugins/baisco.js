const config = require('../config')
const { cmd } = require('../command')
const axios = require('axios');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

let isUploading = false;

//================== Baiscopes Search ==================
cmd({
    pattern: "baiscopes",
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".baiscopes 2025",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isMe, isPre, isSudo, isOwner, reply }) => {
    try {
        if (!q) return await reply('*Please provide a movie name!*');

        const API_KEY = "c56182a993f60b4f49cf97ab09886d17";
        const searchUrl = `https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/search?q=${encodeURIComponent(q)}&apiKey=${API_KEY}`;

        const response = await fetch(searchUrl);
        const url = await response.json();

        if (!url || !url.data || url.data.length === 0) {
            await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
            return;
        }

        const rows = url.data.map(v => ({
            title: v.title,
            id: prefix + `bdl ${v.link}&${v.year}`
        }));

        const listMessage = {
            text: `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*Input:* ${q}`,
            footer: config.FOOTER,
            title: "Baiscopes.lk results",
            buttonText: "*Reply Below Number 🔢*",
            sections: [{ title: "Movies found", rows }]
        };

        await conn.listMessage(from, listMessage, mek);

    } catch (e) {
        console.error("Search Error:", e);
        await conn.sendMessage(from, { text: '🚩 *Error on search!!*' }, { quoted: mek });
    }
});

//================== Movie Info & Download Links ==================
cmd({
    pattern: "bdl",
    react: '🎥',
    desc: "Movie downloader",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return await reply('*Please provide a movie selection!*');

        const [movieUrl, year] = q.split("&");

        const API_KEY = "c56182a993f60b4f49cf97ab09886d17";
        const infoUrl = `https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${movieUrl}&apiKey=${API_KEY}`;

        const res = await fetch(infoUrl);
        const sadas = await res.json();

        if (!sadas || !sadas.data) {
            return await reply('*No details found ❗*');
        }

        const msg = `*🎬 Title:* ${sadas.data.title || 'N/A'}
*📅 Released:* ${sadas.data.date || 'N/A'}
*💃 Rating:* ${sadas.data.imdb || 'N/A'}
*⏰ Runtime:* ${sadas.data.runtime || 'N/A'}
*💁‍♂️ Subtitle by:* ${sadas.data.subtitle_author || 'N/A'}
*🎭 Genres:* ${sadas.data.genres.join(', ') || 'N/A'}
`;

        const rows = sadas.data.dl_links.map(v => ({
            title: `${v.size} (${v.quality})`,
            id: prefix + `cdl ${v.thumbnail}±${v.link}±${sadas.data.title}`
        }));

        const listButtons = {
            title: "Choose download link :)",
            sections: [{ title: "Available Links", rows }]
        };

        await conn.sendMessage(from, {
            image: { url: sadas.data.thumbnail.replace("-150x150", "") },
            caption: msg,
            footer: config.FOOTER,
            buttons: [
                {
                    buttonId: "download_list",
                    buttonText: { displayText: "🎥 Select Option" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listButtons) }
                }
            ],
            headerType: 1
        }, { quoted: mek });

    } catch (e) {
        console.error("BDL Error:", e);
        await conn.sendMessage(from, { text: '🚩 *Error fetching movie details!*' }, { quoted: mek });
    }
});

//================== Direct Download ==================
cmd({
    pattern: "cdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('*Please provide a direct URL!*');
        if (isUploading) return await conn.sendMessage(from, { text: '*Another movie is being uploaded, wait a moment ⏳*', quoted: mek });

        isUploading = true;
        const [thumbnail, dlUrl, title] = q.split("±");

        const mediaUrl = dlUrl.trim();

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        await conn.sendMessage(from, { text: '*Uploading your movie..⬆️*' });

        await conn.sendMessage(from, {
            document: { url: mediaUrl },
            caption: `*🎬 Name:* ${title}\n\n${config.NAME}`,
            mimetype: "video/mp4",
            jpegThumbnail: await (await fetch(thumbnail)).buffer(),
            fileName: `${title}.mp4`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
        isUploading = false;

    } catch (e) {
        console.error("CDL Error:", e);
        isUploading = false;
        await conn.sendMessage(from, { text: '*🚩 Error uploading movie!*' }, { quoted: mek });
    }
});
