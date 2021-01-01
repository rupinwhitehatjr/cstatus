const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.onReject = functions
  .region('asia-east2')
  .firestore
  .document('Cache/{cacheID}')
  .onCreate((snapshot, context) => 

  { 
    userData=snapshot.data()
    action=userData["action"]
    if(action!=="rejected")
    {
      return 0
    }
    //console.log("Flow is Rejected")

    flowID=userData["flowID"]
    stepID=userData["stepID"]
    user_name=userData["by"]["name"]
  	stepInfoPromise=getStepInfo(flowID,stepID)
    stepStructure=null
    stepInfoPromise.then((snapshot)=>{

      //console.log(snapshot.data())
      stepStructure=snapshot.data()
      stepName=stepStructure["name"]
      previousStepIndex=stepStructure["previousStep"]      
      //console.log(previousStepIndex)
      if(previousStepIndex!==null)
      {
        addLogOnReject(flowID,user_name,stepName)
        setStepAsActive(flowID,previousStepIndex)
        updateCurrentstep(flowID,stepID,userData)
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

  async function getFlowInfo(flowID)
  {
    flowInfo=db.collection("Workflows").doc(flowID).get()
    return flowInfo
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

  