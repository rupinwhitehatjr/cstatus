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
				addRow(resultsList[resultIndex], resultIndex)
			}
		}
        
}

function addRow(doc, id)
{
    doc_data=doc.data()
    // console.log(doc_data)
    row=$("<tr/>").attr("class", "row-data, view");
    //curriculum=doc_data["Curriculum"]
    //version=doc_data["Version"]
    //classnumber=doc_data["Class"]
    name=doc_data["studentname"]
    ctype=doc_data["ctype"]
    cstatus=doc_data["shipmentstatus"]
	airbill = doc_data['awb']
	city = doc_data['city']
	studentId = doc_data['studentid']
	schoolName = doc_data['schoolname']
	remark = doc_data['remark']
	deliverydate = doc_data['deliverydate']
	couriername = doc_data['couriername']
	printcompletiondate = doc_data['printcompletiondate']
	itembundle = doc_data['itembundle']
	phone = doc_data['phone']
	websiteurl = doc_data['websiteurl']
	vendordispatchdate = doc_data['vendordispatchdate']
	dataVendorDate = doc_data['data_vendor_date']
	var foldData = `<tr class=fold>
              <td colspan=7>
                <div class=fold-content>
                  <h3>${name}</h3>
                  <p>Details Of Student</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Student ID</th>
						<th>Items</th>
						<th>City</th>
						<th>School Name</th>
						<th>Website Url</th>
						<th>Courier Name</th>
						<th>Airway bill</th>
						<th>Delivery Date</th>
						<th>Data given to vendor</th>
						<th>Print completion on</th>
						<th>Dispatch by vendor</th>
						<th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${studentId}</td>
						<td>${itembundle}</td>
                        <td>${city}</td>
                        <td>${schoolName}</td>
                        <td>${websiteurl}</td>
                        <td>${couriername}</td>
                        <td>${airbill}</td>
                        <td>${moment(new Date(deliverydate.seconds), "DD/MM/YYYY HH:mm").format("DD/MM/YYYY hh:mm A")}</td>
						<td>${moment(new Date(dataVendorDate.seconds), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY hh:mm A")}</td>
                        <td>${moment(new Date(printcompletiondate.seconds), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY hh:mm A")}</td>
                        <td>${moment(new Date(vendordispatchdate.seconds), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY hh:mm A")}</td>
                        <td>${remark}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>`

    
    //time_since_last_update=Date.now()-lastUpdatedDate

    dataKeyList=[] 
    
    $(row).append($("<td/>").append(name))
    $(row).append($("<td/>").append(ctype))
    $(row).append($("<td/>").append(cstatus))

 
    $("#resultstable").append($(row))
	$("#resultstable").append($(foldData))

	$(function(){
		$(".fold-table tr.view").on("click", function(){
		  $(this).toggleClass("open").next(".fold").toggleClass("open");
		});
	  });
	
}
