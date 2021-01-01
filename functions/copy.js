const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.copyLayout = functions
  .region('asia-east2')
  .firestore
  .document('Workflows/{flowID}')
  .onCreate((snapshot, context) => 

  { 
  	flowID=context.params.flowID
  	userName=snapshot.data().name
  	flowType=snapshot.data().flowType
    email=snapshot.data().email
  	
  	var copydone=makeCopy(flowType,flowID,email)
  	var logdone=addLogOnCreate(flowID,userName)
    // Only update the Flow Facade when the copy is done
    copydone.then((returnVal)=> {
          //console.log(querySnapshot.data().index)
              querySnapshot=returnVal["activestep"]
              allSteps=returnVal["allSteps"]
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=querySnapshot.data().name
              flowMeta["active_step_id"]=querySnapshot.id
              flowMeta["closed"]=false
              flowMeta["allSteps"]=allSteps
              step_owners=[]
              step_owners.push(email)

              flowMeta["step_owners"]=step_owners
              //console.log(flowMeta)
              setFlowAsActive(flowID, flowMeta)
           
              return 0
            
        }).catch((error) => {

          //pconsole.error("An Error cccured while setting Flow as Active")
          console.error(error.message);
        })
  	
  	return 0
  	
  });

  async function addLogOnCreate(flowID, userName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Created"
    //console.log(log)
    flowDocument.collection("log").doc().set(log)

    
    
  }


  async function makeCopy(workflowType, flowID, creatorEmail)
  {
    //console.log(flowType)
    const steps = await db.collection(workflowType).orderBy("index").get()
    flowDocument=db.collection("Workflows").doc(flowID)
    

    //console.log(createdBy)
    flowSteps=[]
    //stepArray=[]
    let activestep=null
    steps.forEach( (doc)=> {
        //console.log("copying")
        stepData=doc.data()
        
        
        //stepArray.push(doc)
        if(doc.data().activestep)
        {
          usersObject=userListObject=admin
                                  .firestore
                                  .FieldValue
                                  .arrayUnion(creatorEmail)
          stepData["users"]=usersObject
          activestep=doc
        }


        flowDocument.collection("steps").doc(doc.id).set(stepData)
        
        

        flowDetail={}
        flowDetail['name']=doc.data().name
        flowDetail['id']=doc.id
        flowSteps.push(flowDetail)

    })
    //await Promise.all(stepArray.map((data) => flowDocument.collection("steps").add(data)));

    //flowDocument.update({'allSteps':flowSteps})
    returnVal={}
    returnVal["activestep"]=activestep
    returnVal["allSteps"]=flowSteps


    return returnVal
  }

  async function setFlowAsActive(flowID,flowMeta)
  {
    
     db.collection("Workflows").doc(flowID).update(flowMeta)  
     return 0;
  }

