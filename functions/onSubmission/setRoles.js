const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.setRoles = functions
  .region('asia-east2')
  .firestore
  .document('Cache/{cacheID}')
  .onCreate((snapshot, context) => 

  { 

    userData=snapshot.data()
    action=userData["action"]
    //dont do anything on the roles if the workflow has been reopened

    if(action==="reopen")
    {
      return 0
    }


    userData=snapshot.data()
    flowID=userData["flowID"]
    stepID=userData["stepID"]
  	stepInfoPromise=getStepInfo(flowID,stepID)
    stepStructure=null
    stepInfoPromise.then((snapshot)=>{

      //console.log(snapshot.data())
      stepStructure=snapshot.data()

      creatorMeta={}
      isStepTheFirstOne=false;

      //console.log
      if("isFirst" in stepStructure)
      {
        isStepTheFirstOne=stepStructure["isFirst"]
      }

      if(isStepTheFirstOne)
      {
        creatorMeta["email"]=userData.by.email
      }

      //console.log(creatorMeta)

      if(!("fields" in stepStructure))
      {
        //There are no fields in the step
        return 0;
      }
      

      fields=stepStructure["fields"]
      if(fields.length===0)
      {
        //The fields array is empty
        return 0;
      } 


      fieldValues=userData["fieldValues"]
      stepData={}
      stepData["fields"]=fields
      stepData["fieldValues"]=fieldValues
      
      //console.log(creatorMeta)
      setRoles(flowID, stepData, creatorMeta)

      return 0

      

    }).catch((error)=>{console.error(error.message)})

    
    



    return 0
  	
  });

  async function getStepInfo(flowID, stepID)
  {

    stepInfoPromise=await db.collection("Workflows")
                            .doc(flowID)
                            .collection("steps")
                            .doc(stepID)
                            .get()

     return stepInfoPromise

  }

  async function getFlowInfo(flowID)
  {
    flowInfo=db.collection("Workflows").doc(flowID).get()
    return flowInfo
  }

  function getGroupKey(stepData)
  {
    userGroupKey=null
    //for this function to work, we need both the fieldValues and the fields key
    //in the data
    filterTerms=[]
    if("fields" in stepData && "fieldValues" in stepData)
    {
      fields=stepData.fields
      fieldValues=stepData.fieldValues
      fieldCount=fields.length
      keyArray=[];
      for(i=0;i<fieldCount;i++)
      {
        if(fields[i].userGroupKey)// Does this field determine the users group?
        {
          filterTerm={}
          filterTerm["label"]=fields[i].label
          filterTerm["value"]=fieldValues[i]
          //keyArray.push(fieldValues[i])
          filterTerms.push(filterTerm)
        }
      }
      if(keyArray.length>0)
      {
        userGroupKey=keyArray.join("-")
      }

      
    }
    return filterTerms;
  }


   async function setRoles(flowID, stepData, creatorMeta)
  {
    
    
        // fetch the correct data from the UserGroups Collection
        userGroupKeyList=getGroupKey(stepData);
        //console.log(userGroupKey)
        groupKeyCount=userGroupKeyList.length
        if(groupKeyCount===0)
        {
          return 0
        }

        
       query=db.collection("UserGroups")
       executeQuery=false;
       for(index=0;index<groupKeyCount;index++)
       {
          key=userGroupKeyList[index]["label"]
          value=userGroupKeyList[index]["value"]
          query = query.where(key, '==', value); 
          executeQuery=true
       }

       if(!executeQuery)
       {
        return 0
       }

        userGroups=await query.get()
        /*userGroups= await 
                    .where("groupKey", "==", userGroupKey)
                    .get()*/
        

            userGroups.forEach((doc)=>{
            //console.log(doc.data())
            batch=db.batch()
            if(!doc.exists)
            {
              return 0
            }
            
              //console.log("Document data:", doc.data());
              docData=doc.data()
              userGroupList=docData["groupList"]
              groupLength=userGroupList.length
              //console.log(groupLength)
              
              for(groupIndex=0;groupIndex<groupLength;groupIndex++)
              {

                stepID=userGroupList[groupIndex]["stepID"];
                users=userGroupList[groupIndex]["users"];
               // console.log(stepID)
                //console.log(users)
                if("email" in creatorMeta)
                {
                  //console.log("email present")
                  creatorEmail=creatorMeta["email"]
                  //Replace the #creator with the email of the
                  //creator
                  for(userIndex=0;userIndex<users.length;userIndex++)
                  {
                    if(users[userIndex]==="#creator")
                    {
                      users[userIndex]=creatorEmail
                    }
                  }
                  
                }
                //console.log(users)

                userListObject=admin
                              .firestore
                              .FieldValue
                              .arrayUnion
                              .apply(null, users)

               b1=db.collection("Workflows")
                  .doc(flowID)
                  .collection("steps")
                  .doc(stepID)
                  //.update({"users":userListObject})
               batch.update(b1, {"users":userListObject, "rolesSet":true})
                 
                 
               

              }
              
     
          
          return batch.commit().then(function () {
           //console.log("batch committed")
           return 0
          });
        })
    
   
   return 0
      
   
  }