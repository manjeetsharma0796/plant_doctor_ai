const express = require('express');
const run = require('./ai');
const cors = require('cors');
const app = express();


const PORT = process.env.PORT || 4000;
app.use(cors());
// app.use(express.json({}));
app.use(express.json({ limit: '100mb' })); // Increase the payload size limit to 50MB

app.use((req, res, next) => {
    console.log(req.url);
    next();
})

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.post('/ai', async (req, res) => {
    const prompt = req.body;
    const image = prompt.image.replace(/^data:\w+\/\w+;\w+,/,"");
    console.log(image,"==================");

    const ans = await run(image)
    console.log(ans);
    res.json(ans);
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})