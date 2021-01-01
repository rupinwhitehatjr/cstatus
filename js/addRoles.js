$(document).ready(function(){


	

})

$(document).on("authready", function(event){

    //openWaitingModal()

    //displayWorkflow("CurriculumWorkflow");
   
    
});

$(document).on('change', '#process_selector', function() {
    selectedProcess=$(this).val()
     $(".dynamic").remove();
     $(".notifylistdiv").remove()
    if (selectedProcess==="-1")
    {
    	return 0
    }
    //console.log(selectedProcess)
   
    fetchDataForProcess(selectedProcess)


});

processSteps=[]
async function fetchDataForProcess(processName)
{
	$("#stepList").removeClass("standout");
	$("#stepList").empty()
	stepsList= await db.collection(processName).orderBy("index").get()
	processSteps=[]
	stepsList.forEach((doc)=>{
		processSteps.push(doc)
		//console.log(doc.data())
	})
	//console.log(processSteps[0].id)
	numberofsteps=processSteps.length
	firstOption=$("<option/>").attr("value", "-1")
	$("#stepList").empty()
	$("#stepList").append($(firstOption))
	for(stepIndex=0;stepIndex<numberofsteps;stepIndex++)
	{
		
		step=processSteps[stepIndex];
		stepID=step.id
		stepName=step.data().name
		newOption=$("<option/>").attr("value", stepID).text(stepName)
		$("#stepList").append($(newOption))	
			
	}
	$("#stepList").removeAttr("disabled").attr("class", "standout");

	createEmptyNotifyLists(processSteps);

}

$(document).on('change', '#stepList', function() {
    selectedStep=$(this).val()
    if (selectedStep==="-1")
    {
    	return 0
    }

    createGroupKeyChoices(selectedStep);


});


//Create Empty Notify Lists, to be updated when the group key gets generated
function createEmptyNotifyLists(processSteps)
{
	numberofsteps=processSteps.length
	console.log($(".notifylistdiv"))
	$(".notifylistdiv").remove()
	$("#buttonsection").hide();
	for(stepIndex=0;stepIndex<numberofsteps;stepIndex++)
	{
		
		step=processSteps[stepIndex];
		stepID=step.id
		stepName=step.data().name
		divID="users_"+stepID
		stepLabelDiv=$("<div/>").attr("class", "grid_4 notifylistdiv fieldlabel").text(stepName)
		userListDiv=$("<div/>").attr("class", "grid_7 notifylistdiv")
							   .attr("id", divID)
		
		userInput=addNewUserInput()
		
		$(userListDiv).append($(userInput))
		emptyDiv=$("<div/>").attr("class", "clear notifylistdiv")
		$("#stepNotifyList").append(stepLabelDiv)
		$("#stepNotifyList").append(userListDiv)
		//$("#stepNotifyList").append(newUserList)
		$("#stepNotifyList").append(emptyDiv)
		
			
	}
}

groupKeyLabels=[]
function createGroupKeyChoices(selectedStep)
{
	numberofsteps=processSteps.length
	//groupKeysDiv=$("<div/>").attr("class","grid_12").text("No Group Key");
	//$("#p_container").append(groupKeysDiv)
	$(".dynamic").remove();
	groupKeyLabels=[]
	for(stepIndex=0;stepIndex<numberofsteps;stepIndex++)
	{
		
		step=processSteps[stepIndex];
		stepID=step.id
		stepData=step.data()

		//console.log(selectedStep)
		if(stepID!==selectedStep)
		{
			continue;
		}
		
		if(!("fields" in stepData))
		{
			return 0
			
		}

		fieldList=stepData["fields"]
		//console.log(fieldList)
		fieldsCount=fieldList.length
		keySequence=0;
		for(fieldIndex=0;fieldIndex<fieldsCount;fieldIndex++)
		{
			field=fieldList[fieldIndex]

			type=field["type"]

			// Only Dropdown fields can be user group keys
			if(type!="dropdown" ) 
			{
				continue
			}
			//Possible that the field doesnt have the attribute
			//Move on to the next field
			if(!("userGroupKey" in field))
			{
				continue;
			}
			
			userGroupKey=field["userGroupKey"]
			if(userGroupKey)
			{
				/* it means that this specific field determines
				the selection of a usergroup
				*/
				//$(groupKeysDiv).remove()
				/*label=fieldList["label"]
				fieldValues=field["options"]
				labelDiv=$("<div/>")
				selectElement=createDropdownElement(fieldValues, keySequence)
				*/
				//console.log(field["label"])
				createFieldRow(field,keySequence)
				groupKeyLabels.push(field.label)
				keySequence++
				

			}
			
		}
		

		
		
			
	}
	//console.log(groupKeyLabels)
}

