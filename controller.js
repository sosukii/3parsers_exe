const dealerKlimatproff = require('./dealerKlimatproff')
const dealerNevatom = require('./dealerNevatom')
const dealerSystemair = require('./dealerSystemair')
const ourPage = require('./pageScraperOurSite')
const loadCompareFileOnOurSite = require('./LoadCompareFileOnOurSite')

const fs = require('fs');
const stringify = require ('csv-stringify')

async function scrape (browserInstance){
    async function compareKlimatproff (dialerObj, ourObj) {
        let arr = []
        for ( let el of ourObj ) {
            await dialerObj.map(item => {
                if ( item.name === el.name ) {
                    let obj = {
                        sku:el.sku,
                        price:item.price,
                        amount:item.amount,
                        currency:item.currency,
                        enabled:'+'
                    }
                    arr.push(obj)
                }
            })
        }
        return arr
    }
    async function compareSystemair_or_Nevatom (dialerObj, ourObj) {
        let arr = []
        for ( let el of ourObj ) {
            await dialerObj.map(item => {
                if ( item.name === el.name ) {
                    let discountPrice = Math.round(item.price - ((item.price) * (10 /100)))
                    let obj = {
                        sku:el.sku,
                        price:discountPrice,
                        amount:item.amount,
                        currency:item.currency,
                        enabled:'+'
                    }
                    arr.push(obj)
                }
            })
        }
        return arr
    }

    async function loadResultOnOurSite(variableWithData, csvName_string){
        await stringify(variableWithData,{header:true}, (err, output) => {
            if(csvName_string==='normal'){
                fs.writeFile('normal.csv', output, 'utf-8', err => {
                    if (err) {
                        console.log('klimatproff base parsing - ERROR')
                    } else {
                        console.log('klimatproff base parsing - success: normal.csv')
                    }
                })
            } else if(csvName_string==='accessories'){
                fs.writeFile('accessories.csv', output, 'utf-8', err => {
                    if (err) {
                        console.log('klimatproff accessories parsing - ERROR')
                    } else {
                        console.log('klimatproff accessories parsing - success: accessories.csv')
                    }
                })
            } else if(csvName_string==='systemair'){
                fs.writeFile('systemair.csv', output, 'utf-8', err => {
                    if (err) {
                        console.log('systemair parsing - ERROR')
                    } else {
                        console.log('systemair parsing - success: systemair.csv')
                    }
                })
            } else if(csvName_string==='nevatom'){
                fs.writeFile('nevatom.csv', output, 'utf-8', err => {
                    if (err) {
                        console.log('nevatom parsing - ERROR')
                    } else {
                        console.log('nevatom parsing - success: nevatom.csv')
                    }
                })
            }
        })
        if(csvName_string==='normal'){
            await loadCompareFileOnOurSite.load(browser,'normal')
        } else if(csvName_string==='accessories'){
            await loadCompareFileOnOurSite.load(browser,'accessories')
        } else if(csvName_string==='systemair'){
            await loadCompareFileOnOurSite.load(browser,'systemair')
        } else if(csvName_string==='nevatom'){
            await loadCompareFileOnOurSite.load(browser,'nevatom')
        }
    }

    const delay = ms => {
        return new Promise(resolve => setTimeout(() => resolve(), ms))
    }

    let browser
    try {
        browser = await browserInstance

        const klimatproffData = await dealerKlimatproff.scrape(browser)
        console.log('Климатпрофф (основной ассортимент) - успешно...')
        const klimatproffAccessories = await dealerKlimatproff.returnArrayAccessories(browser)
        console.log('Климатпрофф (аксессуары) - успешно...')

        const systemairData = await dealerSystemair.start(browser)
        console.log('Сустемаир (весь ассортимент) - успешно...')
        const nevatomData = await dealerNevatom.start(browser)
        console.log('Неватом (весь ассортимент) - успешно...')

        const ourData = await ourPage.aventScraper(browser) //ok

        const resultKlimatproff = await compareKlimatproff(klimatproffData,ourData)
        console.log('Сравнение. Климатпроф (осн-й ассортимент) - успешно')
        const resultKlimatproffAccessories = await compareKlimatproff(klimatproffAccessories,ourData)
        console.log('Сравнение. Климатпроф (аксессуары) - успешно')
        const resultSystemair = await compareSystemair_or_Nevatom(systemairData,ourData)
        console.log('Сравнение. Сустемаир (весь ассортимент) - успешно')
        const resultNevatom = await compareSystemair_or_Nevatom(nevatomData,ourData)
        console.log('Сравнение. Неватом (весь ассортимент) - успешно')

        await loadResultOnOurSite(resultKlimatproff,'normal')
        await delay(20000); console.log('Климатпроф основные товары - успешно загружены на Авент...')
        await loadResultOnOurSite(resultKlimatproffAccessories,'accessories')
        await delay(20000); console.log('Климатпроф аксессуары - успешно загружены на Авент...')
        await loadResultOnOurSite(resultSystemair,'systemair')
        await delay(45000); console.log('Сустемаир товары - успешно загружены на Авент...')
        await loadResultOnOurSite(resultNevatom,'nevatom')

        await delay(25000); console.log('Неватом товары - успешно загружены на Авент...')

        await fs.unlink('normal.csv', () => console.info('ok delete normal.csv'))
        await fs.unlink('accessories.csv', () => console.info('ok delete accessories.csv'))
        await fs.unlink('systemair.csv', () => console.info('ok delete systemair.csv'))
        await fs.unlink('nevatom.csv', () => console.info('ok delete nevatom.csv'))
        await fs.unlink('../../Downloads/catalog.csv', () => console.log('ok delete catalog.csv'))

        await browser.close()
        await console.log('Программа завершила работу!')
    }catch (e){
        console.log(e)
    }
}
module.exports = (browserInstance) => scrape(browserInstance)