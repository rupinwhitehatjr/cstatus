const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();

 exports.processSubmission = functions
  .region('asia-east2')
  .firestore
  .document('Workflows1/{flowID}/steps/{stepId}')
  .onUpdate((change, context) => {

    
    const newValue = change.after.data();
    const sourceStepData=newValue
    flowID=context.params.flowID
    stepId=context.params.stepId
    //console.log(newValue)
    //console.log(Date.now())
    if("action" in newValue)
    {
      if(newValue.action===null)
      {
        //console.log("Retriggered")
        return 0;
      }
    }
    else
    {
      return 0
    }

    searchTermsArray=[]
    action=newValue.action
    nextStepIndex=newValue.nextStep
    previousStepIndex=newValue.previousStep


    /*Ensure that the current step is updated
      because as we set roles and other things in the same step, 
      it will retrigger the onUpdate and can have random things happpen
      This act itself will retrigger onUpdate, but the action attribute will be
      set to null, hence, the next retriggers will happen, but will have no effect

      The correct way to do this is to cache the data in a document
      in another "cache" collection which gets created when
      user submits the workflow.

      We can then update our Workflow steps without retriggering onUpdate.

      The whole Workflows collection can then be strongly restricted using 
      firestore rules, and can only be updated with functions.

      This whole process can be refactored in that case, because

      we can isolate the setting roles in a different function
      altogether.


    */
    
   if(action==="rejected" || action==="approved")
   {
       updatedValue=updateCurrentstep(flowID,stepId,newValue)
   } 





    flowMeta=null
    flowInfo=db.collection("Workflows").doc(flowID).get()
    rolePromise=null;
    /*We use the Role Promise at the end of the process to update 
    Notification Queue
    */
    rolePromise=flowInfo.then((doc)=>{
      //console.log(doc)
      //console.log(nextStepIndex)
      creatorMeta={}
      //console.log(doc.data())
      if(doc.exists)
      {
          flowMeta=doc.data()          
          //console.log(flowMeta)
          creatorMeta["email"]=flowMeta.email

                   
      }

      

      //console.log(creatorMeta)
      //Based on the data in the current step, add roles from UserGroups
      //creatorMeta is sent because some roles have a #creator tag on them
      //those are the steps where the creator will be notified
      rolesHaveBeenSet=setRoles(flowID,newValue,creatorMeta)
      return doc.data()
        
    })
    .catch((error)=>{console.error(error.message)})



    
    
    //return 0
    actionedby=newValue.by
    //console.log(user.name)
    //return 0;
    user_name=actionedby.name
    stepName=newValue.name
    fields=newValue.fields
    fieldValues=null
    if("fieldValues" in newValue)
    {
      fieldValues=newValue.fieldValues

    }


    /*if(fieldValues.length>0 && fields.length>0)
    {
      newSearchTerms=getSearchTerms(fields,fieldValues)
      searchTermsArray=searchTermsArray.concat(newSearchTerms)
    }*/
    
    

   
    //remove the action attribute

    /*****************************************************************/

    /*Code to Execute when the Flow is Approved

    1. Add a Approved Log
    2. If the Next Step exists
        a. Set the Next Step as Active
        b. Update the Document/Facade of the Flow
        c. Send a Notification to the Users of the Next Step
    3. If the Next step does not exist, means the flow has ended
        a. Add a Log that the Flow was closed
        b. Close the Workflow 
        c. Send an Email to everyone that a flow is completed


    */

    


    targetStepIndex=null
    if(action==="approved")
    {
      
      addLogOnApprove(flowID,user_name,stepName)
      if(nextStepIndex!==null)
      {
        
       targetStepIndex=nextStepIndex
       let activeStepPromise=setStepAsActive(flowID,nextStepIndex)

        /*The activesteppromise variable holds the
        data for the active step.
        Use the same data to update the flow meta/facade 
        In addition to that, also send email notifications of the
        step coming into the queue of owner of the next step.
        
        */

        targetStepData=null;
        targetStepData=activeStepPromise.then((querySnapshot)=> {
              //console.log(querySnapshot.data())
              targetStepData=querySnapshot.data()
              targetStepID=querySnapshot.id
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=targetStepData.name
              flowMeta["active_step_id"]=querySnapshot.id
              users=[]
              if("users" in targetStepData)
              {
                users=targetStepData.users
                
              }
              flowMeta["step_owners"]=users
              flowMeta["closed"]=false
              
              updateFlowFacade(flowID, flowMeta)              
             // updateNotificationQueue(sourceStepData, nextStepIndex,flowID)           
              return targetStepData
            
        }).catch((error)=> { console.error(error.message) });


      }
      else
      {
          console.log("Flow is completed")
          //mark the flow as completed
          let logClose=addLogOnClose(flowID,user_name,stepName)
          logClose.then(()=>{
              setWorkflowAsClosed(flowID)
              //sendNotification(nextStepIndex);  
              return 0
              
          })  
          .catch((error)=> {console.error(error.message);});
      }
      // set activestep to false
      //setCurrentStepAsInactive(flowID,stepId)
      
    }



    /*****************************************************************/

    /*Code to Execute when the Flow is Rejected

    1. Add a Log
    2. If the Previous step exists
        a. Set the Previous Step as Active
        b. Update the Document/Facade of the Flow
        c. Send a Notification to the Users of the Previous Step

    */
    
    if(action==="rejected")
    {
      addLogOnReject(flowID,user_name,stepName)

      if(previousStepIndex!==null)
      {
        
        targetStepIndex=previousStepIndex
        let activeStepPromise=setStepAsActive(flowID,previousStepIndex)
        /*the activesteppromise variable holds the
        data for the active step.
        Use the same data to update the flow meta */
        targetStepData=null;
        targetStepData=activeStepPromise.then((querySnapshot)=> {
          //console.log(querySnapshot.data().index)
              targetStepData=querySnapshot.data()
              targetStepID=querySnapshot.id
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=targetStepData.name
              flowMeta["active_step_id"]=querySnapshot.id
              flowMeta["closed"]=false
              users=[]
              if("users" in targetStepData)
              {
                users=targetStepData.users
                
              }
              flowMeta["step_owners"]=users
              
              updateFlowFacade(flowID, flowMeta)
              //updateNotificationQueue(sourceStepData, targetStepID,flowID)           
              return targetStepData
            
        }).catch((error)=> {
                console.error(error.message);
              });
      }
      else
      {
        console.log("You reached the start of the Workflow")
       
      }
     
     

    }



    
   //console.log(rolePromise)
   rolePromise.then((doc)=>{

      //console.log("Resolved")
      //console.log(doc);
      var existingSearchTerms=[]
      searchTerms=[]
      if("searchTerms" in doc)
      {
        existingSearchTerms=doc.searchTerms

      }
      //console.log(existingSearchTerms)  
      searchTerms=appendSearchTerms(fields, fieldValues, existingSearchTerms)
      
      addSearchTermsToFlow(flowID,searchTerms)      
      updateNotificationQueue(sourceStepData, targetStepIndex,flowID,searchTerms)
      return 0

    }).catch((error)=>{console.error(error.message)})

    return 0
    
  });


