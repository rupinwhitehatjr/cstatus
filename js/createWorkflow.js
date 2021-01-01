$(document).ready(function(){
// Initialize Cloud Firestore through Firebase


/*db.collection("CurriculumWorkflow").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
});*/
    


});

$(document).on("authready", function(event){

   $("#createWorkflowButtonsContainer").show()
   $("#createWorkflowButtonsContainer").show()
    
    
});



function buttonAction(flow_type)
{
       
      // 

}

function createNewWorkFlow(flow_type)
{
	
    	doc_ref = db.collection("Workflows").doc()
        user=firebase.auth().currentUser
        //console.log(user.uid)
        creationData={}
        creationData["flowType"]=flow_type
        creationData["email"]=user.email
        creationData["name"]=user.displayName
        creationData["photoURL"]=user.photoURL;
        creationData["ready"]=false
        creationData["created_on"]=Date.now()
        creationData["updated_on"]=Date.now()
        
        newFlowID=db.collection("Workflows").doc(doc_ref.id).set(creationData)
        console.log(doc_ref.id)
        newFlowID.then(snapshot=>{           
           

        })

            $("#sticky").modal({
                escapeClose: false,
                clickClose: false,
                showClose: false
            });

        
        unsubscribe=db.collection("Workflows").doc(doc_ref.id)
    .onSnapshot(function(doc) {
        var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        console.log(doc.metadata.hasPendingWrites)
        if(!doc.metadata.hasPendingWrites)
        {
            if(doc.data().ready)

                {
                    
                    unsubscribe()
                    //console.log("we are ready");
                    //console.log(doc_ref.id)
                    URL="viewFlow.html?id="+doc_ref.id
                    window.location.replace(URL);
                    
                }
        }
});
        //return doc_ref.id
	
	

    
    
}