const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();

 exports.copyRoleForActiveStep = functions
  .region('asia-east2')
  .firestore
  .document('Workflows/{flowID}/steps/{stepId}')
  .onUpdate((change, context) => {

    const updatedValue = change.after.data();
    
    activestep=updatedValue["activestep"]
    if(!activestep)
    {
      return 0
    }
    if(!("rolesSet" in updatedValue))
    {
      return 0
    }

     roleSet=updatedValue["rolesSet"]
     if(!roleSet)
     {
        return 0
     }

     users=[]
     if("users" in updatedValue)
     {
      /* we should not only keep the first user here, because search will break
      */
        users=updatedValue["users"]
     }

    flowID=context.params.flowID
    stepId=context.params.stepId
    
    flowMeta={}
    flowMeta["ready"]=true
    flowMeta["step_owners"]=users
    db.collection("Workflows").doc(flowID).update(flowMeta)     
    return 0
    
  });


 

 