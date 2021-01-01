$(document).ready(function(){

    


});
fields=[]

fields.push(
            {"label":"Step Name",
             "display":"text",
             "type":"text",
              "key":"name"})

fields.push(
            { "label":"Is Step Active by Default?",
              "display":"dropdown",
              "type":"boolean",
              "key":"activestep",
               "meta":[
                        {"value":"true", "name":"Yes"},
                        {"value":"false", "name":"No"}
                     ]

            })

fields.push(
              {"label":"Step Index",
               "type":"number",
               "display":"text",
                "key":"index"}
            )
fields.push(
            {"label":"Only Review?",
             "type":"boolean",
              "key":"onlyreview",
              "display":"dropdown",
              "meta":[
                        {"value":"true", "name":"Yes"},
                        {"value":"false", "name":"No"}
                     ]
             })

$(document).on("authready", function(event){

   
    status=fetchStepDetail("CurriculumWorkFlow1to2")
   // console.log(status)
    
      

    


    
});
async function fetchStepDetail(workflowType)
{
  
    const steps = await db.collection(workflowType)
                    .orderBy("index")
                    .get()


       

        stepList=[]
        
        steps.forEach((doc)=>{
            stepData=doc.data()   
            stepList.push({"value":stepData.index, "name":stepData.name})

            })
        fields.push({
                    "label":"Previous Step",
                    "type":"number",
                    "display":"dropdown",
                    "key":"previousStep", "meta":stepList})

        /*fields.push({
                    "label":"Next Step",
                    "type":"number",
                    "display":"dropdown",
                    "key":"nextStep", "meta":stepList})*/

        createUI()

        return 0

}


function createUI()
{
   fieldLength=fields.length;
   for (index=0;index<fieldLength;index++)
   {

    labelDiv=$("<div/>").attr("class", "grid_4 fieldlabel").text(fields[index]["label"])
    inputfield=$("<div/>").attr("class", "grid_6 field")
    var field=createField(fields[index], index)
    $(inputfield).append($(field))
    cleardiv=$("<div/>").attr("class", "clear")

    $("#fieldscontainer").append($(labelDiv))
    $("#fieldscontainer").append($(inputfield))
    $("#fieldscontainer").append($(cleardiv))

   }
}

function createField(fieldMeta,index)
{
  field=null;
  //console.log(fieldMeta)
  if(fieldMeta.display=="dropdown")
  {
    field=$("<select/>").attr("id", index)
    dropdownMeta=fieldMeta.meta
    metaLength=dropdownMeta.length
    for(metaIndex=0;metaIndex<metaLength;metaIndex++)
    {
      option=$("<option/>").val(dropdownMeta[metaIndex]["value"])
                            .text(dropdownMeta[metaIndex]["name"])
      $(field).append($(option))
    }
    
    
  }
  if(fieldMeta.display=="text")
  {
    field=$('<input/>')
                .attr("type", "text")
                .attr('class', 'inputbox')
                .attr("id", index)
                
    
  }
  $(field).attr("id",index)
  $(field).attr("data-key",fieldMeta["key"])

return field
}

function addStep()
{
   fieldLength=fields.length;
   dbObject={}
   for (index=0;index<fieldLength;index++)
   {
      fieldType=fields[index]["type"]
      if(fieldType=="boolean")
      {
        value=$("#"+index).val()
        if(value==="true")
        {
          value=true
        }
        else if(value==="false")
        {
          value=false
        }
      }
      else if(fieldType=="number")
      {
        value=parseInt($("#"+index).val())
        
      }
      else
      {
        value=$("#"+index).val()
      }


      key=$("#"+index).attr("data-key")
      
      dbObject[key]=value

   }
   console.log(dbObject)
   db.collection("CurriculumWorkFlow1to2").doc().set(dbObject)
                    

}