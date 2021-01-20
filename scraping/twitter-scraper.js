const playwright = require('playwright');
const urlsToScrape = require('./twitter-urls.json');

async function run(){
    const browser = await playwright['firefox'].launch({
        headless:false
    });
    const context = await browser.newContext({
        userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0'
    });
    const page = await context.newPage();

    await gatherProfilePosts(page, urlsToScrape.profiles);
    await browser.close();
}

async function gatherProfilePosts(page, profileUrls){
    for(let i = 0; i < profileUrls.length; i++){
        const url = profileUrls[i];
        console.log('here 1')
        await page.goto(url, {waitUntil: 'networkidle'});
        console.log('here 2')

        
        await new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 10000)
        });
        console.log('here 3');


        try{
          await   (await page.$('div[aria-label^="Timeline:"]')).scrollIntoViewIfNeeded();
            
        }catch(e){

        }
        console.log('here 4');
        
        try{
           await  (await page.$('div[aria-label^="Timeline:"] > div')).scrollIntoViewIfNeeded();
        }catch(e){

        }
        console.log('here 5');

        try{
           await  (await page.$('div[aria-label^="Timeline:"] > div > div')).scrollIntoViewIfNeeded();
        }
        catch(e){

        }
        console.log('here 6');



    let counter=1;

       while(true){

        // scroll until you reach a tweet that came before 12 am of the current day
        let outside = await page.$eval(
            'section[aria-labelledby="accessible-list-0"] > div[aria-label^="Timeline:"] > div > div:last-of-type article[role="article"] a > time', 
            el => el.getAttribute('datetime')
        )
        // 2021-01-17T18:49:40.000Z
        console.log('outside', outside)
        const date = +outside.slice(8, 10);
        const todaysDate = new Date().getUTCDate();

        

        console.log(date, todaysDate);
        if(todaysDate === 1 && date > todaysDate){
            await page.screenshot({path: `${url.replace('https://twitter.com/', '')}.png`, fullPage: true});
            break;
        }
        else if(date < todaysDate){
            await page.screenshot({path: `${url.replace('https://twitter.com/', '')}.png`, fullPage: true});
            break;
        }
        else{
            console.log('COUNTER ', counter)
            try{
                await (await page.$('section[role="region"] > div[aria-label^="Timeline:"] > div > div:last-of-type article[role="article"]')).scrollIntoViewIfNeeded();
            }
            catch(e){
                console.log('duhhh i suck')
            }
            await new Promise((resolve, reject) => {
                
                setTimeout(() => resolve(), 5000)
            });
            counter+=1

        }
       }
        



        console.log(outside);

        // await page.screenshot({ 
        //     path: `${url.replace('https://twitter.com/', '')}.png`, 
        //     clip: {
        //         height: 1000
        //     }
        // });

    }
}
run();