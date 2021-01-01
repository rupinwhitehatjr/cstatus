const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.onApprove = functions
  .region('asia-east2')
  .firestore
  .document('Cache/{cacheID}')
  .onCreate((snapshot, context) => 

  { 
    userData=snapshot.data()
    action=userData["action"]
    if(action!=="approved")
    {
      return 0
    }

    flowID=userData["flowID"]
    stepID=userData["stepID"]
    user_name=userData["by"]["name"]
    fieldValues=userData["fieldValues"]

  	stepInfoPromise=getStepInfo(flowID,stepID)
    stepStructure=null
    stepInfoPromise.then((snapshot)=>{

      //console.log(snapshot.data())
      stepStructure=snapshot.data()

      stepName=stepStructure["name"]
      nextStepIndex=stepStructure["nextStep"]
      addLogOnApprove(flowID,user_name,stepName)
      updateCurrentstep(flowID,stepID,userData)
      // If there is no next step, the workflow is closed
      if(nextStepIndex===null)
      {
        console.log("Flow is completed")
        //mark the flow as completed
        addLogOnClose(flowID,user_name,stepName)
        setWorkflowAsClosed(flowID)
        return 0
              
      }
      else
      {

       let activeStepPromise=setStepAsActive(flowID,nextStepIndex)

      }



      return 0

    }).catch((error)=>{console.error(error.message)})

    
    stepInfoPromise.finally(()=>{

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

  async function addLogOnApprove(flowID, userName, stepName)
  {
    
    
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Approved"
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
              //nextStepData["action"]=null              
              db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .doc(doc.id)
                .update(nextStepData)
                
              // Once the Active Step has been set, we can update the flow Facade 
              flowMeta={}
              activeStepData=doc.data()
              flowMeta["active_step_name"]=activeStepData.name
              flowMeta["active_step_id"]=doc.id
                if("users" in activeStepData)
                {
                  flowMeta["step_owners"]=activeStepData.users
                }
                else
                {
                  flowMeta["step_owners"]=[]
                }  
              
              db.collection("Workflows").doc(flowID).update(flowMeta)

                

              activestep=doc

    })

    
    return activestep
                
  }

  async function updateCurrentstep(flowID, stepID, newValue)
  {
      updatedData={}
      updatedData["activestep"]=false
      updatedData["action"]=null
      if("fieldValues" in newValue)
      {
        updatedData["fieldValues"]=newValue.fieldValues
      }
      
      actionerEmail=newValue.by.email
      updatedData["users"]=admin.firestore
                                .FieldValue
                                .arrayUnion(actionerEmail)
      /*updatedData["by"]=null*/
      

      stepUpdate=await db.collection("Workflows")
              .doc(flowID)
              .collection("steps")
              .doc(stepID)
              .update(updatedData)

      return stepUpdate 
  }



  /*The activesteppromise variable holds the
        data for the active step.
        Use the same data to update the flow meta/facade 
        In addition to that, also send email notifications of the
        step coming into the queue of owner of the next step.
        
        */

        /*targetStepData=null;
        targetStepData=activeStepPromise.then((querySnapshot)=> {
              //console.log(querySnapshot.data())
              targetStepData=querySnapshot.data()
              targetStepID=querySnapshot.id
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=targetStepData.name
              flowMeta["active_step_id"]=querySnapshot.id
              flowMeta["closed"]=false
              
              updateFlowFacade(flowID, flowMeta)              
             
              return targetStepData
            
        }).catch((error)=> { console.error(error.message) });*/