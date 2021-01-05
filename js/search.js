$(document).ready(function(){



})

$(document).on("authready", function(event){

    //openWaitingModal();
    
    
    
});

async function executeSearch()
{
	email=$("#email").val().trim()
	phoneNumber=$("#phone").val().trim()

	executeQuery=true
    let query = db.collection("Certificates");
   
    
		
		if(email && email!=="")
		{
		executeQuery=true
		// console.log(fieldLabel)
		// console.log(fieldValue)
		query = query.where("email", '==', email);  
		}

		
		if(phoneNumber && phoneNumber!=="")
		{
			executeQuery=true
		// console.log(fieldLabel)
		// console.log(fieldValue)
			query = query.where("phone", '==', phoneNumber);  
		}
		

		if(executeQuery)
    	{
       
        	results=await query.get()
        	searchResultsCount=results.size
        	//console.log(searchResultsCount)
			$("tr.row-data").remove()
			if(searchResultsCount>0)
			{

			}
			resultsList=[]
			results.forEach((doc)=>{
			//addRow(doc)
			resultsList.push(doc)

			})
			//sortResultsList(resultsList)
			//resultsList.sort( compare );

			for(resultIndex=0;resultIndex<searchResultsCount;resultIndex++)
			{
				addRow(resultsList[resultIndex])
			}
		}
        
}

function addRow(doc)
{
    doc_data=doc.data()
    //console.log(doc_data)
    row=$("<tr/>").attr("class", "row-data");
    //curriculum=doc_data["Curriculum"]
    //version=doc_data["Version"]
    //classnumber=doc_data["Class"]
    name=doc_data["studentname"]
    ctype=doc_data["ctype"]
    cstatus=doc_data["shipmentstatus"]
    
    //time_since_last_update=Date.now()-lastUpdatedDate

    dataKeyList=[] 
                     


    
    $(row).append($("<td/>").append(name))
    $(row).append($("<td/>").append(ctype))
    $(row).append($("<td/>").append(cstatus))

       

   
    $("#resultstable").append($(row))
}

	
