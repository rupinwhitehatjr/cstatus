const functions = require('firebase-functions');
const admin = require('firebase-admin');


const sgMail = require('@sendgrid/mail')
/* admin is initialised in index.js*/
let db = admin.firestore();
let storageObj=admin.storage()
const path = require('path');
const os = require('os');
const fs = require('fs');

//console.log(functions.config())
apikey=functions.config().sendgrid.apikey

  


sgMail.setApiKey(apikey)

class NoRecipientsError extends Error {
  constructor(message) {
    super(message); 
    this.name = 'NoRecipientsError';
  }
}


exports.sendNotification = functions
  .region('asia-east2')
  .firestore
  .document('NotificationQueue/{notificationid}')
  .onWrite((change, context) =>
  { 



  notificationData=change.after.data();
  //htmlbody=getHTMLBody(notificationData)  
  
 

  retries=notificationData["retries"]
  flowID=notificationData.flowID 
  if(retries===0)
  {
    console.log("Ok "+flowID+ ", I give up!!!")
    return 0
  }
    
  //msgObject={}
  notificationid=context.params.notificationid
  targetStepIndex=notificationData.targetStepIndex
  recipients=[]

  if("notify" in notificationData)
  {

    recipients=notificationData["notify"]
  }
  //flowID=notificationData.flowID 

  var errorFlag=false;
  if(recipients.length===0)
  {
    /* fetch the recipients list from the step */
    recipientsPromise=getRecipientsList(flowID,targetStepIndex)
    recipientsPromise.then((querySnapshot)=>{

        //console.log(msgObject)
        if(querySnapshot!==0)
        {
          userList=querySnapshot.users
          if(userList.length===0)
          {
            errorFlag=true;
            updateRetries(retries, notificationid)
            return 0
            //throw new NoRecipientsError("There are no recipients")
          }
          else
          {
            notificationData.notify=userList
            sendEmail(notificationData)
          }
          
        }
        return 0

    }).catch((error)=>{
      errorFlag=true;      
      console.error(error.message)
      //throw error
    })


  }
  else
  {
    
    sendEmail(notificationData)
  }
  
  return 0
  
  
  });

function updateRetries(retries, id)
{
  meta={}
  if(retries===0)
  {
    return 0
  }

  meta["retries"]=retries-1
  db.collection("NotificationQueue").doc(id).update(meta)
  return 0
}

async function getRecipientsList(flowID, stepIndex)
{

  stepData=await db.collection("Workflows")
             .doc(flowID)
             .collection("steps")
             .where("index", "==", stepIndex)
             .limit(1)
             .get()
  //console.log("Here 1") 
  documentData=0         
  stepData.forEach((doc)=>{
      //console.log(doc.data())
      //console.log("Here 2")  
      documentData=doc.data()
  })
  //console.log("Here 3")  
  return documentData

}

function sendEmail(notificationData)
{
  msgObject={}
  msgObject.from="rupin@whitehatjr.com"
  actionerName=notificationData.actioner.name
  action = notificationData.action
  stepName = notificationData.stepName
  emailSubjectPart=""
  if("searchTerms" in notificationData )
  {
    searchTermList=notificationData["searchTerms"]
    noOfTerms=searchTermList.length;
    if(noOfTerms>0)
    {
      subjectTerms=[]
      for(sTermIndex=0;sTermIndex<searchTermList.length;sTermIndex++)
      {
        subjectTerms.push(searchTermList[sTermIndex]["value"])
      }
      emailSubjectPart=subjectTerms.join("-")
      emailSubjectPart="["+emailSubjectPart+"]"
    }

  }
  
  subject=actionerName +" " +action+" the workflow";
  subject=subject+" "+emailSubjectPart
  msgObject.subject=subject
  flowID=notificationData.flowID 
  commentText=notificationData.comment 
  /*The first user in the list will be in the
  to list of the email
  */
  msgObject.to=notificationData.notify.shift()
  /* After shifting, are there any more users?

  They all will be in the CC list */
  if(notificationData.notify.length>0)
  {
    msgObject.cc=notificationData.notify
  }

  //console.log(msgObject)
  //return 0

  htmlBody=getHTMLBody(notificationData)
 
  htmlBody.then((htmltemplate)=>{
    htmltemplate=htmltemplate.replace("@actioner", actionerName)
    htmltemplate=htmltemplate.replace("@action", action)
    htmltemplate=htmltemplate.replace("@flowid", flowID)
    htmltemplate=htmltemplate.replace("@stepname", stepName)
    
    if(commentText.length>0)
    {
      htmltemplate=htmltemplate.replace(/@commentdisplayflag/g, "")
      htmltemplate=htmltemplate.replace("@comment", commentText)
    }
    else
    {
      htmltemplate=htmltemplate.replace(/@commentdisplayflag/g, "display:none")
    }
    msgObject.html=htmltemplate
    //console.log(htmltemplate)
    //console.log(msgObject)
    sgMail.send(msgObject).then(() => {
      console.log('Email sent')
      return 0
  }).catch((error) => {
    console.error(error)
    //throw error
  })

  return 0


  }).catch((error) => {
    console.error(error)
    //throw error
  })
  




  
  
}

async function getHTMLBody(notificationData)
{
  

    const bucket = storageObj.bucket();
    let fileName="email.html"
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const filePath="email-templates/email.html"
    await bucket.file(filePath).download({destination: tempFilePath});
    var data="";
    try {
      data = fs.readFileSync(tempFilePath, 'utf8');
      //console.log("data:"+data);    
    } 
    catch(e) 
    {
        //console.log("Error")
        console.error('Error:', e.stack);
    }

    return data

      


}

