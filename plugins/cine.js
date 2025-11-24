const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const sharp = require('sharp');
const Seedr = require("seedr");
const { scrapercine, getDownloadLink } = require('../lib/yts'); 
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { Buffer } = require('buffer'); 
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fileType = require("file-type")
const { x_search, x_info_dl } = require('../lib/newm'); 
const l = console.log
const https = require("https")
const { URL } = require('url');
const cinesubz_tv = require('sadasytsearch');
const { cinesubz_info, cinesubz_tv_firstdl, cinesubz_tvshow_info } = require('../lib/cineall');
const download = require('../lib/yts'); 
const { pirate_search, pirate_dl } = require('../lib/pirates');
const { gettep, down } = require('../lib/animeheaven');
const { sinhalasub_search, sinhalasub_info, sinhalasub_dl } = require('../lib/sinhalasubli');
const { sinhalasubb_search, sinhalasubtv_info, sinhalasubtv_dl } = require('../lib/sinhalasubtv');
const { slanimeclub_search, slanimeclub_ep, slanimeclub_dl, slanimeclub_mv_search, slanime_mv_info } = require('../lib/slanimeclub');
const { sizeFormatter} = require('human-readable');
const { xfull_search, xfull_dl } = require('../lib/plusmv');
const { search, getep, dl } = require('darksadasyt-anime')


//============================

cmd({
  pattern: "c2",	
  react: '🔎',
  category: "movie",
  alias: ["cinesubz"],
  desc: "cinesubz.co movie search",
  use: ".c2 2025",
  filename: __filename
},
async (conn, m, mek, {
  from, q, prefix, isPre, isSudo, isOwner, isMe, reply
}) => {
  try {
    const pr = (await axios.get('https://raw.githubusercontent.com/WhiteLK122/NATSU-DATABASE/refs/heads/main/main_var.json')).data;
    const isFree = pr.mvfree === "true";

    // Premium check
    if (!isFree && !isMe && !isPre) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*`You are not a premium user⚠️`*\n\n" +
              "*Send a message to one of the 2 numbers below and buy Lifetime premium 📤.*\n\n" +
              "_Price : 100 LKR ✔️_\n\n" +
              "*👨‍💻Contact us : 94754871798*"
      }, { quoted: mek });
    }

    // Block check
    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*"
      }, { quoted: mek });
    }

    if (!q) return await reply('*Please give me a movie name 🎬*');

    const url = await cinesubz_tv(q);

    if (!url || !url.data || url.data.length === 0) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
    }

   var srh = [];  
for (var i = 0; i < url.data.length; i++) {
srh.push({
title: (url.data[i].title || "No result")
    .replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "")
    .replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", ""),

description: '',
rowId: prefix + 'cinedl ' + url.data[i].link
});
}

const sections = [{
title: "cinesubz.co results",
rows: srh
}	  
]
const listMessage = {
text: `_*CINESUBZ MOVIE SEARCH RESULTS 🎬*_

*\`Input :\`* ${q}`,
footer: config.FOOTER,
title: 'cinesubz.co results',
buttonText: '*Reply Below Number 🔢*',
sections
}

 const caption = `_*CINESUBZ MOVIE SEARCH RESULTS 🎬*_ 

*\`Input :\`* ${q}`;

    // ✅ Button mode toggle
    const rowss = url.data.map((v, i) => {
    // Clean size and quality text by removing common tags
    const cleanText = `${url.data[i].title}`
      .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
      .trim() || "No info";

    return {
      title: cleanText,
      id: prefix + `cinedl ${url.data[i].link}` // Make sure your handler understands this format
    };
  });

  // Compose the listButtons object
  const listButtons = {
    title: "Choose a Movie :)",
    sections: [
      {
        title: "Available Links",
        rows: rowss
      }
    ]
  };

	
if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
    image: { url: config.LOGO },
    caption: caption,
    footer: config.FOOTER,
    buttons: [

	    
      {
        buttonId: "download_list",
        buttonText: { displayText: "🎥 Select Option" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify(listButtons)
        }
      }
	    
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: mek });
    } else {
      await conn.listMessage(from, listMessage,mek)
    }

  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
  }
});


