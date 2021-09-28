// возвращает экзепляр запущенного браузера
const puppeteer = require ('puppeteer')

async function startBrowser(){
    let browser
    try{
        browser = await puppeteer.launch({
            headless:false,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        })
    }catch (e){
        console.log(e)
    }
    return browser
}
module.exports = {
    startBrowser
}