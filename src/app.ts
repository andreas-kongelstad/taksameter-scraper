
/*

AutoPASS

-Rabatten økes fra 10 til 20 % for kjøretøy under 3.500 kg
-Timesregel; du betaler kun for én bompassering i timen i området Indre ring og Oslo ringen, og én bompassering i timen i Bygrensen. Du betaler for den dyreste passeringen
-Månedsregel; du betaler maks 60 passeringer på Bygrensen, og maks 120 passeringer i området Osloringen og Indre Ring
-AutoPASS-avtalen er gyldig i hele Skandinavia og alle bompasseringer kommer på en samlet faktura fra oss
-Det er ingen månedsavgift eller årsavgift, kun depositum for bombrikken på 200 kr som du får tilbake når du avslutter AutoPASS-avtalen. Du betaler altså kun for dine faktiske bompasseringer


*/


import * as puppeteer from 'puppeteer';
import { TollBoth, Tax, TariffType, Geometry, TollbothRow , Convert} from './type';
import * as fs from 'fs';
import { constants } from 'crypto';

// Gets a list of anchors to pages that holds data about tollroads
let getAnchorList = async () => {

  // The page source that is up for data retrieval
  const baseUrl = 'https://www.fjellinjen.no/privat/priser/vare-bomstasjoner-fra-1-juni-2019/';

  // Holds a list og anchor to subpages containing data we want
  var anchorList: Array<string> = new Array<string>();

  // Start the browser
  const browser = await puppeteer.launch(); //{headless: false});
  const page = await browser.newPage();

  // Go to main page
  await page.goto(baseUrl);

  // Get the number of pages
  var pageCount: number = await page.evaluate(() => {
    return document.querySelectorAll('#tile-2396 > div > nav > ul > li.page.page-item').length;
  });
  
  // Iterate throug the numbers of pages and build a list of anchors to the sub-pages were the data is displayed
  for(let index = 0; index < pageCount; index++) {

    // Go to page with specified index page
    await page.goto(`${baseUrl}?offset2396=${index}`);

    // Get a list of anchors to the sub-pages were the data is displayed
    let pageAnchorList: Array<string> = await page.evaluate((selector) => {
      const anchors_node_list = document.querySelectorAll(selector);
      return [...anchors_node_list].map(link => link.href);  
    }, '#tile-2396 > div > ul > li > article > a');

    anchorList = anchorList.concat(pageAnchorList)
  }
  // Close the browser
  await browser.close();

  return anchorList
};

let getBarrier = async (anchor: string) => {

  const tollBoth: TollBoth = new TollBoth();

  // Start the browser
  const browser = await puppeteer.launch(); //{headless: false});
  const page = await browser.newPage();
  
  // Go to main page
  await page.goto(anchor);

  // Create a unique id for the toolBoth
  tollBoth.id = Math.random().toString(36).substr(2, 15);

  // Get the barrier name
  tollBoth.name = await page.evaluate(() => {
    return document.querySelector('#placeholder-content > div > article > header > h1').innerHTML; 
  });

  // Get the tariff group name
  tollBoth.barrier = await page.evaluate(() => {
    return document.querySelector('#placeholder-content > div > article > div > div > div.tollbooth__meta-info > div.column.tariff-group > span').innerHTML; 
  });

  // Get the tariff type
  let type = await page.evaluate(() => {
    return <TariffType>document.querySelector('#placeholder-content > div > article > div > div > div.tollbooth__meta-info > div.column.tariff-direction > span.info').innerHTML; 
  });

  var tax: Tax;
  var count = 0;
  let groupName1 = await page.evaluate(() => {
    return document.querySelector('#placeholder-content > div > article > div > div > div.rates > div > div > div:nth-child(1) > div > div.tollbooth-header-container > div.tollbooth-type').innerHTML; 
  });
  const taxArrayGroup1 = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('#placeholder-content > div > article > div > div > div.rates > div > div > div:nth-child(1) > div > table tbody tr td'))
    return tds.map(td => td.innerHTML)
  });
  var taxArray1: Tax[] = new Array<Tax>();
  taxArrayGroup1.forEach(element => {
    if(count == 0) {
      tax = {
        name: '',
        rate: {
          low: 0,
          high: 0
        }
      }
      tax.name = element
      count++;
    } else if(count == 1) {
      tax.rate.low = +element.replace(/[^0-9]/g,'');
      count++;
    } else if(count == 2) {
      tax.rate.high = +element.replace(/[^0-9]/g,'');      
      taxArray1.push(tax);
      count = 0;
    }
  });
  let groupName2 = await page.evaluate(() => {
    return document.querySelector('#placeholder-content > div > article > div > div > div.rates > div > div > div:nth-child(2) > div > div.tollbooth-header-container > div.tollbooth-type').innerHTML; 
  });
  const taxArrayGroup2 = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('#placeholder-content > div > article > div > div > div.rates > div > div > div:nth-child(2) > div > table tbody tr td'))
    return tds.map(td => td.innerHTML)
  });
  var taxArray2: Tax[] = new Array<Tax>();
  taxArrayGroup2.forEach(element => {
    if(count == 0) {
      tax = {
        name: '',
        rate: {
          low: 0,
          high: 0
        }
      }
      tax.name = element
      count++;
    } else if(count == 1) {
      tax.rate.low = +element.replace(/[^0-9]/g,'');
      count++;
    } else if(count == 2) {
      tax.rate.high = +element.replace(/[^0-9]/g,'');      
      taxArray2.push(tax);
      count = 0;
    }
  });

  tollBoth.tariff = {    
    type: type,
    groups: [
      {
        id: +groupName1.substring(groupName1.length-1),
        name: groupName1,
        rushhour: [
          {
            "start": "06:30",
            "end": "09:00"
           
          },
          {
            "start": "15:00",
            "end": "17:00"
          }
        ],
        tax: taxArray1
      },
      {
        id: +groupName2.substring(groupName2.length-1),
        name: groupName2,
        rushhour: [
          {
            "start": "06:30",
            "end": "09:00"
           
          },
          {
            "start": "15:00",
            "end": "17:00"
          }
        ],
        tax: taxArray2
      }
    ]
  }

  // Get the barrier location
  tollBoth.geometry = await page.evaluate(() => {
    const regex = /center=(-?[\d]*\.[\d]*)%2C(-?[\d]*\.[\d]*)&/; //extract lon lat from center querystring value;
    const src = document.querySelector('.articleelement.custom.location > span > img').attributes.getNamedItem('src').value; 
    let matches;
    if((matches = regex.exec(src)) !== null)  {
      const geometry: Geometry = {type: 'Point', coordinates: [] }
      matches.forEach((match, groupIndex) => {
        console.log(match);
        if(groupIndex > 0 ) {
          geometry.coordinates.push(+match)
        }
      });
      return geometry;
    } else {
      return null;
    }
  });

  // Close the browser
  await browser.close();

  return tollBoth;
}

