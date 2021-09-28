const browser = require('./browser')
const controller = require('./controller')

const browserInstance = browser.startBrowser()
controller(browserInstance)