const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:asin', async (req, res) => {
    const asin = req.params.asin;
    const url = `https://www.amazon.it/dp/${asin}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('#productTitle').text().trim();
        const price = $('#corePrice_feature_div span.a-offscreen').text().trim();
        const image = $('#landingImage').attr('src');

        const product = {
            title,
            price,
            image
        };

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;
