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
			query = query.where("phone", '==', parseInt(phoneNumber));  
		}
		
		query = query.orderBy('updatedAt', 'desc')
		
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
	zipcode = doc_data['zipcode']
	address = doc_data['address']
	// <div class="row mr-auto">
	// 			  <h3 class="col-4">${name}</h3>
	// 			  <h5 class="col-4">Email:- ${email}</h5>
	// 			  <h5 class="col-4">Phone:- ${phone}</h5>
	// 			  </div>
	var foldData = `<tr class=fold>
              <td colspan=7>
                <div class=fold-content>
                  <p>Details Of Student</p>
                  <table>
                    <thead>
                      <tr>
					  	<th>Created At</th>
                        <th>Student ID</th>
						<th>Name</th>
						<th>Email</th>
						<th>phone</th>
						<th>School Name</th>						
						<th>City</th>						
						<th>Website url</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
					  <td>${createdAt ? moment(new Date(createdAt * 1000), "DD/MM/YYYY HH:mm").format("DD/MM/YYYY") : 'Not found'}</td>
                        <td>${studentId}</td>
						<td>${name}</td>
						<td>${email}</td>
						<td>${phone}</td>
                        <td>${schoolName}</td>						
						<td>${city}</td>                        
                        <td><a href=https://${websiteurl} target="_blank">Open Website Url</a></td>                        
                      </tr>
                    </tbody>
                  </table>
				  <p>Details Of Courier</p>
                  <table>
                    <thead>
                      <tr>					  	
						<th>Items</th>						
						<th>Courier Name</th>
						<th>Address</th>
						<th>Zip code</th>
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
						<td>${itembundle}</td>
                        <td>${couriername}</td>
						<td>${address}</td>
						<td>${zipcode}</td>
                        <td>${airbill}</td>
                        <td>${printcompletiondate ? (moment(new Date(deliverydate * 1000), "DD/MM/YYYY HH:mm").format("DD/MM/YYYY")): 'Not found'}</td>
						<td>${dataVendorDate ? moment(new Date(dataVendorDate * 1000), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY") : 'Not found'}</td>
                        <td>${printcompletiondate ? moment(new Date(printcompletiondate * 1000), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY") : 'Not found'}</td>
                        <td>${vendordispatchdate ? moment(new Date(vendordispatchdate * 1000), "DD/MM/YYYY  HH:mm").format("DD/MM/YYYY") : 'Not found'}</td>
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
