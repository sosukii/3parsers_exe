const obj = {
    link:'https://www.nevatom.ru/catalog/ventilyatory_1/',
    async start (browser) {
        let arrayObjectsWithNameAndPrice = []

        async function getDataAtOnePage (){
            let dataAtOnePage = await page.evaluate(async () => {
                let page = []
                let rows = document.querySelectorAll('tbody > tr')
                rows.forEach(oneRow => {
                    let name = oneRow.querySelector('td.name').textContent

                    try{
                        let price = (oneRow.querySelector('span.b-price').textContent).replace(' руб.', '')
                        let obj = {
                            name,
                            price: price.replace(' ', ''),
                            amount:'1',
                            currency:'RUB'
                        }
                        page.push(obj)
                    } catch (e) {
                        let obj = {
                            name,
                            price: ' ',
                            amount:'0',
                            currency:'RUB'
                        }
                        page.push(obj)
                    }
                })
                return page
            })
            return dataAtOnePage
        }
        async function isTbodyExist() {
            return await page.$('tbody')
        }
        async function returnNewUrls (){
            const arrayLinksOnOnPage = []
            const links = await page.$$eval('a.e-pagination',e=>e.map(i=>i.getAttribute('href')))
            links.forEach(e=>{
                arrayLinksOnOnPage.push(`https://www.nevatom.ru${e}`)
            })
            let uniqueLinksArr = []
            for(let e of arrayLinksOnOnPage){
                if(!uniqueLinksArr.includes(e)){
                    uniqueLinksArr.push(e)
                }
            }
            return uniqueLinksArr
        }
        async function getUrlForEachCategory() {
            const arrayOfCategories = []
            const elements = await page.$$eval('a.b-tile__title', elems => elems.map(item => item.getAttribute('href')))
            elements.forEach(e => {
                arrayOfCategories.push(`https://www.nevatom.ru${e}`)
            })
            return arrayOfCategories
        }
        async function getNameAndPrice() {
            let [arrowPagination] = await page.$x("//a[contains(., 'След.')]")

            let dataAtOnePage = await getDataAtOnePage()
            arrayObjectsWithNameAndPrice.push(dataAtOnePage)

            if (arrowPagination){
                let links = await returnNewUrls()
                for (let e of links){
                    await page.goto(e)
                    let dataAtOnePage = await getDataAtOnePage()
                    arrayObjectsWithNameAndPrice.push(dataAtOnePage)
                }
            }
        }

        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto(this.link);

        await page.waitForSelector('div.l-page-wrapper.l-page')
        let links = await getUrlForEachCategory()

        async function returnDataOrReturnLinks (arrLinks){
            for (let e of arrLinks){
                await page.goto(e)
                await page.waitForSelector('div.l-page-wrapper.l-page')

                if (await isTbodyExist()){
                    await getNameAndPrice()
                } else {
                    let links = await getUrlForEachCategory()
                    await returnDataOrReturnLinks(links)
                }
            }
        }
        await returnDataOrReturnLinks(links)

        let result = arrayObjectsWithNameAndPrice.flat(Infinity)
        return result
    }
}

module.exports = obj