function createFieldRow(fieldMeta, sequence)
{
		labelDiv=$('<div/>').attr("class", "grid_4 fieldlabel dynamic").text(fieldMeta["label"])
		fieldDiv=$('<div/>').attr("class", "grid_6 field dynamic")		
		emptyDiv=$('<div/>').attr("class", "clear dynamic")

        options=fieldMeta["options"];
       
        mandatory=fieldMeta["mandatory"];
        dd=$("<select/>")                
                .attr("id", sequence)
                .attr("name", sequence)
                .attr("class", "groupKey")
        if(mandatory)
        {
            $(dd).attr("required", true)
        }        
        //$(dd).append($("<option/>"))
        for(index=0;index<options.length;index++)
        {
            option=$("<option/>").val(options[index]).text(options[index])
            
            $(dd).append($(option))
        }
        $("#groupKeyFields").append($(labelDiv))
        $("#groupKeyFields").append($(fieldDiv).append($(dd)))
        $("#groupKeyFields").append($(emptyDiv))
}



selectedUserGroupKey=null;
userGroupKeyMeta=[]
$(document).on('change', 'select.groupKey', function() {
    
    groupKeyFields=$("select.groupKey")
    groupKeyFieldCount=groupKeyFields.length
    keyList=[]
    userGroupKeyMeta=[]
    
    for(index=0;index<groupKeyFieldCount;index++)
    {
    	//console.log($("select#"+index).val())

    	groupKeyValue=$("select#"+index).val()
    	groupKeyObject={}
    	label=groupKeyLabels[index]
    	groupKeyObject["label"]=label
    	
    	groupKeyObject["value"]=groupKeyValue
    	keyList.push(groupKeyValue)
    	userGroupKeyMeta.push(groupKeyObject)
    }
   // userGroupKeyMeta
    groupKey=keyList.join("-")
    selectedUserGroupKey=groupKey
    $("#keyname").text("Grouping: "+selectedUserGroupKey).show()
    //console.log(userGroupKeyMeta)
    $(".userdiv").remove()
    displayNotifyList(userGroupKeyMeta)



});

userGroupDocumentID=null;

async function displayNotifyList(userGroupKeyMeta)
{
	userGroupDocumentID=null;
	$("#buttonsection").show()
	/*notifyData= await db.collection("UserGroups")
						.where("groupKey", "==", groupKey)
						.limit(1)
						.get()*/

	
	//console.log(notifyList)
	var executeQuery=false
	let query = db.collection("UserGroups")
   	searchTermsLength=userGroupKeyMeta.length
   	//console.log(userGroupKeyMeta)
    for(index=0;index<searchTermsLength;index++)
    {
    	searchObject=userGroupKeyMeta[index]
        key=searchObject["label"]
       	value=searchObject["value"]
       	//console.log(key)
       	//console.log(value)
        query = query.where(key, '==', value); 
        executeQuery=true 
        
        
    }

      notifyList=[]
	
      if(executeQuery)
      {
      	results=await query.get()
        searchResultsCount=results.size
        //console.log(searchResultsCount)
        results.forEach((doc)=>{
        	notifyList.push(doc)
        	//console.log(doc.data())
        })
        
      }
        
        

    
    


	//$(".userdiv").remove();
	notifyListLength=notifyList.length;
	if(notifyListLength===1)
	{
		userGroupDocumentID=notifyList[0].id
	}
	
	//alert(userGroupDocumentID)
	for(index=0;index<notifyListLength;index++)
	{
		groupData=notifyList[index].data()
		groupList=groupData["groupList"]
		for(listIndex=0;listIndex<groupList.length;listIndex++)
		{

			stepID=groupList[listIndex]["stepID"]
			users=groupList[listIndex]["users"]
			userCount=users.length
			divID="users_"+stepID
			$("#"+divID).find("span.userdiv").remove()
			$("#"+divID).find("input").remove()
			//$()
			for(userIndex=0;userIndex<userCount;userIndex++)
			{

				userdiv=createUserDiv(users[userIndex])			
				$("#"+divID).append($(userdiv))
				
							
			}
			newInput=addNewUserInput();

			$("#"+divID).append($(newInput))
			
			
		}
		//console.log(notifyList[index].data())
	}
	//console.log(notifyList[0].data())
}

