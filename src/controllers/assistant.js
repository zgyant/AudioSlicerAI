const {Configuration, OpenAIApi} = require("openai");

const init = () => {
    const configuration = new Configuration({
        organization: process.env.ORGANISATION,
        apiKey: process.env.OPEN_API_KEY,
    });
    return {
        openai: new OpenAIApi(configuration),
        model: process.env.MODEL || 'text-davinci-002',
    };
}
const Chat = async (req, res) => {
    try {
        let message = req?.body?.message;

        if (!message) return res.send({data: []});
        //from message string remove extract vocal
        let query = message.replace('extract vocal', '').replace('on youtube', '');

        const {openai, model} = init();
        const response = await openai.createCompletion({
            model,
            prompt: query,
        });

        return res.send(response);
    } catch (e) {
        return res.status(e.response.status).send(e.response.statusText);
    }
}

module.exports = Chat