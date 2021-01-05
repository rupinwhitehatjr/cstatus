$(document).ready(function(){



})

$(document).on("authready", function(event){

    //openWaitingModal();
    
    
    
});

const ref = firebase.storage().ref();


function uploadxl()
{
	batchSize=200
	const file = $("#xlfile").prop('files')[0]
	const rowCount = $("#rowcount").val()

	filecopies=Math.ceil(parseInt(rowCount)/batchSize)
	//console.log(filecopies)

	
	for(filecount=0;filecount<filecopies;filecount++)
	{

		const name = Date.now()+"_"+filecount+"_"+file.name;
		const metadata = {
			contentType: file.type,
			customMetadata: {
    			'index': filecount
  			}

		};
		const task = ref.child(name).put(file, metadata);
		task.then(snapshot => snapshot.ref.getDownloadURL()).then((url) => {
		
			console.log(url);
		
		})
		.catch(console.error);

	}
	


}

	
