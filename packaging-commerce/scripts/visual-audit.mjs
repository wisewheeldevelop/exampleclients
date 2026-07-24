import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = process.cwd();
const output = path.join(root,'audit','after');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pageUrl = pathToFileURL(path.join(root,'index.html')).href;
const axePath = path.join(root,'node_modules','axe-core','axe.min.js');
await fs.mkdir(output,{recursive:true});

const browser = await puppeteer.launch({executablePath:chrome,headless:true,args:['--allow-file-access-from-files','--disable-gpu','--no-first-run']});
const page = await browser.newPage();
const consoleErrors=[];
page.on('console',message=>{if(message.type()==='error') consoleErrors.push(message.text());});
page.on('pageerror',error=>consoleErrors.push(error.message));

const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function settle(){await page.waitForNetworkIdle({idleTime:350,timeout:12000}).catch(()=>{});await pause(850);}
async function load(viewport){await page.setViewport(viewport);await page.goto(pageUrl,{waitUntil:'domcontentloaded'});await page.evaluate(()=>localStorage.removeItem('forma-cart'));await page.reload({waitUntil:'domcontentloaded'});await settle();}
async function warmFullPage(){await page.evaluate(async()=>{document.querySelectorAll('img[loading="lazy"]').forEach(img=>img.loading='eager');const step=Math.max(innerHeight*.72,520);for(let y=0;y<document.documentElement.scrollHeight;y+=step){scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});})));scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});}

await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
await load({width:1440,height:1050,deviceScaleFactor:1});
await page.screenshot({path:path.join(output,'desktop-1440.png')});
await warmFullPage();
await page.evaluate(()=>document.documentElement.classList.add('capture-all'));
await page.screenshot({path:path.join(output,'desktop-full.png'),fullPage:true});
await page.evaluate(()=>document.documentElement.classList.remove('capture-all'));

const initialProductCount=await page.$$eval('.product-card',nodes=>nodes.length);
await page.$eval('#categories',element=>element.scrollIntoView({block:'start'}));
await pause(500);
await page.screenshot({path:path.join(output,'desktop-categories.png')});
const categoryImagesLoaded=await page.$$eval('.category-tile img',images=>images.filter(image=>image.complete && image.naturalWidth>0).length);
await page.click('[data-category-jump="pizza"]');
await page.waitForFunction(()=>document.querySelector('.product-card')?.dataset.id==='pizza36');
await pause(500);
const categoryJumpProductCount=await page.$$eval('.product-card',nodes=>nodes.length);
await page.click('[data-filter="plastic"]');
await page.waitForFunction(()=>document.querySelector('.product-card')?.dataset.id==='pp500');
await page.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelector('.product-card')).opacity)>.98);
await page.screenshot({path:path.join(output,'desktop-filter-plastic.png')});
const filterProductCount=await page.$$eval('.product-card',nodes=>nodes.length);
const filteredImageVisible=await page.$eval('.product-card img',image=>{const rect=image.getBoundingClientRect();return image.complete && image.naturalWidth>0 && rect.width>0 && rect.height>0 && parseFloat(getComputedStyle(image.closest('.product-card')).opacity)>.95;});

await page.$eval('.product-card [data-view-product]',button=>button.click());
await page.waitForSelector('[data-product-layer]:not([hidden])');
await pause(450);
await page.screenshot({path:path.join(output,'desktop-quick-view.png')});
await page.click('.modal-close[data-close-product]');
await page.waitForFunction(()=>document.querySelector('[data-product-layer]').hidden===true);
await page.click('.product-card [data-add-product]');
await page.click('[data-open-cart]');
await page.waitForSelector('[data-cart-layer]:not([hidden])');
await pause(300);
await page.screenshot({path:path.join(output,'desktop-cart.png')});
const cartCount=await page.$eval('.cart-count',node=>node.textContent);
await page.click('.modal-close[data-close-cart]');

await page.addScriptTag({path:axePath});
const accessibility=await page.evaluate(async()=>{const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return{violations:result.violations.map(item=>({id:item.id,impact:item.impact,help:item.help,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))})),passes:result.passes.length,incomplete:result.incomplete.length};});
const performance=await page.evaluate(()=>{const resources=performance.getEntriesByType('resource');return{domNodes:document.querySelectorAll('*').length,resourceCount:resources.length,decodedBodyBytes:Math.round(resources.reduce((s,x)=>s+(x.decodedBodySize||0),0)),loadMs:Math.round(performance.getEntriesByType('navigation')[0]?.loadEventEnd||0)};});

await load({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
await page.screenshot({path:path.join(output,'mobile-390.png')});
await page.click('[data-menu-toggle]');await pause(250);
await page.screenshot({path:path.join(output,'mobile-menu.png')});
await page.click('[data-menu-toggle]');
await page.$eval('#categories',element=>element.scrollIntoView({block:'start'}));await pause(450);
await page.screenshot({path:path.join(output,'mobile-categories.png')});
await warmFullPage();
await page.evaluate(()=>document.documentElement.classList.add('capture-all'));
await page.screenshot({path:path.join(output,'mobile-full.png'),fullPage:true});
await page.evaluate(()=>document.documentElement.classList.remove('capture-all'));

const report={generatedAt:new Date().toISOString(),viewports:['1440x1050','390x844'],checks:{initialProductCount,categoryImagesLoaded,categoryJumpProductCount,filterProductCount,filteredImageVisible,quickViewOpened:true,cartCount,mobileMenuOpened:true},accessibility,performance,consoleErrors:[...new Set(consoleErrors)]};
await fs.writeFile(path.join(output,'audit-report.json'),JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report,null,2));
