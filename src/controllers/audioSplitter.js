const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

function separateAudio(audioFilePath) {

    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const audioFileName = path.basename(audioFilePath);
    const audioFileNameWithoutExtension = path.parse(audioFileName).name;

    const spleeterArgs = ['separate', '-i', audioFilePath, '-p', 'spleeter:2stems', '-o', outputDir];
    const spleeter = spawn('spleeter', spleeterArgs);

    spleeter.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    spleeter.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    spleeter.on('close', (code) => {
        if (code === 0) {
            const vocalsFilePath = path.join(outputDir, `${audioFileNameWithoutExtension}_vocals.wav`);
            console.log(`Vocals saved to ${vocalsFilePath}`);
            // Do something with the extracted vocals here
        } else {
            console.error(`Spleeter exited with code ${code}`);
        }
    });
}

module.exports = separateAudio;
