const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');
const separateAudio = require("./audioSplitter");
const cheerio = require('cheerio');
const pcmConvert = require('pcm-convert');
const fs = require("fs");

/**
 * function that runs puppeteer and cheerio to return the link
 * @param req
 * @param res
 * @returns {Promise<*>}
 * @constructor
 */
const Chat = async (req, res) => {
    let message = req?.body?.message;

    if (!message) return res.send({data: []});

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(message)}`;
    const browser = await puppeteer.launch({
        headless: true, ignoreDefaultArgs: ['--enable-automation']
    });
    const page = await browser.newPage();
    // await page.setViewport({width: 800, height: 800});
    await page.goto(url);
    await page.waitForSelector('#video-title');
    const content = await page.content();
    const $ = cheerio.load(content);

    const links = [];

    $('a').each((i, element) => {
        const href = $(element).attr('href');
        const title = $(element).attr('title');
        if (href?.startsWith('/watch') && title) {
            const videoId = href.substr(9);
            const link = `https://www.youtube.com/watch?v=${videoId}`;
            links.push({title, url: link, from: 'server'});
        }
    });

    await browser.close();

    return res.send({data: links});
}

/**
 * function to download the audio from the youtube link and send it to terraform to separate the vocals
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const videoDownloader = async (req, res) => {
    try {
        let url = req?.body?.url;

        if (!url) return;
        const audioStream = ytdl(url, {filter: 'audioonly'});
        const date = new Date();
        const fileName = `${date.getTime()}`;

        if (!fs.existsSync(`./output/${fileName}`)) {
            fs.mkdirSync(`./output/${fileName}`);
        }

        audioStream.pipe(fs.createWriteStream(`./output/${fileName}/full.mp3`));
        audioStream.on('end', async () => {
            await separateAudio(`./output/${fileName}`);
            return res.send({message: 'Download....', url: `#`, from: 'server', type: 'convert'});
            if (!status) return res.send({title: 'Error!', url: '#', from: 'server'});

            return res.send({message: 'Download....', url: `./output/${separatedFileName}`, from: 'server', type: 'download'});
        });
    } catch (e) {
        console.log(e);
    }

}

/**
 * function to delete the file from the server
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const deleteOldFile = async (req, res) => {
    try {
        let file = req?.body?.file;
        if (!file) return;
        fs.unlinkSync(file);
        res.send({message: 'File Deleted', from: 'server'});
    } catch (e) {
        console.log(e);
    }
}

module.exports = {Chat, videoDownloader, deleteOldFile}
