const csv = require('csvtojson');

const aventScraperObject = {
    urlForLogIn: process.env.URLFORLOGIN,
    async aventScraper (browser){
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto(this.urlForLogIn);

        await page.waitForSelector('#txtLogin')
        await page.type('[name="txtLogin"]', process.env.TXTLOGIN)
        await page.type('[name="txtPassword"]', process.env.TXTPASSWORD)
        await page.click('.btn-auth')

        const ButtonForCreateFile = '#page-wrapper > div.wrapper.wrapper-content > div > div > div > div > div.content-container.ibox > form > div > div > div > div > div > div > div:nth-child(3) > div.tab-content > div.tab-pane.active > div > div > div:nth-child(3) > button'
        await page.waitForSelector(ButtonForCreateFile)
        await page.click(ButtonForCreateFile)

        const delay = ms => {
            return new Promise(resolve => setTimeout(() => resolve(), ms))
        }

        async function downloadCsvFile () {
            try {
                console.log('Скачиваем наш каталог (catalog.csv)...');
                await delay(5000);
                const downloadCsvButton = '#page-wrapper > div.wrapper.wrapper-content > div > div > div > div > div.content-container.ibox > div > div.ibox > div > div:nth-child(5) > div > div > a'
                await page.waitForSelector(downloadCsvButton);
                await page.click(downloadCsvButton);
            } catch (e) {
                console.info(e)
            }
        }
        await downloadCsvFile()

        let dataAvent = async function getData () {
            try {
                console.log('Забираем данные из catalog.csv...');
                await delay(12000);
                let json = await csv().fromFile('../../Downloads/catalog.csv');
                return json
            } catch (e) {
                console.error('Ошибка при чтении данных из csv: ' + e)
            }
        }

        let dataaAvent = await dataAvent() // data here
        return dataaAvent
    }
}

module.exports = aventScraperObject;