function addSearchTermsToFlow(flowID,searchTerms)
{
  meta={}
  meta["searchTerms"]=searchTerms
  for(index=0;index<searchTerms.length;index++)
  {
    term=searchTerms[index]
    key=term["label"]
    value=term["value"]
    meta[key]=value
  }
  db.collection("Workflows").doc(flowID).update(meta);
}

async function updateNotificationQueue(sourceStepData, 
                                      targetStepIndex,
                                      flowID,
                                      searchTermsArray)
{
  /* In here we just manage a collection which has a list of documents pertaining to
  all different kind of notifications that need to be sent.
  A new function will start executing when a document is created.
  This will help manage to code for various different notification types.
  */
 //console.log(sourceStepData)
 //console.log(targetStepIndex)
 //console.log(flowID)
  step=await db.collection("Workflows")
      .doc(flowID)
      .collection("steps")
      .where("index", "==", targetStepIndex)
      .get()

  
  step.forEach((doc)=>{
    
      //console.log("Updating Notifications")  
      targetStepData=doc.data()
      if("users" in targetStepData)
      {
        notifyList=targetStepData.users
      } 
      else
      {
        notifyList=[]
      }
      //notifyList=[] //Temporary    
      notificationObject={}
      notificationObject["actioner"]=sourceStepData.by
      notificationObject["notify"]=notifyList
      notificationObject["action"]=sourceStepData.action
      notificationObject["flowID"]=flowID
      notificationObject["targetStepIndex"]=targetStepIndex
      notificationObject["stepName"]=sourceStepData.name
      notificationObject["timestamp"]=Date.now();
      
      notificationObject["searchTerms"]=searchTermsArray
      console.log(notificationObject)
      db.collection("NotificationQueue").doc().set(notificationObject);
      return 0


  })






  
  
return 0

}