//========================

cmd({
    pattern: "cinedl",	
    react: '🎥',
     desc: "moive downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, prefix, reply }) => {
try{

	// Movie downloader check
	
if (!q || !q.includes('https://cinesubz.net/movies/')) {
    console.log('Invalid input (Movie):', q);
    return await reply('*❗ This is not a valid movie link. Please use .mv command for movies.*');
}

let sadass = await fetchJson(`https://visper-md-ap-is.vercel.app/movie/cine/info?q=${q}`)
const sadas = sadass.result;
	console.log(cinesubz_info)
let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${sadas.data.title  || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${sadas.data.date  || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${sadas.data.country  || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${sadas.data.imdb  || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${sadas.data.runtime  || 'N/A'}_
*💁‍♂️ 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${sadas.data.subtitle_author  || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${sadas.data.genres.join(', ')  || 'N/A'}
`

if (sadas.length < 1) return await conn.sendMessage(from, { text: 'erro !' }, { quoted: mek } )

var rows = [];  

rows.push(
    { buttonId: prefix + 'ctdetails ' + q, buttonText: { displayText: 'Details Card\n' }, type: 1 }
    
);

	
  sadas.dl_links.map((v) => {
	rows.push({
        buttonId: prefix + `pakatv ${sadas.data.image}±${sadas.data.title}±${v.link}
	
	*\`[ ${v.quality} ]\`*`,
        buttonText: { 
    displayText: `${v.size}  (${v.quality} )`
        .replace("WEBDL", "")
	     .replace("WEB DL", "")
        .replace("BluRay HD", "") 
	.replace("BluRay SD", "") 
	.replace("BluRay FHD", "") 
	.replace("Telegram BluRay SD", "") 
	.replace("Telegram BluRay HD", "") 
		.replace("Direct BluRay SD", "") 
		.replace("Direct BluRay HD", "") 
		.replace("Direct BluRay FHD", "") 
		.replace("FHD", "") 
		.replace("HD", "") 
		.replace("SD", "") 
		.replace("Telegram BluRay FHD", "") 
		
},
        type: 1
          }
		 
		 
		 );
        })

 buttonMessage = {
 
image: {url: sadas.data.image.replace(/-\d+x\d+(?=\.jpg)/, '')},	
  caption: msg,
  footer: config.FOOTER,
  buttons: rows,
  headerType: 4
}



const rowss = sadas.dl_links.map((v, i) => {
    // Clean size and quality text by removing common tags
    const cleanText = `${v.size} (${v.quality})`
      .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
      .trim() || "No info";

    return {
      title: cleanText,
      id: prefix + `pakatv ${sadas.data.image}±${sadas.data.title}±${v.link}
	
	*\`[ ${v.quality} ]\`*` // Make sure your handler understands this format
    };
  });

  // Compose the listButtons object
  const listButtons = {
    title: "🎬 Choose a download link:",
    sections: [
      {
        title: "Available Links",
        rows: rowss
      }
    ]
  };

	
if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
    image: { url: sadas.data.image.replace(/-\d+x\d+(?=\.jpg)/, '') },
    caption: msg,
    footer: config.FOOTER,
    buttons: [
{
            buttonId: prefix + 'ctdetails ' + q,
            buttonText: { displayText: "Details Send" },
            type: 1
        },
	    
      {
        buttonId: "download_list",
        buttonText: { displayText: "🎥 Select Option" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify(listButtons)
        }
      }
	    
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: mek });
    } else {
      return await conn.buttonMessage(from, buttonMessage, mek)
    }
} catch (e) {
    console.log(e)
  await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek } )
}
})


let isUploadingg = false; // Track upload status







const cinesubzDownBase = "https://drive2.cscloud12.online";
const apilinkcine = "https://cinesubz-store.vercel.app/";

//===================

