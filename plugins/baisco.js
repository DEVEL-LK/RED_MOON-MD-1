const config = require('../config');
const { cmd } = require('../command');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const axios = require('axios');

const API_KEY = "c56182a993f60b4f49cf97ab09886d17";

// ======================= .baiscopes search =======================
cmd({
    pattern: "bais",
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".bais <movie name>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please provide a search query.*');

        const searchUrl = `https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/search?q=${encodeURIComponent(q)}&apiKey=${API_KEY}`;
        const res = await (await fetch(searchUrl)).json();

        if (!res || !res.data || res.data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        const rows = res.data.map(item => ({
            title: item.title + (item.year ? ` (${item.year})` : ""),
            rowId: `bdl|${encodeURIComponent(item.url)}|${encodeURIComponent(item.image)}`
        }));

        const listMessage = {
            text: `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*Input:* ${q}`,
            footer: config.FOOTER,
            title: 'Search Results',
            buttonText: 'Choose a movie',
            sections: [{ title: 'Movies', rows }]
        };

        await conn.sendMessage(from, { listMessage }, { quoted: mek });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: '🚩 *Error on search!!*' }, { quoted: mek });
    }
});

// ======================= .bdl info + download =======================
cmd({
    pattern: "bdl",
    react: '🎥',
    desc: "Get movie details + download links",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply('*Invalid format.*');

        // Split using "|" separator
        const parts = q.split("|").map(decodeURIComponent);
        if (parts.length < 3) return reply('*Invalid data received!*');

        const movieUrl = parts[1];
        const imageUrl = parts[2];

        const infoUrl = `https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${encodeURIComponent(movieUrl)}&apiKey=${API_KEY}`;
        const infoRes = await (await fetch(infoUrl)).json();

        if (!infoRes || !infoRes.data) {
            return await conn.sendMessage(from, { text: '*No details found ❗*' }, { quoted: mek });
        }

        const info = infoRes.data;

        let msg = `*☘️ Title:* _${info.title || 'N/A'}_\n` +
                  `*📅 Released:* _${info.date || 'N/A'}_\n` +
                  `*💃 Rating:* _${info.imdb || 'N/A'}_\n` +
                  `*⏱️ Runtime:* _${info.runtime || 'N/A'}_\n` +
                  `*🎭 Genres:* ${info.genres ? info.genres.join(", ") : 'N/A'}`;

        // Build download buttons
        const buttons = [];
        (info.dl_links || []).forEach(dl => {
            buttons.push({
                buttonId: `cdl|${encodeURIComponent(imageUrl)}|${encodeURIComponent(dl.link)}|${encodeURIComponent(info.title)}`,
                buttonText: { displayText: `${dl.size} (${dl.quality})` },
                type: 1
            });
        });

        await conn.sendMessage(from, {
            image: { url: imageUrl.replace("-150x150", "") },
            caption: msg,
            footer: config.FOOTER,
            buttons,
            headerType: 4
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: '🚩 *Error fetching details*' }, { quoted: mek });
    }
});

// ======================= .cdl direct download =======================
let isUploading = false;

cmd({
    pattern: "cdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply('*Please provide a direct URL!*');

    if (isUploading) return await conn.sendMessage(from, { 
        text: '*A movie is already being uploaded. Please wait ⏳*', 
        quoted: mek 
    });

    try {
        isUploading = true;
        const parts = q.split("|").map(decodeURIComponent);
        const imageUrl = parts[1];
        const movieLink = parts[2];
        const movieTitle = parts[3];

        const dlRes = await (await fetch(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${encodeURIComponent(movieLink)}&apiKey=${API_KEY}`)).json();
        if (!dlRes || !dlRes.data || !dlRes.data.dl_link) return reply('*❗ Download link not found.*');

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        await conn.sendMessage(from, { text: '*Uploading your movie..⬆️*' });

        await conn.sendMessage(from, {
            document: { url: dlRes.data.dl_link },
            caption: `*🎬 Name :* ${movieTitle}\n\n${config.NAME}`,
            mimetype: "video/mp4",
            fileName: `${movieTitle}.mp4`,
            jpegThumbnail: await (await fetch(imageUrl)).buffer()
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: '*Error fetching or uploading movie!*' }, { quoted: mek });
    } finally {
        isUploading = false;
    }
});
