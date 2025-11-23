const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: 'RED_MOON=zN9wxQjK#kMS1U_9B2Wio8JjNHSdMyr9eCMZ-8h4HmVRQz_DmUmM',
    ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE,
    MV_BLOCK: process.env.MV_BLOCK === undefined ? 'true' : process.env.MV_BLOCK,
    ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK,
    SEEDR_MAIL: '',
    SEEDR_PASSWORD: '',
    SUDO: '',
    DB_NAME: 'Redmooooooondb',
    LANG: 'SI',
    OWNER_NUMBER: '94754871798',
    TG_GROUP: 'https://t.me/+RedMoon-Mdexpor',


    ALIVE_IMG: 'https://files.catbox.moe/h131nw.jpg',
    MENU_IMG: 'https://files.catbox.moe/h131nw.jpg',
    
};
