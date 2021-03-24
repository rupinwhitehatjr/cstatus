/*
* Google cloud storage
* https://www.npmjs.com/package/@google-cloud/storage 
* XLSX for excel file
* https://www.npmjs.com/package/xlsx
* On storage upload trigger
* Collection NewCertificate
* Only one sheet of excel can be uploaded
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');
let db = admin.firestore();
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const gcs = new Storage();
var XLSX = require('xlsx');



exports.upload = functions.region('asia-south1').storage.object().onFinalize(async (object) => {

  const fileBucket = object.bucket; // The Storage bucket that contains the file.

  const filePath = object.name; // File path in the bucket.

  const fileName = path.basename(filePath);

  const fileRef = await gcs.bucket(fileBucket).file(fileName)

  const gcsStream = fileRef.createReadStream();

  var allBuffer = new Promise((resolve, reject) => {
    var buffers = [];
    gcsStream.on('data', function (data) {
      buffers.push(data);
    });

    gcsStream.on('end', function () {
      var buffer = Buffer.concat(buffers);
      var workbook = XLSX.read(buffer, {
        type: "buffer"
      });

      var sheetName = workbook.SheetNames[0]

      //CONVERTS STREAM TO JSON
      var abe = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
      resolve(abe)
    })
  })

  return allBuffer.then(async function (result) {
    for (const item of result) {
      await (db.collection("NewCertificate").add(item)).then((docRef) => {
        // console.log("Document written with ID: ", docRef.id);
      })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }
  })
});