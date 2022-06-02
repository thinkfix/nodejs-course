const csvToJson = require('csvtojson');
const csvFilePath = './csv/nodejs-hw1-ex1.csv';
const fs = require('fs');

const readStream = fs.createReadStream(csvFilePath);
const writeStream = fs.createWriteStream('./csv/obj.json');

readStream.pipe(csvToJson()).pipe(writeStream);

// csvToJson()
//     .fromFile(csvFilePath)
//     .then((jsonObj) => console.log(jsonObj));

