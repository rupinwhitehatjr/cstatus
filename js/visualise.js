



function openWaitingModal()
{
    $("#loading").modal({
        escapeClose: false,
        clickClose: false,
        showClose: false
    });
}

$(document).on("authready", function(event){

    //openWaitingModal()

    displayWorkflow("CurriculumWorkFlow1to2");
   
    
});


async function displayWorkflow(workflowType)
{
    const steps = await db.collection(workflowType)
                    .orderBy("index")
                    .get()


    
        /*steps.forEach((doc)=>{
            stepData=doc.data()        
            //console.log(stepData.name)
            stepNamediv=$("<div/>").attr("class","vis_header")
                                 .text(stepData.name); 
            stepIDdiv=$("<div/>").attr("class","vis_stepid")
                                 .text(doc.id);   
            stepIndexdiv=$("<div/>").attr("class","vis_stepindex")
                                 .text(stepData.index);     

            stepdiv=$("<div/>").attr("class", "grid_2 vis_step")
                                .attr("id", stepData.index)

                                
            $(stepdiv).append($(stepNamediv))
            //$(stepdiv).append($(stepIDdiv))
            $(stepdiv).append($(stepIndexdiv))                    

            $(".workflowholder").append($(stepdiv))     

        })*/
        var nodes=[]
        var edges=[]
        startx=5;
        steps.forEach((doc)=>{
            stepData=doc.data() 
            startx=startx+250  
            nodeObject={}
            nodeObject["id"]=stepData.index
            nodeObject["label"]=stepData.name
            nodeObject["x"]=startx
            nodeObject["y"]=500 + Math.floor(Math.random() * 50);
            nodeObject["fixed"]=true
            nodes.push(nodeObject)            
            
            sourceId=stepData.index
            arrowMeta={}
            arrowMeta["to"]={"enabled": true,"type":"triangle"}
            nodeMeta={}
            nodeMeta["enabled"]=true
            nodeMeta["color"]="rgba(255,0,0,1)"
            nodeMeta["size"]=3
            
           
            destination=stepData.nextStep            
            if(destination!=null)
            {
               edgeObject={}
               edgeObject["from"]=stepData.index
               edgeObject["to"]=destination

               edgeObject["arrows"]=arrowMeta
               //console.log(edgeObject)
               edges.push(edgeObject)
            } 

           

            destination=stepData.previousStep            
            if(destination!=null)
            {
               edgeObject={}
               edgeObject["from"]=stepData.index
               edgeObject["to"]=destination
               
               edgeObject["arrows"]=arrowMeta
               edgeObject["color"]={"color":"red"}
               console.log(edgeObject)
               edges.push(edgeObject)
            } 

            
              

        })
        console.log(nodes)
        console.log(edges)
        createVisualisation(nodes,edges)


}

function createVisualisation(nodes,edges)
{
    /*var nodes = new vis.DataSet([
        { id: 1, label: "Creation" },
        { id: 2, label: "ID Review" },
        { id: 3, label: "Node 3" },
        { id: 4, label: "Node 4" },
        { id: 5, label: "Node 5" },
      ]);

      // create an array with edges
      var edges = new vis.DataSet([
        { from: 1, to: 3 },
        { from: 1, to: 2 },
        { from: 2, to: 1 },
        { from: 2, to: 5 },
        { from: 3, to: 3 },
      ]);*/

      // create a network
      var container = document.getElementById("mynetwork");
      var data = {
        nodes: nodes,
        edges: edges,
      };
      var options = {
        nodes: {
          shape: "box",
        },
      };
      var network = new vis.Network(container, data, options);
}