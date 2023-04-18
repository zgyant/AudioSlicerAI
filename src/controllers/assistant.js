const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');
const fs = require("fs");
const separateAudio = require("./audioSplitter");
const cheerio = require('cheerio');
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

const videoDownloader = async (req, res) => {
    try {
        let url = req?.body?.url;

        if (!url) return;
        const audioStream = ytdl(url, {filter: 'audioonly'});
        //current date
        const date = new Date();
        const fileName = `${date.getTime()}_audio.mp4`;
        audioStream.pipe(fs.createWriteStream(`./${fileName}_audio.mp4`)).on('finish', () => {
            console.log('Audio Downloaded');
            return separateAudio(`./${fileName}_audio.mp4`);
        });
    } catch (e) {
        console.log(e);
    }

}

module.exports = {Chat, videoDownloader}
