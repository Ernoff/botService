/**
 * created by Ernest on 16 - 03 - 2018
*/
//=============================================================================
'use strict';
if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//=============================================================================
// dependencies
const P = require('puppeteer');

// module variables
const
  EVENT_URL = 'https://www.betdaq.com/exchange/horse-racing/uk-racing/kempton-(17th-march-2018)/13-30-kempton/4776417',
  SELECTIONS_CONTAINER_SELECTOR = 'table.dataTable.marketViewSelections',
  MATCHED_AMOUNT_SELECTOR = 'span.gep-matchedamount';


async function bot() {
  // instantiate browser
  const browser = await P.launch({
    headless: false,
    timeout: 180000
  });
  // create blank page
  const page = await browser.newPage();
  // set viewport to 1366*768
  await page.setViewport({ width: 1366, height: 768 });
  // set the user agent
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)');
  // navigate to EVENT_URL
  await page.goto('https://www.betdaq.com', {
    waitUntil: 'networkidle2'
  });
  console.log('started');
  await page.goto(EVENT_URL, {
    waitUntil: 'networkidle2',
    timeout: 180000
  });
  await page.waitFor(30 * 1000);
  // ensure race container selector available
  const frame = await page.frames().find(f => f.name() === 'mainFrame');
  await frame.waitForSelector(SELECTIONS_CONTAINER_SELECTOR, {
    timeout: 180000
  });
  page.on('console', data => console.log(data.text))
  // bind to races container and lsiten for updates to , bets etc
  await frame.$eval(SELECTIONS_CONTAINER_SELECTOR,
    (target, MATCHED_AMOUNT_SELECTOR) => {
      // listen for raceStart

      target.addEventListener('DOMSubtreeModified', function (e) {
        // check for most common element of back and lay as source of event
        if (e.target.parentElement.parentElement.parentElement.parentElement.className == ('marketViewSelectionRow gep-altrow' || 'marketViewSelectionRow gep-row')) {
          // define variables
          let
            betType,
            odds,
            liquidity,
            SELECTION;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.children[0].children[2].children[0].children[0].children[2].children[0].innerText 
          // check 12 conditions

          if ((e.target.className == 'price') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox backCell_0')) {
            betType = 'b0';
            odds = e.target.innerText;
            liquidity = e.target.parentElement.children[1].innerText;
          }
          else if ((e.target.className == 'price') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox layCell_0')) {
            betType = 'l0';
            odds = e.target.innerText;
            liquidity = e.target.parentElement.children[1].innerText;
                       
          }
          else if ((e.target.className == 'price') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox backCell_1')) {
            betType = 'b1';
            odds = e.target.innerText;
            liquidity = e.target.parentElement.children[1].innerText;
          }
          else if ((e.target.className == 'price') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox layCell_1')) {
            betType = 'l1';
            odds = e.target.innerText;
            liquidity = e.target.parentElement.children[1].innerText;
          }
          else if ((e.target.className == 'price') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox backCell_2')) {
            betType = 'b2';
            odds = e.target.innerText;
            liquidity = e.target.parentElement.children[1].innerText;
          }
          else if ((e.target.className == 'price') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox layCell_2')) {
            betType = 'l2';
            odds = e.target.innerText;
            liquidity = e.target.parentElement.children[1].innerText;
          }
          else if ((e.target.className == 'stake') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox backCell_0')) {
            betType = 'b0';
            odds = e.target.parentElement.children[0].innerText;
            liquidity = e.target.innerText;
          }
          else if ((e.target.className == 'stake') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox layCell_0')) {
            betType = 'l0';
            odds = e.target.parentElement.children[0].innerText;
            liquidity = e.target.innerText;
          }
          else if ((e.target.className == 'stake') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox backCell_1')) {
            betType = 'b1';
            odds = e.target.parentElement.children[0].innerText;
            liquidity = e.target.innerText;
          }
          else if ((e.target.className == 'stake') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox layCell_1')) {
            betType = 'l1';
            odds = e.target.parentElement.children[0].innerText;
            liquidity = e.target.innerText;
          }
          else if ((e.target.className == 'stake') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox backCell_2')) {
            betType = 'b2';
            odds = e.target.parentElement.children[0].innerText;
            liquidity = e.target.innerText;
          }
          else if ((e.target.className == 'stake') && (e.target.parentElement.parentElement.parentElement.className == 'priceBox layCell_2')) {
            betType = 'l2';
            odds = e.target.parentElement.children[0].innerText;
            liquidity = e.target.innerText;
          }
          if (!!betType && !!odds && !!liquidity && !!SELECTION) {
            let timestamp = new Date();
            timestamp = timestamp.toISOString();
            let matchedAmount = document.querySelector(MATCHED_AMOUNT_SELECTOR).innerText;
            matchedAmount = Number(matchedAmount.replace(/\D/g, ''));
            const data = {
              betType,
              matchedAmount,
              timestamp,
              odds: Number(odds),
              liquidity: Number(liquidity.slice(1)),
              selection: SELECTION

            };
            const output = JSON.stringify(data);
            console.log(output);
          }
        }
      }
      );
    }, MATCHED_AMOUNT_SELECTOR);
}

// execute scraper
bot()
  .catch(err => console.error(err));
//=============================================================================