// https://moduscreate.com/blog/automated-tests-for-react-js-web-apps-using-webdriverio/
// start the local server first to serve the app (via node server.js)

const Page = require('./pageobjects/page');

describe('funSketch', () => {
    it('should load', async () => {
        const page = new Page();
        await page.open("");
        
        const title = await browser.getTitle();
        expect(title).toBe("funSketch");
        
        const head = await $("h3=funSketch");
        //console.log(head);
        // toBe !== toBeEqual
        expect(await head.getText()).toBe("funSketch");
    });
});