cmd({
    pattern: "paka",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, isMe, reply }) => {
    if (!q) {
        return await reply('*Please provide a direct URL!*');
    }

    if (isUploadingg) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait a while before uploading another one.* ⏳', 
            quoted: mek 
        });
    }

    let attempts = 0;
    const maxRetries = 5;
    isUploadingg = true;

    while (attempts < maxRetries) {
        try {
            const [datae, datas, dat] = q.split("±");
           let url = dat;
            let mediaUrl = url;
            let downloadUrls = null;

            // 🔹 Check only if it's from Cinesubz
            if (url.includes(cinesubzDownBase)) {
                const check = await fetchJson(`${apilinkcine}api/get/?url=${encodeURIComponent(url)}`);

                if (check?.isUploaded === false) {
                    // New upload case
                    const urlApi = `https://manojapi.infinityapi.org/api/v1/cinesubz-download?url=${encodeURIComponent(url)}&apiKey=sadasthemi20072000`; 
                    const getDownloadUrls = await axios.get(urlApi);

                    downloadUrls = getDownloadUrls.data.results;

                    // Save in DB
                    const payload = { url, downloadUrls, uploader: "VISPER-MD" }; 
                    await axios.post(`${apilinkcine}api/save`, payload);

                } else {
                    // Already uploaded
                    downloadUrls = check.downloadUrls;
                }

                // Pick best available link
                mediaUrl =
                     downloadUrls.direct ||
                    downloadUrls?.gdrive2 
            }

            // 🔹 Thumbnail
            const botimg = datae;

            await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
            const up_mg = await conn.sendMessage(from, { text: '*Uploading your movie..⬆️*' });

            // 🔹 Send document
            await conn.sendMessage(config.JID || from, { 
                document: { url: mediaUrl },
                caption: `*🎬 Name :* ${dat}\n\n${config.NAME}`,
                mimetype: "video/mp4",
                jpegThumbnail: await (await fetch(botimg)).buffer(),
                fileName: `${dat}.mp4`
            });

            await conn.sendMessage(from, { delete: up_mg.key });
            await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
            await conn.sendMessage(from, { text: `*Movie sent successfully to JID ${config.JID} ✔*` }, { quoted: mek });

            break; // ✅ success → exit loop
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts}: Error fetching or sending:`, error);
        }
    }

    if (attempts >= maxRetries) {
        await conn.sendMessage(from, { text: "*Error fetching at this moment. Please try again later ❗*" }, { quoted: mek });
    }
      
      isUploadingg = false;
});


//=======================

cmd({
    pattern: "ctdetails",	
    react: '🎥',
    desc: "moive downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
try{


     if(!q) return await reply('*please give me text !..*')

let sadas = await cinesubz_info(q)
const details = (await axios.get('https://raw.githubusercontent.com/WhiteLK122/NATSU-DATABASE/refs/heads/main/main_var.json')).data
     
	
let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${sadas.data.title  || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${sadas.data.date  || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${sadas.data.country  || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${sadas.data.imdb  || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${sadas.data.runtime  || 'N/A'}_
*💁‍♂️ 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${sadas.data.subtitle_author  || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* _${sadas.data.genres.join(', ')  || 'N/A'}_

> 🌟 Follow us : *${details.chlink}*`
await conn.sendMessage(config.JID || from, { image: { url: sadas.data.image.replace(/-\d+x\d+(?=\.jpg)/, '') }, caption: msg })



 await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (error) {
        console.error('Error fetching or sending', error);
        await conn.sendMessage(from, '*Error fetching or sending *', { quoted: mek });
    }
});


//=================== tv 




