const config = require('../config');
const { cmd } = require('../command');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_KEY = "c56182a993f60b4f49cf97ab09886d17";

// ======================= .baiscopes search =======================
cmd({
    pattern: "bais",
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".bais <movie name>",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, reply }) => {
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
            rowId: prefix + `bdl ${encodeURIComponent(item.url)}&${encodeURIComponent(item.image)}`
        }));

        const listMessage = {
            text: `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*Input:* ${q}`,
            footer: config.FOOTER,
            title: 'Search Results',
            buttonText: 'Choose a movie',
            sections: [{ title: 'Movies', rows }]
        };

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: listMessage.text,
                footer: config.FOOTER,
                buttons: [
                    {
                        buttonId: "download_list",
                        buttonText: { displayText: "🎥 Select Option" },
                        type: 4,
                        nativeFlowInfo: {
                            name: "single_select",
                            paramsJson: JSON.stringify(listMessage)
                        }
                    }
                ],
                headerType: 1,
                viewOnce: true
            }, { quoted: mek });
        } else {
            await conn.listMessage(from, listMessage, mek);
        }

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
}, async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return reply('*Invalid format.*');

        const [movieUrl, imageUrl] = q.split("&").map(decodeURIComponent);
        if (!movieUrl) return reply('*Movie URL missing.*');

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
                buttonId: prefix + `cdl ${encodeURIComponent(imageUrl)}±${encodeURIComponent(dl.link)}±${encodeURIComponent(info.title)}`,
                buttonText: { displayText: `${dl.size} (${dl.quality})` },
                type: 1
            });
        });

        // Optional: details button
        buttons.unshift({
            buttonId: prefix + `bdetails ${encodeURIComponent(movieUrl)}&${encodeURIComponent(imageUrl)}`,
            buttonText: { displayText: 'Details' },
            type: 1
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
