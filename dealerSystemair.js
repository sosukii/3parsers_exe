const obj = {
    link:'https://shop.systemair.com/ru-RU/ventilyatory--i--aksessuary/c43663',
    linkForDebugging:'https://shop.systemair.com/ru-RU/k/c43672',
    async start (browser) {
        let arrayWithData = []
        const delay = ms => {
            return new Promise(resolve => setTimeout(() => resolve(), ms))
        }

        async function getUrlForEachCategory() {
            const arrayOfCategories = []
            const elements = await page.$$eval('div.col-lg-4.listing-item > a', elems => elems.map(item => item.getAttribute('href')))
            elements.forEach(e => {
                arrayOfCategories.push(e)
            })
            return arrayOfCategories
        }
        async function isUpdateSelectorExist() {
            await delay(500)
            return await page.$('div.ais-Hits')
        }
        async function returnUpdateData(){
            await delay(1000)
            let datas = await page.evaluate(async ()=>{
                let arrSpecial = []
                let all_a = document.querySelectorAll('a.product-listing-row')
                all_a.forEach(a=>{
                    let name = a.getAttribute('title')
                    let price=''
                    try{
                        price = (a.querySelector('span.price-value').getAttribute('data-price')).toString()
                    }catch (e) {
                        price=''
                    }
                    let currency = 'EUR'
                    let amount = price.length>0? '1' : '0'
                    let obj = {name,price,currency,amount}
                    arrSpecial.push(obj)
                })
                return arrSpecial
            })
            return datas
        }

        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto(this.link);

        await delay(500)

        await page.waitForSelector('a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll')
        await page.click('a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll')

        const links = await getUrlForEachCategory()

        async function returnDataOrReturnLinks (arrLinks){
            for (let e of arrLinks){
                await page.goto(e)
                await page.waitForSelector('div.is-content')
                if (await isUpdateSelectorExist()){
                    let onePageUpdateData = await returnUpdateData()
                    arrayWithData.push(onePageUpdateData)
                }else {
                    let links = await getUrlForEachCategory()
                    await returnDataOrReturnLinks(links)
                }
            }
        }
        await returnDataOrReturnLinks(links)
        return arrayWithData.flat(Infinity)
    }
}
module.exports = obj