cmd({
    pattern: "ctv2",	
    react: '🔎',
    category: "movie",
alias: ["ctv"],
        desc: "cinesubz.co tv shows search",
    use: ".ctv2  2025",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isMe, isSudo, isPre, isOwner, reply }) => {
try{


const pr = (await axios.get('https://raw.githubusercontent.com/WhiteLK122/NATSU-DATABASE/refs/heads/main/main_var.json')).data;

// convert string to boolean
const isFree = pr.mvfree === "true";

// if not free and not premium or owner
if (!isFree && !isMe && !isPre) {
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    return await conn.sendMessage(from, {
    text: "*`You are not a premium user⚠️`*\n\n" +
          "*Send a message to one of the 2 numbers below and buy Lifetime premium 📤.*\n\n" +
          "_Price : 100 LKR ✔️_\n\n" +
          "*👨‍💻Contact us : 94754871798*"
}, { quoted: mek });

}









if( config.MV_BLOCK == "true" && !isMe && !isSudo && !isOwner ) {
	await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*" }, { quoted: mek });

}
 if(!q) return await reply('*please give me text !..*')
let url = await fetchJson(`https://darksadas-yt-cinesubz-tv-search.vercel.app/?query=${q}`)
	

  if (!url || !url.data || url.data.length === 0) 
	{
		await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
	}
var srh = [];  
for (var i = 0; i < url.data.length; i++) {
srh.push({
title: url.data[i].title.replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "").replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "")|| 'Result not found',
description: '',
rowId: prefix + 'cinetvdl ' + url.data[i].link
});
}

const sections = [{
title: "cinesubz.co results",
rows: srh
}	  
]
const listMessage = {
text: `_*CINESUBZ TV SHOWS RESULTS 📺*_

*\`Input :\`* ${q}`,
footer: config.FOOTER,
title: 'cinesubz.co results',
buttonText: '*Reply Below Number 🔢*',
sections
}
 const caption = `_*CINESUBZ TV SHOWS RESULTS 📺*_

*\`Input :\`* ${q}`;

    // ✅ Button mode toggle
    const rowss = url.data.map((v, i) => {
    // Clean size and quality text by removing common tags
    const cleanText = `${url.data[i].title}`
      .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
      .trim() || "No info";

    return {
      title: cleanText,
      id: prefix + `cinetvdl ${url.data[i].link}` // Make sure your handler understands this format
    };
  });

  // Compose the listButtons object
  const listButtons = {
    title: "Choose a Movie :)",
    sections: [
      {
        title: "Available Links",
        rows: rowss
      }
    ]
  };



if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
    image: { url: config.LOGO },
    caption: caption,
    footer: config.FOOTER,
    buttons: [

	    
      {
        buttonId: "download_list",
        buttonText: { displayText: "🎥 Select Option" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify(listButtons)
        }
      }
	    
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: mek });
    } else {
      await conn.listMessage(from, listMessage,mek)
    }
} catch (e) {
    console.log(e)
  await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek } )
}
})


