const path = require('path');
const fs = require("fs");
const fetch = require('node-fetch');
const {MODEL_PATH, SPLEETER_MODEL} = process.env
const tar = require('tar');
const zlib = require('zlib');
const {PythonShell} = require("python-shell");


async function separateAudio(audioFolder) {
    try {
        const rootLocation = path.join(__dirname, '../../',);

        if (!fs.existsSync(`${audioFolder}/separated`)) {
            fs.mkdirSync(`${audioFolder}/separated`);
        }

        if (!fs.existsSync(`${rootLocation}/models`)) {
            fs.mkdirSync(`${rootLocation}/models`);
        }
        const modelZipName = MODEL_PATH.split('/').pop();
        const audioFileName = path.join(__dirname, '../../', audioFolder, '/full.mp3');
        const outputFolder = path.join(__dirname, '../../', audioFolder, '/separated/');
        const modelName = modelZipName.split('.')[0];
        const modelExtractLocation = path.join(__dirname, '../../', audioFolder, '/pretrained_models/', modelName);
        const scriptPath = path.join(__dirname, '../../run_spleeter.py');
        const modelLocation = `${rootLocation}/models`;

        let fileStream = null;

        if (!fs.existsSync(`${modelLocation}/${modelZipName}`)) {
            console.log('Model doesnt exist downloading....');
            const fileResponse = await fetch(MODEL_PATH);

            //fetch url and save it to output folder
            fileStream = fs.createWriteStream(`${modelLocation}/${modelZipName}`);
            fileResponse.body.pipe(fileStream);

            fileStream.on('error', (err) => {
                console.error(`Failed to save model to ${modelLocation}: ${err.message}`);
            });

            fileStream.on('finish', async () => {
                extractModels(`${modelLocation}/${modelZipName}`, modelExtractLocation)
                console.log('Models extracted to location....');
            });
        } else {
            console.log('Model found, extracting it...');
            extractModels(`${modelLocation}/${modelZipName}`, modelExtractLocation)
            console.log('Models extracted to location....');
        }

        const options = {
            args: ['-i', audioFileName, '-o', outputFolder, '-p', SPLEETER_MODEL]
        };

        await PythonShell.run(scriptPath, options, function (err, results) {
            if (err) throw err;
            console.log('Spleeter finished separating tracks:', results);
        });

        console.log('Finished..');

    } catch (e) {
        console.log(e)
    }

}

function extractModels(tarPath, outputFolder) {
    try {
        fs.mkdir(outputFolder, {recursive: true}, (err) => {
            if (err) {
                console.error(`Error creating directory: ${err}`);
            } else {
                console.log(`Directory created: ${outputFolder}`);
            }
        });

        const readStream = fs.createReadStream(tarPath);

        const gunzip = zlib.createGunzip();
        const extract = tar.extract({
            cwd: outputFolder,
        });

        readStream.pipe(gunzip).pipe(extract);
    } catch (e) {
        console.log(e)
    }
}

module.exports = separateAudio;
