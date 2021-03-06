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
var columnError = require('./columnError.json')



exports.upload = functions.region('asia-south1').storage.object().onFinalize(async (object) => {

  const fileBucket = object.bucket; // The Storage bucket that contains the file.

  const filePath = object.name; // File path in the bucket.

  const fileName = path.basename(filePath);

  const fileRef = gcs.bucket(fileBucket).file(fileName)

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
      if(i === 0) {
        let logDocument;

        // Check Column Names
        var checkColumnError = checkColumn(result)
          if(checkColumnError && !(checkColumnError.success) && (checkColumnError.data) && (checkColumnError.data.length > 0)) {
            console.log('Error on column ----->', checkColumnError.message)
            logDocument = {
              errorLog: checkColumnError.data,
              createdAt: +new Date,
              updatedAt: +new Date
            }
            await db.collection('excelUploadError').doc().set(logDocument)
            return
          } else if(checkColumnError && !(checkColumnError.success)) {
            logDocument = {
              errorLog: ['Internal error', checkColumnError.message],
              createdAt: +new Date,
              updatedAt: +new Date
            }
            await db.collection('excelUploadError').doc().set(logDocument)
            return
          }

        // Check Unique Code no
        var checkRowId = checkUniqueId(result)
        console.log('CHECK ROW ID ----->', checkRowId)
        if (checkRowId && !(checkRowId.success) && (checkRowId.data) && (checkRowId.data.length > 0)) {
          console.log('Error on column ----->', checkRowId.message)
          logDocument = {
            errorLog: checkRowId.data,
            createdAt: +new Date,
            updatedAt: +new Date
          }
          await db.collection('excelUploadError').doc().set(logDocument)
          return
        } else if (checkRowId && !(checkRowId.success)) {
          logDocument = {
            errorLog: ['Internal error', checkRowId.message],
            createdAt: +new Date,
            updatedAt: +new Date
          }
          await db.collection('excelUploadError').doc().set(logDocument)
          return
        }
      }
      var collectionRef = db.collection('NewCertificate');
      var query = await collectionRef.where('uniqueId', '==', item["Unique Code no"]).get()
      query.forEach(async doc => {
        await doc.ref.delete()        
      })
      i = i + 1
      var docRef = db.collection("NewCertificate").doc(); //automatically generate Unique Code no
      // Document create
      let document = {
        "uniqueId": item["Unique Code no"],
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
        "remark": item['Remark'] ? item['Remark'] : '',
        "updatedAt": +new Date
      }

      batch.set(docRef, document)

      // Batch write limit 500 document
      if (i % 500 === 0 || i === result.length) {
        await batch.commit()
        // Buffer
        batch = db.batch()
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

function checkColumn(setItem) {
  try {
    var keySet = new Set()
    for (var i in setItem)
      Object.keys(setItem[i]).filter(item => keySet.add(item));
    var keySetArr = [...keySet]
    var actualColumn = ['Created Date', 'Type of Certificate', 'Item Bundle',
      'Student ID', 'Student name', 'Mobile no',
      'Email id', 'City', 'State',
      'Zip Code', 'Full address', 'school_name',
      'websiteUrl', 'Courier Name', 'Courier Type',
      'Airway bill', 'Shipment status', 'Delivery Date',
      'Vendor', 'Data given to vendor on', 'Print completion date',
      'Dispatch by vendore on', 'Remark', "Unique Code no"
    ]
    var differenceColumn = actualColumn.filter(arr1Item => !keySetArr.includes(arr1Item));
    let errorMessages = new Array()
    for(var i = 0;  i < differenceColumn.length; i++) {
      console.log("COLUMN ERROR ---------->", columnError[differenceColumn[i]].errorMessage)
      errorMessages.push(columnError[differenceColumn[i]].errorMessage)
    }
    if(errorMessages.length > 0) {
      return {
        success: false,
        message: 'error',
        data: errorMessages
      }
    }
    else {
      return {
        success: true,
        message: 'No error',
        data: []
      }
    }
  }
  catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}

function checkUniqueId(setItem) {
  try {
    var keySet = new Set()
    for (var i in setItem) {
      console.log('Unique Code no ----->', setItem[i]['Unique Code no'])
      if (typeof (setItem[i]['Unique Code no']) === 'number') {
        keySet.add(setItem[i]['Unique Code no'])
      } else {
        let errorMessages = new Array()
        errorMessages.push('Excel sheet upload error some row does not contain Unique Code no')
        errorMessages.push('Unique Code no should be a number')
        if (errorMessages.length > 0) {
          return {
            success: false,
            message: 'error',
            data: errorMessages
          }
        }
      }
    }
    if (keySet.size !== setItem.length) {
      let errorMessages = new Array()
      errorMessages.push('Unique Code no repeted please check excel sheet OR Unique Code no not found')
      if (errorMessages.length > 0) {
        return {
          success: false,
          message: 'error',
          data: errorMessages
        }
      }
      else {
        return {
          success: true,
          message: 'No error',
          data: []
        }
      }
    }
  }
  catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}