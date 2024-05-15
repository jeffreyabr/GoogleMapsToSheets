# GoogleMapsToSheets
Pulls info from Google Maps (using the Google Places API) into a Google Sheet

This Google Apps Script uses the Google Places API to get place info from Google Maps into a Google Sheet. This can be used for any number of reasons, however it was born out of an interest to automate the process of building Google MyMaps for travel research.

For a given row where the cell in column E is empty, the script will search for what is entered in column A (ie. the place name). In its current form, it will return a JSON and parse it for the address, phone number, website, Google Maps URL, and business hours. Additional search paramters are listed here:
https://developers.google.com/maps/documentation/places/web-service/details#Place

You will need to create a Google API Key.
You can get an API key from Google API Console. Basically, you need to:
1. Create a project in Google API Console: https://console.cloud.google.com/getting-started?supportedpurview=project
2. Enable APIs that your project will access (in our case Google Maps API and Google Sheets API);
3. Generate an API key for the project (you can have multiple keys, and can set various restrictions—e.g. the key can be used only from certain websites/domains).
4. Use this API key in your JavaScript code.

The script is run with a cusom menu on the Google Sheet called Get Place Info.
    
To use this with Google MyMap, you will import your Google Sheet as a layer and choose the address and name columns when asked where to place and how to name your markers. 
