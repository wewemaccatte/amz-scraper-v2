const puppeteer = require('puppeteer');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url);
  const params = querystring.parse(query);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Imposta la lingua italiana per Amazon.it
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'it-IT'
  });

  // Costruisci la query in base ai parametri di query
  let searchQuery = 'https://www.amazon.it/s?';
  if (params.k) {
    searchQuery += `k=${params.k}&`;
  }
  if (params.crid) {
    searchQuery += `crid=${params.crid}&`;
  }
  if (params.sprefix) {
    searchQuery += `sprefix=${params.sprefix}&`;
  }
  if (params.ref) {
    searchQuery += `ref=${params.ref}&`;
  }
  searchQuery += '__mk_it_IT=%C3%85M%C3%85%C5%BD%C3%95%C3%91';

  // Visita la pagina di ricerca
  await page.goto(searchQuery);

  // Estrarre i dati dei prodotti
  const products = await page.evaluate(() => {
    const productList = [];

    // Seleziona tutti i prodotti sulla pagina
    const productNodes = document.querySelectorAll('[data-asin]');

    // Itera su ogni prodotto e estrai i dati
    productNodes.forEach((productNode) => {
      const product = {};

      // Estrai il nome del prodotto
      const nameNode = productNode.querySelector('h2 a');
      if (nameNode) {
        product.name = nameNode.innerText.trim();
      }

      // Estrai il prezzo del prodotto
      const priceNode = productNode.querySelector('.a-price-whole');
      if (priceNode) {
        product.price = priceNode.innerText.trim();
      }

      // Estrai la valutazione del prodotto
      const linkNode = productNode.querySelector('a');
      if (linkNode) {
        product.link = linkNode.href;
      }

      // Estrai l'immagine del prodotto
      const imageNode = productNode.querySelector('img');
      if (imageNode) {
        product.image = imageNode.src;
      }

      // Aggiungi il prodotto alla lista dei prodotti
      productList.push(product);
    });

    return productList;
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(products));

  await browser.close();
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
