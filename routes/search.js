const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:query', async (req, res) => {
    const query = req.params.query;
    const url = `https://www.amazon.it/s?k=${query}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const products = [];

        $('.s-result-item').each((i, element) => {
            const title = $(element).find('h2.a-size-mini a').first().text().trim();
            const asin = $(element).data('asin');
            const image = $(element).find('img.s-image').attr('src');
            const priceWhole = $(element).find('span.a-price-whole').first().text().trim();
            const priceFraction = $(element).find('span.a-price-fraction').text().trim();
            const price = `${priceWhole}.${priceFraction}`;
            const couponText = $(element).find('span.s-coupon-unclipped').text().trim();
            const coupon = couponText ? couponText.replace(/[^\d.]/g, '') : null;
            const formattedCoupon = (coupon / 100).toLocaleString('it-IT', {minimumFractionDigits: 2});

            if (price !== ".") {
                products.push({ title, asin, image, price, formattedCoupon });
            }
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;
