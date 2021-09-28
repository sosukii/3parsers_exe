const select = require("puppeteer-select");
const objLoad = {
    url:process.env.IMPORT,
    async load(browser, nameForCsv_string){
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        console.log(`Загружаем файл с обновлениями на Авент...`);
        await page.goto(this.url);

        await page.waitForSelector('#ColumnSeparator')
        if(nameForCsv_string==='normal'){
            const delay = ms => {
                return new Promise(resolve => setTimeout(() => resolve(), ms))
            }
            await delay(15000)

            const noNowButton = await select(page).getElement('body > div.swal2-container.swal2-center.swal2-fade.swal2-shown > div > div.swal2-actions > button.swal2-cancel.btn.btn-action.btn-sm')
            await noNowButton.click()

            await delay(5000)
        }

        const dropDownList_Encoding = (await page.$$('#Encoding'))[1]
        await dropDownList_Encoding.click()
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")

        await page.select('#ColumnSeparator', ',')

        const loadFileOnSiteButton = '#page-wrapper > div.wrapper.wrapper-content > div > div > div > div > div.content-container.ibox > div.ibox > div > div > div.tab-content > div.tab-pane.active > div > form > div > div:nth-child(2) > div:nth-child(2) > div.col-xs-9.col-wl-10 > div > div > div > div > file-uploader > div > div > div > div > input'
        await page.waitForSelector(loadFileOnSiteButton)

        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.click(loadFileOnSiteButton)
        ])
        if(nameForCsv_string==='normal'){
            await fileChooser.accept(['./normal.csv'])
        } else if(nameForCsv_string==='accessories'){
            await fileChooser.accept(['./accessories.csv'])
        } else if(nameForCsv_string==='systemair'){
            await fileChooser.accept(['./systemair.csv'])
        } else if(nameForCsv_string==='nevatom'){
            await fileChooser.accept(['./nevatom.csv'])
        }

        const importButton = '#page-wrapper > div.wrapper.wrapper-content > div > div > div > div > div.content-container.ibox > div.ibox > div > div > div.tab-content > div.tab-pane.active > div > form > div > div.m-b-md > div > div.page-name-block-item-additional > button'
        await page.waitForSelector(importButton)
        await page.click(importButton)
    }
}

module.exports = objLoad