/*
getAnchorList().then((anchorList: Array<string>) => { 
  // fs.writeFile(__dirname + '/../../tollboth-server/src/data/tollboths.json', '[', function(err) {
  //   if (err) throw err;
  // });

  fs.writeFile(__dirname + '/barriers.json', '[', function(err) {
    if (err) throw err;
  });

  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
  for(let i = 0; i < anchorList.length; i++) {
    setTimeout( function timer() {
      getBarrier(anchorList[i]).then((tollBoth: TollBoth) => {
        console.log(i);
        var deliminator = ',';
        if(anchorList.length-1 == i) {
          deliminator = ']' 
        }

        fs.appendFile(__dirname + '/barriers.json', (JSON.stringify(tollBoth, null,1)+deliminator) , function (err) {
          if (err) throw err;
       });
       
      });
    }, i*3000 );
  }

});
*/



let createFlatFile = async () => { 

  var buffer = fs.readFileSync(__dirname + '/barriers.json');
  var string = buffer.toString('utf-8')

  const tollboths = Convert.toTollBoth(string);

  return tollboths;

}


function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const genreA = a.id.toUpperCase();
  const genreB = b.id.toUpperCase();

  let comparison = 0;
  if (genreA > genreB) {
    comparison = 1;
  } else if (genreA < genreB) {
    comparison = -1;
  }
  return comparison;
}

