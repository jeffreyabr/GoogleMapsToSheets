// This location basis is used to narrow the search -- e.g. if you were
// building a sheet of bars in NYC, you would want to set it to coordinates
// in NYC.
// You can get this from the url of a Google Maps search.
const DEFAULT_LOC_BASIS_LAT_LON = "ENTER_COORDINATES_IN_THE_AREA_YOU_ARE_ADDING_PLACES_FOR_HERE"; // e.g. "37.7644856,-122.4472203"
const DEFAULT_FIELDS_TO_FETCH = 'formatted_address,formatted_phone_number,website,url,opening_hours';

// Set Location Bias
function setLocationBias() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Set Location Bias', 'Enter the latitude and longitude (e.g., 33.96062107523262,-83.37531508214506):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() == ui.Button.OK) {
    const locBias = response.getResponseText();
    PropertiesService.getScriptProperties().setProperty('LOC_BASIS_LAT_LON', locBias);
    ui.alert('Location bias set to: ' + locBias);
  }
}

function getLocationBias() {
  return PropertiesService.getScriptProperties().getProperty('LOC_BASIS_LAT_LON') || DEFAULT_LOC_BASIS_LAT_LON;
}

// Save Selected Fields
function saveSelectedFields(fields) {
  PropertiesService.getScriptProperties().setProperty('FIELDS_TO_FETCH', fields);
}

function getFieldsToFetch() {
  return PropertiesService.getScriptProperties().getProperty('FIELDS_TO_FETCH') || DEFAULT_FIELDS_TO_FETCH;
}

// Display the HTML dialog for selecting fields
function setFieldsToFetch() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('fieldsDialog')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Set Fields');
}

// Fetch Place Information
function COMBINED2(text) {
  try {
    var API_KEY = 'YOUR_API_KEY_GOES_HERE';
    var baseUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
    var encodedText = encodeURIComponent(text);
    var locationBias = getLocationBias();
    var queryUrl = `${baseUrl}?input=${encodedText}&inputtype=textquery&key=${API_KEY}&locationbias=point:${locationBias}`;
    
    Logger.log('Query URL: ' + queryUrl);
    
    var response = UrlFetchApp.fetch(queryUrl);
    var json = response.getContentText();
    var placeId = JSON.parse(json);
    
    Logger.log('Find Place Response: ' + json);

    if (!placeId.candidates || placeId.candidates.length === 0) {
      throw new Error('No place found for the given text.');
    }

    var ID = placeId.candidates[0].place_id;
    var fields = getFieldsToFetch();
    var baseUrl2 = 'https://maps.googleapis.com/maps/api/place/details/json';
    var queryUrl2 = `${baseUrl2}?placeid=${ID}&fields=${fields}&key=${API_KEY}`;
    
    Logger.log('Details Query URL: ' + queryUrl2);
    
    var response2 = UrlFetchApp.fetch(queryUrl2);
    var json2 = response2.getContentText();
    var place = JSON.parse(json2).result;

    Logger.log('Place Details Response: ' + json2);

    var data = fields.split(',').map(field => {
      if (field.trim() === 'opening_hours') {
        return (place.opening_hours && place.opening_hours.weekday_text) ? place.opening_hours.weekday_text.join('\n') : '';
      } else {
        return place[field.trim()] || '';
      }
    });

    return data;
  } catch (error) {
    Logger.log('Error fetching place data: ' + error.message);
    return ['Error', '', '', '', '', ''];
  }
}

// Write Data to Sheet
function writeToSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const FIRST_ROW = 2;
  const sourceData = sheet.getRange(FIRST_ROW, 1, sheet.getLastRow() - FIRST_ROW + 1, 6)
                          .getValues().filter(row => String(row[0]));
  const totalRows = sourceData.length;

  for (let i = 0; i < sourceData.length; i++) {
    const sourceRow = sourceData[i];
    if (sourceRow[4] === "") {
      const text = sourceRow[0];
      const data = COMBINED2(text);
      const range = sheet.getRange(FIRST_ROW + i, 2, 1, data.length);
      range.clearContent();
      range.setValues([data]);
    }
  }

  const ui = SpreadsheetApp.getUi();
  ui.alert('Processing complete');
}

// Highlight Cells if Changed
function highlightIfChanged(range, newData) {
  const sheet = range.getSheet();
  const oldData = range.getValues();
  for (let i = 0; i < oldData.length; i++) {
    for (let j = 0; j < oldData[i].length; j++) {
      if (oldData[i][j] !== newData[i][j]) {
        range.getCell(i + 1, j + 1).setBackground('yellow');
      }
    }
  }
  range.setValues(newData);
}

// Refresh Data
function refreshData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const FIRST_ROW = 2;
  const sourceData = sheet.getRange(FIRST_ROW, 1, sheet.getLastRow() - FIRST_ROW + 1, 6)
                          .getValues().filter(row => String(row[0]));
  const totalRows = sourceData.length;

  for (let i = 0; i < sourceData.length; i++) {
    const sourceRow = sourceData[i];
    const text = sourceRow[0];
    const newData = COMBINED2(text);
    const range = sheet.getRange(FIRST_ROW + i, 2, 1, newData.length);
    highlightIfChanged(range, [newData]);
  }

  const ui = SpreadsheetApp.getUi();
  ui.alert('Refresh complete');
}

// Add Custom Menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Custom Menu")
      .addItem("Get place info", "writeToSheet")
      .addItem("Refresh Data", "refreshData")
      .addItem("Set Location Bias", "setLocationBias")
      .addItem("Set Fields", "setFieldsToFetch")
      .addToUi();
}
