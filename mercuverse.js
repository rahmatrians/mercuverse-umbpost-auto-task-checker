/**
 * @created by Rianzessh (Rahmat Riansyah)
 * @attention Star or Fork this Repo to Appreciate me, thanks!
 * Salam sahabat mercu (semercu)
 */



const puppeteer = require('puppeteer');
const loginUrl = 'https://umb-post.mercubuana.ac.id/login/index.php';
const myCourseUrl = 'https://umb-post.mercubuana.ac.id/my/';

const { user, pass } = { 'user': 'Your NIM here', 'pass': 'Your Password here' }; // input UMB POST account

let whiteFg = "\x1b[37m";
let greenFg = "\x1b[32m";
let magentaFg = "\x1b[35m";

let userAcc = [];
let res = [];
let courseDates = [];

(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    console.log('\n= UMB POST AUTO TASK CHECKER =');
    console.log('author', greenFg, '~ @rianzessh ~\n\n', whiteFg);
    console.log('[%] running...');
    console.log('[%] flying >', greenFg, loginUrl, whiteFg);
    await page.goto(loginUrl, { waitUntil: 'networkidle0' });

    console.log('[v] Safely landed 🛬');
    await page.type('#username', user);
    await page.type('#password', pass);

    try {
        await page.click('#loginbtn')
            .then(async () => {
                console.log('[%] signing in...', greenFg);
                await page.waitForNavigation({
                    waitUntil: 'networkidle0',
                }).then(async () => {
                    page.url() === loginUrl ? (console.log('[x] failed to sign in'), await page.screenshot({ path: 'failed-signin.png' })) : (await page.screenshot({ path: 'succeed-signin.png' }), console.log('[v] succeed ✅\n', whiteFg),

                        await page.goto(myCourseUrl, { waitUntil: 'networkidle0' })
                            .then(async () => {
                                let coursePercentage = [];
                                let courseLink = [];
                                let courseName = [];

                                // get User Data
                                userAcc = await page.$eval('div.usermenu > div > div > div > div > a > span > span', divs => divs.textContent);

                                console.log(`Logged in as  ${userAcc}\n`);

                                // get Course List
                                courseName = await page.$$eval('div.dashboard-card > div.card-body > div > div.text-truncate > a.coursename > span.multiline', txt => txt.map(val => val.textContent.trim().replace('...', '').split("-")[0].replace(/\s+$/, '')));
                                courseLink = await page.$$eval('div.dashboard-card > div.card-body > div > div.text-truncate > a.aalink.coursename', divs => divs.map(val => val.getAttribute('href')));
                                await courseLink.splice(0, 1);
                                courseLink = [...new Set(courseLink)];
                                coursePercentage = await page.$$eval('div.dashboard-card-footer > div.small > strong', divs => divs.map(val => val.textContent));

                                courseName.map((el, f) => console.log(`Course ${f + 1} : `, [{ name: courseName[f], percentage: coursePercentage[f], url: courseLink[f] }], '\n\n', whiteFg));


                                // Course Detail
                                for (let i = 0; i < courseLink.length; i++) {
                                    res[i] = { name: courseName[i], url: courseLink[i], percentage: coursePercentage[i] };

                                    await page.goto(`${courseLink[i]}`, { waitUntil: 'networkidle0', timeout: 0 });

                                    console.log('[%] taking screenshot...', greenFg);
                                    await page.screenshot({ path: courseName[i] + '.png', fullPage: true });
                                    console.log('[v] screenshot taken 📸', whiteFg);

                                    // get Course Dates
                                    courseDates = [[...await page.$$eval('ul.weeks > li > div.content > h3 > span > a', divs => divs.map(val => val.textContent))], ...courseDates];

                                    let weekly = [];
                                    for (let x = 0; x < courseDates[i].length; x++) {
                                        try {
                                            // get Course Title
                                            tempCourseTitle = await page.$$eval(`ul.weeks > li#section-${x} > div.content > div.summary > div > h3 > strong`, divs => divs.map(val => val.textContent));
                                            tempCourseTitle = tempCourseTitle.length > 0 ? tempCourseTitle[0] : 'empty';

                                            weekly = [...weekly, { date: courseDates[i][x], title: tempCourseTitle }];

                                            // get Course Kind Activities
                                            let tempCourseKindTasks = await page.$$eval(`ul.weeks > li#section-${x} > div.content > ul > li`, divs => divs.map(val => val.getAttribute('class').split(" ")[1]));
                                            tempCourseKindTasks = tempCourseKindTasks.length > 0 ? tempCourseKindTasks : ['empty'];

                                            // get Course Title Activities
                                            let tempCourseTitleTasks = await page.$$eval(`ul.weeks > li#section-${x} > div.content > ul > li > div > div > div:nth-child(2) > div.activityinstance > a > span.instancename`, divs => divs.map(val => val.textContent));
                                            tempCourseTitleTasks = tempCourseTitleTasks.length > 0 ? tempCourseTitleTasks : ['empty'];

                                            let tasks = [];
                                            for (let z = 0; z < tempCourseKindTasks.length; z++) {
                                                // get Course Status (chekced/unchekced)
                                                let tempCourseStatus = await page.$$eval(`ul.weeks > li#section-${x} > div.content > ul > li:nth-child(${z + 1}) > div > div > div:nth-child(2) > div.actions > form > div > button > img`, divs => divs.map(val => val.getAttribute('src').slice(-1)));
                                                tempCourseStatus = (tempCourseStatus.length > 0 ? (tempCourseStatus[0] === 'y' ? 'Sudah Dikerjakan' : 'Belum Dikerjakan') : 'Tidak Perlu Dikerjakan / Belum ada');

                                                tasks = [...tasks, { name: tempCourseTitleTasks[z], category: tempCourseKindTasks[z], status: tempCourseStatus }];

                                            }

                                            weekly[x] = { ...weekly[x], tasks };

                                            // just showing data in loop, not important
                                            console.log('\n[%] getting tasks : ', `${(x % 2 === 0 ? magentaFg : greenFg)}`, JSON.stringify(res[i], null, '\t'), JSON.stringify(weekly[x], null, '\t'), whiteFg);
                                            await sleep(1800);

                                        } catch (errs) {
                                            console.log("doesn't have any activities", errs);
                                        }
                                    }

                                    res[i] = {
                                        ...res[i], weekly
                                    };
                                }

                                // the final result's here
                                console.log(JSON.stringify({ user: userAcc, course: [...res] }));
                            })
                    );
                }).catch(() => { console.log('failed, try again') });
            }).catch(() => { console.log('failed, try again') });
    } catch (err) { console.error(err) };

    await browser.close();
})();


// for give delay in loop data, not important
let sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};