cmd({
    pattern: "cinetvdl",	
    react: '🎥',
     desc: "moive downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, prefix, reply }) => {
try{
	
// TV downloader check
	
if (!q || !q.includes('https://cinesubz.net/tvshows')) {
    console.log('Invalid input (TV):', q);
    return await reply('*❗ This is not a valid TV series link. Please use .tv command for TV shows.*');
}
	
let sadas = await cinesubz_tvshow_info(q)
let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${sadas.data.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${sadas.data.date || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${sadas.data.country || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${sadas.data.imdb || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${sadas.data.runtime || 'N/A'}_
*💁‍♂️ 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${sadas.data.director || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${sadas.data.category.join(', ') || 'N/A'}
`

 
var rows = [];  

rows.push(
    { buttonId: prefix + 'ctdetailss ' + q, buttonText: { displayText: 'Details Card' }, type: 1 },
    { buttonId: prefix + 'dlc ' + q, buttonText: { displayText: 'All Epishodes Send\n' }, type: 1 }
);
	
  sadas.data.episodes.map((v) => {
	rows.push({
        buttonId: prefix + `cinefirstdl ${sadas.data.mainImage}±${v.link}±${sadas.data.title} *\`${v.number}\`*`,
        buttonText: { displayText: `${v.number}` },
        type: 1
          }
		 
		  //{buttonId: prefix + 'cdetails ' + q, buttonText: {displayText: 'Details send'}, type: 1}
		 
		 
		 );
        })



const buttonMessage = {
 
image: {url: sadas.data.mainImage.replace("-200x300", "")},	
  caption: msg,
  footer: config.FOOTER,
  buttons: rows,
  headerType: 4
}

const rowss = sadas.data.episodes.map((v, i) => {
    // Clean size and quality text by removing common tags
    const cleanText = `${v.number}`
      .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
      .trim() || "No info";

    return {
      title: cleanText,
      id: prefix + `cinefirstdl ${sadas.data.mainImage}±${v.link}±${sadas.data.title} *\`${v.number}\`*` // Make sure your handler understands this format
    };
  });


const listButtons = {
    title: "🎬 Choose a download link :)",
    sections: [
      {
        title: "Available Links",
        rows: rowss
      }
    ]
  };


	if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
    image: { url: sadas.data.mainImage.replace("-200x300", "")},
    caption: msg,
    footer: config.FOOTER,
    buttons: [
{
            buttonId: prefix + 'ctdetailss ' + q,
            buttonText: { displayText: "Details Send" },
            type: 1
        },
	    {
            buttonId: prefix + 'dlc ' + q,
            buttonText: { displayText: "All Epishodes Send" },
            type: 1
        },
	    
      {
        buttonId: "download_list",
        buttonText: { displayText: "🎥 Select Option" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify(listButtons)
        }
      }
	    
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: mek });
    } else {
      return await conn.buttonMessage(from, buttonMessage, mek)
    }

  } catch (e) {
    console.log(e)
  await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek } )
}
})


//==============

cmd({
  pattern: "cinefirstdl",	
  react: '🎬',
  alias: ["tv"],
  desc: "Movie downloader",
  filename: __filename
}, async (conn, m, mek, { from, q, prefix, isMe, reply }) => {
  try {
    if (!q) return await reply('*⚠️ Please provide a valid search query or URL.*');

    console.log('[CINE-FIRSTDL] Query:', q);
    
    const [dllink, img, title] = q.split("±");

    if (!img) return await reply('*🚫 Invalid format. Expected "link±imageURL".*');

    const results = await cinesubz_tv_firstdl(img);
    if (!results?.dl_links?.length) {
      return await conn.sendMessage(from, { text: '*❌ No download links found!*' }, { quoted: mek });
    }

    const rows = results.dl_links.map(dl => ({
      title: `${dl.quality} - ${dl.size}`,
      description: '',
      rowId: prefix + `tvdll ${dllink}&${title}&${dl.direct_link}`
    }));

    const sections = [{
      title: "🎥 Select your preferred quality below:",
      rows
    }];

    const caption = `*🍿 Episode Title:* ${title}_*_\n\n*🔢 Choose a quality from the list below:*`;

    // 💬 Toggle List Message or Button Mode
    if (config.BUTTON === "true") {
      return await conn.sendMessage(from, {
        text: caption,
        footer: config.FOOTER,
        title: '📺 Cinesubz.lk Download Options',
        buttonText: "🎬 Select Quality",
        sections
      }, { quoted: mek });
    } else {
      const listMessage = {
        text: caption,
        footer: config.FOOTER,
        title: '📺 Cinesubz.lk Download Options',
        buttonText: '🔽 Tap to select quality',
        sections
      };
      return await conn.listMessage(from, listMessage, mek);
    }

  } catch (err) {
    console.error('[CINE-FIRSTDL ERROR]', err);
    await reply('🚫 *An unexpected error occurred!*\n\n' + err.message || err);
  }
});