function appendSearchTerms(fields,fieldValues, existingSearchTerms)
{
  newSearchTerms=existingSearchTerms;
  //newSearchTerms=[]
  //console.log(newSearchTerms)
  for(fieldIndex=0;fieldIndex<fields.length;fieldIndex++)
  {
    field=fields[fieldIndex]
    fieldValue=fieldValues[fieldIndex]
    //console.log(field)
    if(!("isSearchTerm" in field))
    {
      continue;
    } 
    isSearchTerm=field["isSearchTerm"]
    //console.log(isSearchTerm)
    if(!isSearchTerm)
    {
      continue;
    }


    searchTerm={}
    fieldLabel=field["label"]
    searchTerm["label"]=fieldLabel
    searchTerm["value"]=fieldValue
    existing=false;
    if(newSearchTerms.length>0)
    {
        for(a=0;a<newSearchTerms.length;a++)
        {
          //console.log(newSearchTerms[a]["label"])
          //console.log(fieldLabel)
          if(newSearchTerms[a]["label"]===fieldLabel)
          {
            newSearchTerms[a]["value"]=fieldValue
            existing=true
            break;
          }
          
        }

     }

      if(!existing)
      {
        newSearchTerms.push(searchTerm)
      }
        

      
    
  }
  //console.log(newSearchTerms)
  return newSearchTerms;
}







  function getGroupKey(stepData)
  {
    userGroupKey=null
    //for this function to work, we need both the fieldValues and the fields key
    //in the data
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
          keyArray.push(fieldValues[i])
        }
      }
      if(keyArray.length>0)
      {
        userGroupKey=keyArray.join("-")
      }

      
    }
    return userGroupKey;
  }


   async function setRoles(flowID, stepData, creatorMeta)
  {
    
    
        // fetch the correct data from the UserGroups Collection
        userGroupKey=getGroupKey(stepData);
        //console.log(userGroupKey)
        if(!userGroupKey)
        {
          return 0
        }


       
        userGroups= await db.collection("UserGroups")
                    .where("groupKey", "==", userGroupKey)
                    .get()
        

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
               batch.update(b1, {"users":userListObject})
                 
                 
               

              }

     
          
          return batch.commit().then(function () {
           //console.log("batch committed")
           return 0
          });
        })
    
   
   return 0
      
   
  }


  async function updateCurrentstep(flowID, stepID, newValue)
  {
      updatedData={}
      updatedData["activestep"]=false
      updatedData["action"]=null
      actionerEmail=newValue.by.email
      updatedData["users"]=admin.firestore.FieldValue.arrayUnion(actionerEmail)
      /*updatedData["by"]=null*/
      

      stepUpdate=await db.collection("Workflows")
              .doc(flowID)
              .collection("steps")
              .doc(stepID)
              .update(updatedData)

      return stepUpdate 
  }

  async function setStepAsActive(flowID,stepIndex)
  {
    //console.log("Setting " + stepIndex+" as active.")
    step=await db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .where("index", "==", stepIndex)
                .limit(1)
                .get()
    let activestep= null
    step.forEach((doc)=> {
              nextStepData={}
              nextStepData["visible"]=true
              nextStepData["activestep"]=true
              nextStepData["action"]=null              
              db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .doc(doc.id)
                .update(nextStepData)

              activestep=doc

    })

    //console.log(activestep)
    return activestep
                
  }





  async function updateFlowFacade(flowID,flowMeta)
  {
    
     db.collection("Workflows").doc(flowID).update(flowMeta)  
   
    return 0;
  }

  async function setWorkflowAsClosed(flowID)
  {
      flowMeta={}
      flowMeta["ready"]=true
      flowMeta["closed"]=true
      flowMeta["active_step_name"]=null
      flowMeta["active_step_id"]=null
      //console.log(flowMeta)
      db.collection("Workflows")
        .doc(flowID)
        .update(flowMeta)
  }

  

  async function addLogOnApprove(flowID, userName, stepName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Approved"
    log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

   async function addLogOnReject(flowID, userName, stepName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Rejected"
    log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

  async function addLogOnClose(flowID, userName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    // Just add a little delay to ensure the closed happens after everything else. 
    log.timestamp=Date.now()+ 10;
    log.action="Closed"
    //log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

 

 