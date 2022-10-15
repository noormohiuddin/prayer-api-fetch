const http = require('http');

const baseURL = 'http://api.aladhan.com/v1/calendarByCity';

const parsePrayerResponse = (prayerTimesJson) => 
prayerTimesJson.data.reduce((parsed, d) => {
    const dt = d.date.gregorian;
    const key = (dt.month.number + "").padStart(2, 0) + '-' + dt.day;

    parsed[key] = Object.values(d.timings)
        .reduce((arr, cur, i) => {
            if ([0, 1, 2, 3, 5, 6].includes(i))
                arr.push(cur);

            return arr;
        }, [])
        .map(s => s.substr(0, 5));

    return parsed;
}, {});

const getByCity = (country, city, year, month) => {
    return new Promise((resolve, reject) => {
        //const url = baseURL + 'city=' + city + '&country=' + country + '&year=' + year + '&month=' + month;
        const url = baseURL + `?city=${city}&country=${country}&year=${year}&month=${month}`
    
        http.get(url, (res) => {
            if (res.statusCode !== 200) {

                reject(`Did not get an OK from the server. Code: ${res.statusCode}`)
                console.error();
                res.resume();
                return;
            }
            
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('close', () => {
                console.log('Retrieved all data');
                resolve(JSON.parse(data));
            });


        });
    });
}

Promise.all(
    Array(12).fill().map((x, i) => i + 1).map(month => {
        return getByCity('Canada', 'Toronto', 2022, month)
    })
)
.then((res) => {
    console.log(
        res.map(json => parsePrayerResponse(json))
        .reduce((obj, curr) => ({
            ...obj,
            ...curr
        }), {})
    );
})
.catch(err => {
    console.error(err);
});