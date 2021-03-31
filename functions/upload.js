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
    let i = 0;
    // Buffer init
    var batch = db.batch()
    for (const item of result) {
      i = i + 1
      var docRef = db.collection("NewCertificate").doc(); //automatically generate unique id
      // Document create
      let document = {
        "crdate": item['Created Date'] ? excelDateToUnix(item['Created Date']) : null,
        "ctype": item['Type of Certificate'] ? item['Type of Certificate'] : '',
        "itembundle": item['Item Bundle'] ? item['Item Bundle'] : '',
        "studentid": item['Student ID'] ? item['Student ID'] : '',
        "studentname": item['Student name'] ? item['Student name'] : '',
        "phone": item['Mobile no'] ? item['Mobile no'] : '',
        "email": item['Email id'] ? item['Email id'] : '',
        "city": item['City'] ? item['City'] : '',
        "state": item['State'] ? item['State'] : '',
        "zipcode": item['Zip Code'] ? item['Zip Code'] : '',
        "address": item['Full address'] ? item['Full address'] : '',
        "schoolname": item['school_name'] ? item['school_name'] : '',
        "websiteurl": item['websiteUrl'] ? item['websiteUrl'] : '',
        "couriername": item['Courier Name'] ? item['Courier Name'] : '',
        "couriertype": item['Courier Type'] ? item['Courier Type'] : '',
        "awb": item['Airway bill'] ? item['Airway bill'] : '',
        "shipmentstatus": item['Shipment status'] ? item['Shipment status'] : '',
        "deliverydate": item['Delivery Date'] ? excelDateToUnix(item['Delivery Date']) : null,
        "vendor": item['Vendor'] ? item['Vendor'] : '',
        "data_vendor_date": item['Data given to vendor on'] ? excelDateToUnix(item['Data given to vendor on']) : null,
        "printcompletiondate": item['Print completion date'] ? excelDateToUnix(item['Print completion date']) : null,
        "vendordispatchdate": item['Dispatch by vendore on'] ? excelDateToUnix(item['Dispatch by vendore on']) : null,
        "remark" : item['Remark'] ? item['Remark'] : ''        
      }

      batch.set(docRef, document)

      // Batch write limit 500 document
      if (i % 500 === 0 || i === result.length) {
        await batch.commit()
        // Buffer
        var batch = db.batch()
      }
    }    
  })
});

function excelDateToUnix(serial) {
  try {
    return ((serial - 25569) * 86400)
  }
  catch(error) {
    return null
  }
}