$(document).ready(function(){



})

$(document).on("authready", function(event){

    //openWaitingModal();
    
    
    
});

async function executeSearch()
{
	email=$("#email").val().trim()
	phoneNumber=$("#phone").val().trim()

	executeQuery=false
    let query = db.collection("NewCertificate");
   
    
		
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
			$("#resultstable").children().remove()
			
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

			if(searchResultsCount > 0) {
				for(resultIndex=0;resultIndex<searchResultsCount;resultIndex++)
				addRow(resultsList[resultIndex], resultIndex)			
			}
			else {
				swal({
					title: 'Search',
					text: 'No Data Found',
					logo: 'info'
				})
			}
		}

		else {
			swal({
				title: 'Field Required',
				text: 'Email Or Mobile required',
				icon: 'error'
			})
		}
        
}

function addRow(doc, id)
{
    doc_data=doc.data()
    // console.log(doc_data)
    row=$("<tr/>").attr("class", "view");
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
	email = doc_data['email']
	mobile = doc_data['phone']
	createdAt = doc_data['crdate']
	console.log(createdAt)
	console.log(moment(new Date(createdAt * 1000), "DD/MM/YYYY HH:mm").format("DD/MM/YYYY hh:mm A"))
	var foldData = `<tr class=fold>
              <td colspan=7>
                <div class=fold-content>
                  <div class="row mr-auto">
				  <h3 class="col-4">${name}</h3>
				  <h5 class="col-4">Email:- ${email}</h5>
				  <h5 class="col-4">Phone:- ${phone}</h5>
				  </div>
                  <p>Details Of Student</p>
                  <table>
                    <thead>
                      <tr>
					  	<th>Created At</th>
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
					  <td>${createdAt ? moment(new Date(createdAt * 1000), "DD/MM/YYYY HH:mm").format("DD/MM/YYYY hh:mm A") : 'Not found'}</td>
                        <td>${studentId}</td>
						<td>${itembundle}</td>
                        <td>${city}</td>
                        <td>${schoolName}</td>
                        <td>${websiteurl}</td>
                        <td>${couriername}</td>
                        <td>${airbill}</td>
                        <td>${printcompletiondate ? (moment(new Date(deliverydate * 1000), "DD/MM/YYYY HH:mm").format("DD/MM/YYYY hh:mm A")): 'Not found'}</td>
						<td>${dataVendorDate ? moment(new Date(dataVendorDate * 1000), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY hh:mm A") : 'Not found'}</td>
                        <td>${printcompletiondate ? moment(new Date(printcompletiondate * 1000), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY hh:mm A") : 'Not found'}</td>
                        <td>${vendordispatchdate ? moment(new Date(vendordispatchdate * 1000), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY hh:mm A") : 'Not found'}</td>
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
	var i = 0
	$(function(){
		$(".fold-table tr.view").on("click", function(){
		  if(i % 2 === 0) {
			$(this).addClass("open").next(".fold").addClass("open");
		  }
		  else {
			  $(this).removeClass("open").next(".fold").removeClass("open");
		  }
		  i += 1
		});
	  });	
}
