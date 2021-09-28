const selectPuppeteer = require("puppeteer-select");
require('dotenv').config()

let arrayData = []
let arrayWithAccessories = []
const delay = ms => {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

const dealerObject = {
    link:'https://klimatprof.online/catalog/?LIMIT=48',
    accessoriesLink:'https://klimatprof.online/catalog/aksessuary/?LIMIT=48',

    async scrape(browser){
        async function logIn(){
            await page.waitForSelector('a.login-but')
            await page.click('a.login-but')
            await page.type('[name="USER_LOGIN"]', process.env.LOGIN)
            await page.type('[name="USER_PASSWORD"]', process.env.PASSWORD)
            await page.click('input[value="Вход"]')
            await page.waitForNavigation()
        }
        async function getDataFromCards (cardsAtOnePage){
            for (let oneCard of cardsAtOnePage){
                let name = await oneCard.$eval('div.title-image > div.title-wrap > a',e=>e.textContent)
                let textPrice = (await oneCard.$eval('div.catalog-item-price > ul ',e=>e.textContent)).split('Розничная цена: ')[1]
                let price = (textPrice.split('.00 Р')[0]).replace(' ','')

                let amount = '1'
                let isNotAvailable = await oneCard.$eval('div.catalog-item-quantity-wrap.authorized > div.catalog-item-quantity > div.region-quantity', e=> e.textContent.includes('Нет'))

                if(isNotAvailable){
                    amount='0'
                }
            if(price.includes('запросу')){
                price=''
                amount='0'
            }
                let obj={name,price,amount,enabled:'+',currency:'RUB'}
                arrayData.push(obj)
            }
        }

        let page = await browser.newPage();
        await page.goto(this.link)

        await logIn()

        async function scrapeBase(){
            await page.waitForSelector('div.catalog-item')
            let cards = await page.$$('div.catalog-item')

            await getDataFromCards(cards)

            await page.waitForSelector('div.catalog-pagination')
            let nextButtonExist = false;
            try{
                const nextButton = await page.$$eval('div.catalog-pagination', a => {
                    a.filter(a => a.textContent === 'Вперед')
                })
                nextButtonExist = true;
            } catch(err){
                nextButtonExist = false;
            }

            if(nextButtonExist){
                const paginationNextButton = await selectPuppeteer(page).getElement('a:contains(Вперед)')
                try{
                    await paginationNextButton.click()
                    return scrapeBase();
                } catch (e) {
                    return arrayData;
                }
            }
        }
        await scrapeBase()

        return arrayData
    },
    async returnArrayAccessories (browser){
        async function getDataAccessories(cardsAtOnePage){
            for(let Card of cardsAtOnePage){
                let name = await Card.$eval('div.title-image > div.title-wrap > a',e=>e.textContent)
                let textPrice = (await Card.$eval('div.catalog-item-price > ul ',e=>e.textContent)).split('Розничная цена: ')[1]
                let price = (textPrice.split('.00 Р')[0]).replace(' ','')

                let amount = '0'
                let isNotAvailable = await Card.$eval('div.catalog-item-quantity-wrap.authorized > div.catalog-item-quantity > div.region-quantity', e=> e.textContent.includes('Нет'))
                isNotAvailable? amount='0':amount='1'

                if(price.includes('Р')){
                    price=(price.split('Р')[0]).replace(' ','')
                }

                let obj={name,price,amount,enabled:'+',currency:'RUB'}
                arrayWithAccessories.push(obj)
            }
        }
        let newpage = await browser.newPage()
        await newpage.goto(this.accessoriesLink)

        async function scrapeAccessories(){
            await newpage.waitForSelector('div.catalog-item')
            let cards = await newpage.$$('div.catalog-item')
            await getDataAccessories(cards)

            await newpage.waitForSelector('div.catalog-pagination')
            let nextButtonExist = false;
            try{
                const nextButton = await newpage.$$eval('div.catalog-pagination', a => {
                    a.filter(a => a.textContent === 'Вперед')
                })
                nextButtonExist = true;
            } catch(err){
                nextButtonExist = false;
            }

            if(nextButtonExist){
                const paginationNextButton = await selectPuppeteer(newpage).getElement('a:contains(Вперед)')
                try{
                    await paginationNextButton.click()
                    return scrapeAccessories();
                } catch (e) {
                    return arrayWithAccessories;
                }
            }
        }
        await scrapeAccessories()

        return  arrayWithAccessories
    }
}
module.exports = dealerObject