//===============

  cmd({
    pattern: "tvdll",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, isMe, reply }) => {
    if (!q) return await reply('*Please provide a direct URL!*');

    try {
        console.log("Query:", q);
        await conn.sendMessage(from, { text: `*Downloading your movie..⬇️*` }, { quoted: mek });

        const [dllink, img, title] = q.split("&");
        if (!dllink || !img || !title) {
            return await reply("*Invalid format. Make sure all 3 parts are provided with `&` separator.*");
        }

        const mh = await download(title)
console.log(mh)
	    
        const mediaUrl = mh.result.direct.trim();
     

        const botimgUrl = dllink.trim();
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.buffer();
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);

        const dat = Date.now();
        const message = {
            document: { url: mediaUrl },
            caption: `*🎬 Name :* ${img}\n\n${config.NAME}`,
            jpegThumbnail: resizedBotImg,
            mimetype: "video/mp4",
            fileName: `${img}.mp4`,
        };

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        await conn.sendMessage(from, { text: `*Uploading your movie..⬆️*` }, { quoted: mek });
        await conn.sendMessage(config.JID || from, message);

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
        await conn.sendMessage(from, { text: `*Movie sent successfully to JID:* ${config.JID || from} ✔`, quoted: mek });

    } catch (error) {
        console.error('❌ Error:', error);
        await conn.sendMessage(from, { text: '*❌ Error fetching or sending.*' }, { quoted: mek });
    }
});

//========================