createFlatFile().then((tollbothList: Array<TollBoth>) => { 
  
  var index = 1;

  var tollbothRows = new Array<TollbothRow>();
  
  tollbothList.map(tollboth => {    
    tollboth.tariff.groups.forEach(group => {
      group.rushhour.forEach(rushhour => {
        group.tax.forEach(tax => {
          var tollbothRow = new TollbothRow()
          //tollbothRow.index = index++;
          tollbothRow.id = tollboth.id;
          tollbothRow.name = tollboth.name;
          tollbothRow.barrier = tollboth.barrier;
          tollbothRow.tariffType = tollboth.tariff.type;
          tollbothRow.tariffGroupId = group.id;
          tollbothRow.tariffGroupName = group.name;
          tollbothRow.tariffGroupRushHourStart = rushhour.start;
          tollbothRow.tariffGroupRushHourEnd = rushhour.end;
          tollbothRow.tariffGroupTaxName = tax.name;
          tollbothRow.tariffGroupTaxRateHigh = tax.rate.high;
          tollbothRow.tariffGroupTaxRateLow = tax.rate.low;
          tollbothRow.geometryType = tollboth.geometry.type;
          tollbothRow.geometryLatitude = tollboth.geometry.coordinates[0]; 
          tollbothRow.geometryLongitude = tollboth.geometry.coordinates[1];
          tollbothRows.push(tollbothRow);
        });
      });
    });    
  });

  // fs.writeFile(__dirname + '/barriers_flat.txt', '[', function(err) {
  //   if (err) throw err;
  // });

  // for(let i = 0; i < tollbothRows.length; i++) {

  //   var deliminator = ',';
  //   if(tollbothRows.length-1 == i) {
  //     deliminator = ']' 
  //   }
  //   fs.appendFile(__dirname + '/barriers_flat.txt', (JSON.stringify(tollbothRows[i], null,1)+deliminator), function (err) {
  //     if (err) throw err;
  //   });
  // }

  fs.writeFile(__dirname + '/barriers_flat.csv', 'id;name;barrier;tariffType;tariffGroupId;tariffGroupName;tariffGroupRushHourStart;tariffGroupRushHourEnd;tariffGroupTaxName;tariffGroupTaxRateLow;tariffGroupTaxRateLow;geometryType;geometryLatitude;geometryLongitude\r\n', function(err) {
    if (err) throw err;
  });

  for(let i = 0; i < tollbothRows.length; i++) {
    var linefeed = '\n';
    if(tollbothRows.length-1 == i) {
      linefeed = '' 
    }

    //tollbothRows[i].index = i;
    fs.appendFile(__dirname + '/barriers_flat.csv', tollbothRows[i].toString(';') + linefeed, function (err) {
      if (err) throw err;
    });
  }

    //console.log(tollbothRows);
    console.log('Done!');

});



  







/*
(async () => {

  const tollboth: TollBoth = {
    "id": "ujzr6yywpq",
    "name": "Pårampe Granfoss fra E18",
    "barrier": "Bygrensen",
    "tariff": {
     "type": TariffType.oneway,
     "groups": [
      {
       "id": 1,
       "name": "Takstgruppe 1",
       "rushhour": [
        {
         "start": "06:30",
         "end": "09:00"
        },
        {
         "start": "15:00",
         "end": "17:00"
        }
       ],
       "tax": [
        {
         "name": "Diesel",
         "rate": {
          "low": 25,
          "high": 31
         }
        },
        {
         "name": "Bensin",
         "rate": {
          "low": 21,
          "high": 28
         }
        },
        {
         "name": "Hybrid diesel",
         "rate": {
          "low": 25,
          "high": 31
         }
        },
        {
         "name": "Hybrid bensin",
         "rate": {
          "low": 21,
          "high": 28
         }
        },
        {
         "name": "Ladbar hybrid",
         "rate": {
          "low": 21,
          "high": 28
         }
        },
        {
         "name": "Elbil",
         "rate": {
          "low": 5,
          "high": 10
         }
        },
        {
         "name": "Hydrogen",
         "rate": {
          "low": 0,
          "high": 0
         }
        }
       ]
      },
      {
       "id": 2,
       "name": "Takstgruppe 2",
       "rushhour": [
        {
         "start": "06:30",
         "end": "09:00"
        },
        {
         "start": "15:00",
         "end": "17:00"
        }
       ],
       "tax": [
        {
         "name": "Euro V og eldre",
         "rate": {
          "low": 86,
          "high": 101
         }
        },
        {
         "name": "Euro VI",
         "rate": {
          "low": 53,
          "high": 69
         }
        },
        {
         "name": "Nullutslipp",
         "rate": {
          "low": 0,
          "high": 0
         }
        },
        {
         "name": "Andre",
         "rate": {
          "low": 0,
          "high": 0
         }
        }
       ]
      }
     ]
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      59.909161,
      10.626336000000038
     ]
    }
   };


   let tollbothRows: TollbothRow[] = new Array<TollbothRow>();



   let tollbothRow: TollbothRow = new TollbothRow();
   tollbothRow.id = tollboth.id;
   tollbothRow.name = tollboth.name;
   tollbothRow.barrier = tollboth.barrier
   tollbothRow.geometryType = tollboth.geometry.type;
   tollbothRow.geometryLatitude = tollboth.geometry.coordinates[0];
   tollbothRow.geometryLongitude = tollboth.geometry.coordinates[1];
   tollbothRow.tariffType = tollboth.tariff.type;   

   
   tollboth.tariff.groups.forEach(group => {
    
    tollbothRow.tariffGroupId = group.id;
    tollbothRow.tariffGroupName = group.name;

    group.tax.forEach(tax => {
      tollbothRow.tariffGroupTaxName = tax.name;
      tollbothRow.tariffGroupTaxRateLow = tax.rate.low;
      tollbothRow.tariffGroupTaxRateHigh = tax.rate.high;
    });
    
    group.rushhour.forEach(rushhour => {
      tollbothRow.tariffGroupRushHourStart = rushhour.start;
      tollbothRow.tariffGroupRushHourEnd = rushhour.end;
    });

     
   });
   


   console.log(tollbothRow.toString(';'));

})();
*/