function createUserDiv(userEmail)
{
			userdiv=$("<span/>")
					.text(userEmail)
					.attr("class", "userdiv")
			crossImage=$("<img/>").attr("src", "img/cross.png")
								  .attr("class", "deleteimg")
			deleteIcondiv=$("<span/>").append($(crossImage))
								  .attr("class", "deletebutton")
							  
			$(userdiv).append($(deleteIcondiv))
			return userdiv
}

function addNewUserInput()
{
	userInput=$("<input/>").attr("placeholder", "Add New User")	
									.attr("class", "newuserinput")
	return userInput; 
}

$(document).on("click", ".deletebutton", function(){

	$(this).parent().remove()
})

$(document).on("keyup", ".newuserinput", function(event){

	if(event.keyCode===13)//enter pressed
	{
		userDiv=createUserDiv($(this).val());
		$(userDiv).insertBefore($(this));
		$(this).val("");
	}
})

function saveRoles()
{
	numberofsteps=processSteps.length
	
	//$(".notifylistdiv").remove()
	//$("#buttonsection").hide();
	$("#savingmodal").modal({
          escapeClose: false,
          clickClose: false,
          showClose: false
     });
	stepGroupList=[]
	for(stepIndex=0;stepIndex<numberofsteps;stepIndex++)
	{
		
		step=processSteps[stepIndex];
		stepID=step.id
		stepName=step.data().name
		divID="users_"+stepID
		
		userdivs=$("#"+divID).find('span.userdiv')
		divCount=userdivs.length;
		userEmails=[];
		for(userIndex=0;userIndex<divCount;userIndex++)
		{
			userEmail=$(userdivs[userIndex]).text().trim()
			
			//console.log(userEmail)
			userEmails.push(userEmail)
		}

		
		stepGroupObject={}
		stepGroupObject["stepID"]=stepID

		let uniqueUsers = [...new Set(userEmails)];
		stepGroupObject["users"]=uniqueUsers
		stepGroupList.push(stepGroupObject)



			
	}
		userGroupObject={}
		userGroupObject["groupKey"]=selectedUserGroupKey;
		groupKeyMetaLength=userGroupKeyMeta.length
		for(index=0;index<groupKeyMetaLength;index++)
		{
			key=userGroupKeyMeta[index]["label"]
			value=userGroupKeyMeta[index]["value"]
			userGroupObject[key]=value
		}
		userGroupObject["keyList"]=userGroupKeyMeta
		userGroupObject["groupList"]=stepGroupList;
		userGroupDocumentID=updateUserGroup(userGroupDocumentID,userGroupObject)
		
}

function updateUserGroup(documentID, userGroupData)
{
	if(!documentID)
	{
		documentRef = db.collection("UserGroups").doc()
		documentID=documentRef.id
		
	}
	//console.log(userGroupData)
	db.collection("UserGroups").doc(documentID).set(userGroupData)
	//setInterval(, 3000);
	setTimeout(closeAllModals, 3000)


	//closeAllModals()
	return documentID
}

