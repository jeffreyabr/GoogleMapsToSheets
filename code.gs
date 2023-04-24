// This location basis is used to narrow the search -- e.g. if you were
// building a sheet of bars in NYC, you would want to set it to coordinates
// in NYC.
// You can get this from the url of a Google Maps search.
const LOC_BASIS_LAT_LON = "ENTER_COORDINATES_IN_THE_AREA_YOU_ARE_ADDING_PLACES_FOR_HERE"; // e.g. "37.7644856,-122.4472203"

function COMBINED2(text) {
  var API_KEY = 'YOUR_API_KEY_GOES_HERE';
  var baseUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  var queryUrl = baseUrl + '?input=' + text + '&inputtype=textquery&key=' + API_KEY + "&locationbias=point:" + LOC_BASIS_LAT_LON;
  var response = UrlFetchApp.fetch(queryUrl);
  var json = response.getContentText();
  var placeId = JSON.parse(json);
  var ID = placeId.candidates[0].place_id;
  var fields = 'name,formatted_address,formatted_phone_number,website,url,types,opening_hours';
  var baseUrl2 = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';
  var queryUrl2 = baseUrl2 + ID + '&fields=' + fields + '&key='+ API_KEY + "&locationbias=point:" + LOC_BASIS_LAT_LON;

  if (ID == '') {
    return 'Give me a Google Places URL...';
  }

  var response2 = UrlFetchApp.fetch(queryUrl2);
  var json2 = response2.getContentText();
  var place = JSON.parse(json2).result;

  var weekdays = '';
  if (place.opening_hours && place.opening_hours.weekday_text) {
    place.opening_hours.weekday_text.forEach((weekdayText) => {
      weekdays += ( weekdayText + '\r\n' );
    } );
  }

  var data = [
    place.formatted_address,
    place.formatted_phone_number,
    place.website,
    place.url,
    weekdays.trim()
  ];

  return data;
}

function writeToSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const FIRST_ROW = 2;
  const sourceData = sheet.getRange(FIRST_ROW, 1, sheet.getLastRow()-FIRST_ROW+1, 6)
                          .getValues().filter(row => String(row[0]));
  for (let i = 0; i < sourceData.length; i++) {
    const sourceRow = sourceData[i];
    if (sourceRow[4] === "") {
      const text = sourceRow[0];
      const data = COMBINED2(text);
      sheet.getRange(FIRST_ROW+i, 2, 1, data.length).setValues([data]);
    }
  }
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();  
  ui.createMenu("Custom Menu")
      .addItem("Get place info","writeToSheet")
      .addToUi();
}
