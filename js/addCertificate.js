$(document).ready(function(){

		$("#studentdetailform").validate({errorElement : 'span', errorClass: "formerror"});

})




$(document).on("authready", function(event){

    //openWaitingModal();
    
    
    
});

function saveStudentDetail()
{
	primaryForm=$("#studentdetailform")

	if($(primaryForm).length>0)
	{
		validationResult=$(primaryForm).valid();
		if(!validationResult)
		{
			//return 0
		}
	}
	else
	{
		return 0
	}

	dataJson={}
	$('#studentdetailform').find(':input').each(function(){
  
  		key=$(this).attr("data-key")
  		value=$(this).val().trim()
  		dataJson[key]=value;

	})

	//console.log(dataJson)

	doc_ref = db.collection("Certificates").doc()

	$("#saveModal").modal({
                escapeClose: false,
                clickClose: false,
                showClose: false
            });




    user=firebase.auth().currentUser;
	newCertificateID=db.collection("Certificates").doc(doc_ref.id).set(dataJson)
	newCertificateID.then(snapshot=>{           
           
           closeAllModals();
           location.reload();

        })

}