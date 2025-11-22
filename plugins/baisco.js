const config = require('../config')
const { cmd } = require('../command')
const { fetchJson } = require('../lib/functions')
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { Buffer } = require('buffer'); 

let isUploading = false; // Track upload status

//======================= Baiscopes Search =======================
cmd({
    pattern: "b2",	
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".b2 2025",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
try{
    if(!q) return await reply('*Please provide search text!*')

    // 🔹 v2 Search API
    const url = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/search?q=${encodeURIComponent(q)}&apiKey=c56182a993f60b4f49cf97ab09886d17`);

    if (!url || !url.data || url.data.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
    }

    const rows = url.data.map(v => ({
        title: v.title,
        rowId: prefix + `bdl ${v.link}&${v.year}`
    }));

    const listMessage = {
        text: `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*Input:* ${q}`,
        footer: config.FOOTER,
        buttonText: "Select Movie 🔢",
        sections: [{ title: "Results", rows }]
    };

    await conn.sendMessage(from, { listMessage }, { quoted: mek });

} catch (e) {
    console.log('🔹 Baiscopes Search Error:', e);
    await conn.sendMessage(from, { text: '🚩 *Error in search! Check console for details.*' }, { quoted: mek } )
}
})

//======================= BDL (Info + Download Links) =======================
cmd({
    pattern: "bdl",	
    react: '🎥',
    desc: "Movie downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
try{
    const [urll, im] = q.split("&");
    if(!urll) return await reply('⚠️ Invalid input!');

    // 🔹 v2 Info+DL API
    const sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${encodeURIComponent(urll)}&apiKey=c56182a993f60b4f49cf97ab09886d17`);

    if(!sadas || !sadas.data) return await reply('❌ Error fetching movie info!');

    let msg = `*☘️ Title:* *_${sadas.data.title || 'N/A'}_*\n\n` +
              `*📅 Released:* _${sadas.data.date || 'N/A'}_\n` +
              `*💃 Rating:* _${sadas.data.imdb || 'N/A'}_\n` +
              `*⏰ Runtime:* _${sadas.data.runtime || 'N/A'}_\n` +
              `*💁‍♂️ Subtitle by:* _${sadas.data.subtitle_author || 'N/A'}_\n` +
              `*🎭 Genres:* ${sadas.data.genres.join(', ') || 'N/A'}`;

    const buttonRows = sadas.data.dl_links.map(v => ({
        buttonId: prefix + `cdl ${im}±${v.link}±${sadas.data.title}`,
        buttonText: { displayText: `${v.size} - ${v.quality}` },
        type: 1
    }));

    buttonRows.unshift({
        buttonId: prefix + `bdetails ${urll}&${im}`,
        buttonText: { displayText: 'Details Send' },
        type: 1
    });

    await conn.sendMessage(from, {
        image: { url: im.replace("-150x150","") },
        caption: msg,
        footer: config.FOOTER,
        buttons: buttonRows,
        headerType: 4
    }, { quoted: mek });

} catch (e) {
    console.log('🔹 BDL Error:', e);
    await conn.sendMessage(from, { text: '🚩 *Error fetching BDL! Check console.*' }, { quoted: mek })
}
})

//======================= CDL (Download) =======================
cmd({
    pattern: "cdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if(!q) return await reply('*Please provide a direct URL!*');
    if(isUploading) return await conn.sendMessage(from, { text: '*A movie is already being uploaded. Please wait ⏳*', quoted: mek });

    try{
        isUploading = true;
        const [datae, datas, dat] = q.split("±");

        const sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${encodeURIComponent(datas)}&apiKey=c56182a993f60b4f49cf97ab09886d17`);

        if(!sadas || !sadas.data || !sadas.data.dl_links || sadas.data.dl_links.length < 1) throw new Error('No download link found.');

        const mediaUrl = sadas.data.dl_links[0].link;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        await conn.sendMessage(from, { text: '*Uploading your movie..⬆️*' });

        await conn.sendMessage(from, { 
            document: { url: mediaUrl },
            caption: `*🎬 Name:* ${dat}\n\n${config.NAME}`,
            mimetype: "video/mp4",
            jpegThumbnail: await (await fetch(datae)).buffer(),
            fileName: `${dat}.mp4`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
        await conn.sendMessage(from, { text: `*Movie sent successfully ✔*` }, { quoted: mek });

    } catch(e){
        console.log('🔹 CDL Error:', e);
        await conn.sendMessage(from, { text: "*Error fetching or uploading movie!*" }, { quoted: mek });
    } finally{
        isUploading = false;
    }
})

//======================= BDETAILS =======================
cmd({
  pattern: "bdetails",
  react: '🎬',
  desc: "Movie downloader",
  filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
  try {
    if (!q) return await reply('⚠️ Please provide URL & image separated by "&".');

    const [url, imgUrl] = q.split("&");
    if (!url || !imgUrl) return await reply('❌ Invalid format! Example: _bdetails <url>&<img>_');

    const sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${encodeURIComponent(url)}&apiKey=c56182a993f60b4f49cf97ab09886d17`);

    let msg = `*☘️ Title:* *_${sadas.data.title || 'N/A'}_*\n\n` +
              `*📅 Released:* _${sadas.data.date || 'N/A'}_\n` +
              `*💃 Rating:* _${sadas.data.imdb || 'N/A'}_\n` +
              `*⏰ Runtime:* _${sadas.data.runtime || 'N/A'}_\n` +
              `*💁‍♂️ Subtitle by:* _${sadas.data.subtitle_author || 'N/A'}_\n` +
              `*🎭 Genres:* ${sadas.data.genres.join(', ') || 'N/A'}`;

    await conn.sendMessage(from, {
      image: { url: imgUrl.replace("-150x150","") },
      caption: msg
    });

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch(e){
    console.log('🔹 BDETAILS Error:', e);
    await conn.sendMessage(from, { text: '⚠️ *Error fetching movie details!*' }, { quoted: mek });
  }
})
