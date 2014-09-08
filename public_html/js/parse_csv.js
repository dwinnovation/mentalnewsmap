/**
 * This script file contains the logic for reading the CSV data file.
 */

/**
 * adapted from http://stackoverflow.com/questions/14446447/javascript-read-local-text-file
 * @param file
 * @param parseFn
 * @param callbackFn
 */
function readTextFile(file, parseFn, callbackFn) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var text = rawFile.responseText;
                parseFn(text, callbackFn);
            }
        }
    }
    rawFile.send(null);
}

function parseCsv(text, callbackFn) {
    var parseOptions = {
        separator : config.csvSeparator,
        delimiter: config.csvQuoteChar,
    };
    
    $.csv.toObjects(text, parseOptions, function(err, csvData) {
        if (err) {
            alert("failed to parse csv: " + err);
        } else {
            callbackFn(csvData);
        }
    });
}

function importCsv(callbackFn) {
    readTextFile(config.csvUrl, parseCsv, callbackFn);
}