cmd({
    pattern: "dlc",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, prefix }) => {
    if (!q) return reply('*කරුණාකර Cinesubz URL එකක් ලබා දෙන්න !*');

    try {
        const sadas = await cinesubz_tvshow_info(q);

        if (!sadas.data || !Array.isArray(sadas.data.episodes) || sadas.data.episodes.length === 0) {
            return reply("❌ Episode එකක්වත් හමු නොවුණා.");
        }

        const episodes = sadas.data.episodes;
        const allLinks = episodes.map(ep => ep.link).filter(Boolean);
        const showimg = sadas.data.mainImage || "https://files.catbox.moe/h131nw.jpg";
        const showTitle = sadas.data.title || "Cinesubz_Show";

        const sampleEp = await cinesubz_tv_firstdl(allLinks[0]);

        // Allowed qualities keywords to look for inside quality names
        const allowedQualities = ["360", "480", "720", "1080"];

        // Object.values() to get array of dl_links entries
        const validOptions = Object.values(sampleEp.dl_links || {}).filter(item =>
            allowedQualities.some(qty => item.quality?.toLowerCase().includes(qty))
        );

        if (!validOptions.length) {
            console.log("❌ No valid quality matches. Found:", sampleEp.dl_links);
            return reply("❌ Valid quality options not found.");
        }

        // Create rows for listMessage
        let rows = validOptions.map(dl => ({
            title: `${dl.quality} - ${dl.size || "Unknown Size"}`,
            //description: 'මෙම Quality එකෙන් සියලු Episodes ලබාගන්න.',
            rowId: `${prefix}dlcq ${dl.quality}|${q}|${showTitle}`
        }));

        const sections = [{
            title: "_🎬 Download Quality තෝරන්න_",
            rows
        }];

        const listMessage = {
            text: `🎞 *${showTitle}*\n.`,
            footer: config.FOOTER,
            title: `📺 [Cinesubz Downloader]`,
            buttonText: "🔽 Quality තෝරන්න",
            sections
        };

const msg = `🎞 *${showTitle}*\n`

	    
const rowss = validOptions.map((v, i) => {
    // Clean size and quality text by removing common tags
    const cleanText = `${v.quality} - ${v.size || "Unknown Size"}`
      .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
      .trim() || "No info";

    return {
      title: cleanText,
      id: `${prefix}dlcq ${v.quality}|${q}|${showTitle}`// Make sure your handler understands this format
    };
  });


const listButtons = {
    title: "🎬 Choose a download quality :)",
    sections: [
      {
        title: "Available Links",
        rows: rowss
      }
    ]
  };


	if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
    image: { url: config.LOGO},
    caption: msg,
    footer: config.FOOTER,
    buttons: [

	    
      {
        buttonId: "download_list",
        buttonText: { displayText: "🎥 Select Option" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify(listButtons)
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
        reply("❌ දෝෂයක් හට ගැණිනි.");
    }
});


const { delay } = require("@whiskeysockets/baileys");

//==================

cmd({
    pattern: "dlcq",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q.includes("|")) return reply("❌ Invalid format. Use: .dlcq <quality>|<url>|<title>");

    const [quality, rawUrl, rawTitle] = q.split("|");
    const url = rawUrl?.trim();
    const title = rawTitle?.trim() || "Cinesubz";

    const allowedQualities = ["360", "480", "720", "1080"];
    const isAllowed = allowedQualities.some(qty => quality.toLowerCase().includes(qty));
    if (!isAllowed) return reply("❌ Unsupported quality. Use 360, 480, 720, or 1080.");

    try {
        const sadas = await cinesubz_tvshow_info(url);
        const episodes = sadas.data.episodes;
        const showimg = sadas.data.mainImage || "https://files.catbox.moe/h131nw.jpg";

        if (!episodes || !episodes.length) return reply("❌ No episodes found for this link.");

        await reply(`*📥 Starting to download episodes in *${quality}* quality...*`);

        for (let i = 0; i < episodes.length; i++) {
            const ep = episodes[i];
            let success = false;

            for (let attempt = 1; attempt <= 4; attempt++) {
                try {
                    const dlInfo = await cinesubz_tv_firstdl(ep.link);
                    const allDLs = Object.values(dlInfo.dl_links || {});
                    const matchedDL = allDLs.find(dl =>
                        dl.quality?.toLowerCase().includes(quality.toLowerCase())
                    );
                    if (!matchedDL) throw new Error("Requested quality not available.");

                    const dldata = await download(matchedDL.direct_link);
                    const mediaUrl = dldata?.result?.direct;
                    if (!mediaUrl || !mediaUrl.startsWith("http")) throw new Error("Invalid direct link");


                    const thumb = await (await fetch(ep.image || showimg)).buffer();
                    const name = ep.name || `Episode_${i + 1}`;
                    const safeName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_E${i + 1}.mp4`;

                    await conn.sendMessage(config.JID || from, {
                        document: { url: mediaUrl },
                        caption: `*📺 Name: ${title}*\n*Episode ${ep.number} - ${name}*\n\n*\`[ ${quality} ]\`*\n\n${config.NAME}`,
                        jpegThumbnail: thumb,
                        mimetype: "video/mp4",
                        fileName: safeName
                    });

                    await delay(3000); // delay between episodes
                    success = true;
                    break;
                } catch (e) {
                    console.log(`❌ Episode ${i + 1} Attempt ${attempt} Failed:`, e.message);
                    if (attempt === 4) {
                        await conn.sendMessage(from, {
                            text: `⚠️ Failed to download Episode ${i + 1} after 4 attempts.`,
                        }, { quoted: mek });
                    } else {
                        await delay(2000); // wait before next attempt
                    }
                }
            }
        }

        await reply("*✅ All episodes have been processed.*");

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred while processing your request.");
    }
});



//==============


cmd({
    pattern: "ctdetailss",	
    react: '🎥',
    desc: "moive downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
try{


     if(!q) return await reply('*please give me text !..*')
let sadas = await fetchJson(`https://darksadas-yt-cineszub-tv-shows.vercel.app/?url=${q}&apikey=pramashi`)
	const details = (await axios.get('https://raw.githubusercontent.com/WhiteLK122/NATSU-DATABASE/refs/heads/main/main_var.json')).data
     

let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${sadas.data.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${sadas.data.date || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${sadas.data.country || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${sadas.data.imdb || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${sadas.data.runtime || 'N/A'}_
*💁‍♂️ 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${sadas.data.subtitle_author || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${sadas.data.genres.join(', ') || 'N/A'}

> 🌟 Follow us : *${details.chlink}*`

await conn.sendMessage(config.JID || from, { image: { url: sadas.data.image.replace("-200x300", "") }, caption: msg })



 await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (error) {
        console.error('Error fetching or sending', error);
        await conn.sendMessage(from, '*Error fetching or sending *', { quoted: mek });
    }
});

