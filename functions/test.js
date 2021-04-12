result = [{
    "Unique Id": 1,
    'Name' : 'Hirshabh',
    "Title" : 'Dubey'
},
{

    'Name' : 'Hirshabh',
    "Title" : 'Dubey',
    "age" : 20
},
{
    "Unique Id": 2,
    'Name' : 'Hirshabh',
    "Title" : 'Dubey',
    "age" : 20,
    "key1" : 'key'
}]

// var setKey = new Set()

// for(var i in result)
//     Object.keys(result[i]).filter(item => setKey.add(item));
// var setKeyArray = [...setKey]
// console.log(setKeyArray)
// var lengthArray = setKeyArray.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0);
// var actualColumn = ['Created Date', 'Type of Certificate', 'Item Bundle', 
//     'Student ID', 'Student name', 'Mobile no', 
//     'Email id', 'City', 'State', 
//     'Zip Code', 'Full address', 'school_name',
//     'websiteUrl', 'Courier Name', 'Courier Type',
//     'Airway bill', 'Shipment status', 'Delivery Date',
//     'Vendor', 'Data given to vendor on', 'Print completion date',
//     'Dispatch by vendore on', 'Remark'
//   ]
//     // var difference = _.difference(setKeyArray[lengthArray], actualColumn);
//     var differenceArray = actualColumn.filter(arr1Item => !setKeyArray[lengthArray].includes(arr1Item));
//     console.log(differenceArray)

var checkRowId = checkUniqueId(result)
console.log('CHECK ROW ID ------->', checkRowId)
function checkUniqueId(setItem) {
    try {
      var keySet = new Set()
      for (var i in setItem) {
        console.log('UNIQUE ID ----->', typeof(setItem[i]['Unique Id']))
        if(typeof(setItem[i]['Unique Id']) === 'number') {
            keySet.add(setItem[i]['Unique Id'])
        }
        else {
            let errorMessages = new Array()
            errorMessages.push('Excel sheet upload error some row does not contain Unique Id')
            errorMessages.push('Unique Id should be a number')
            if (errorMessages.length > 0) {
                return {
                    success: false,
                    message: 'error',
                    data: errorMessages
                }
            }
        }
      }
      var keySetArr = [...keySet]
      console.log('KEY SET SIZE ---->', keySet.size)
      console.log('KEY SET ----->', keySet)
      console.log('KEY ARR LENGTH ----->',setItem.length)
      console.log('KEY ARR --------->', setItem)
      if (keySet.size !== setItem.length) {
        let errorMessages = new Array()
        errorMessages.push('Unique Id repeted please check excel sheet OR Unique Id  not found')
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