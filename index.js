const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/api/product/:asin', async (req, res) => {
    const asin = req.params.asin;
    const url = `https://www.amazon.it/dp/${asin}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('#productTitle').text().trim();
        const price = $('#corePrice_feature_div span.a-offscreen').first().text().trim();
        const image = $('#landingImage').attr('src');
        const urlProduct = url + "/?&tag=angelblack199-21";

        res.json({ title, price, image, urlProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started');
});
