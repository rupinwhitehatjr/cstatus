









function updateRank(rank)
{
	questionNumber=$("#questionnumber").val()
	day=$("#day").val()
	level=$("#level").val()

	//key=level +"/"+parseInt(day)+"/"+parseInt(questionNumber) +"/"+rank
	key=level +"/"+parseInt(questionNumber) +"/"+rank
	//firebase.database().ref(key).set({count:1});
	
	var starCountRef = firebase.database().ref(key);

	starCountRef.once('value').then(function(snapshot) {

	  existingValue=snapshot.val()
	  if(existingValue==null)
	  {
	  	newValue=1
	  }
	  else
	  {
	  	newValue=snapshot.val()+1
	  }
	  firebase.database().ref(key).set(newValue);


	})
	  
	 

	
}

levels=["BEG-V1", "INT-V1","BEG-V2", "INT-V2", "PRO-V1", "PRO-V2", "ADV-V1"]
classNumbers=[144, 144, 40, 40, 144, 24, 144]
bareData={}
bareData.updatedOnce=false
bareData.created=false
bareData.questionText=""
bareData.questionImage=""
bareData.option1=""
bareData.option2=""
bareData.option3=""
bareData.option4=""
bareData.explaination=""
bareData.activityLink=""
bareData.solutionLink=""
bareData.type=""
maxQuestions=5;

function preFillData()
{

	
	levelsLength=levels.length
	for (var levelsIndex=0;levelsIndex<levelsLength;levelsIndex++)
	{
		levelName=levels[levelsIndex]
		maxClass=classNumbers[levelsIndex]
		for (var classNumber=1;classNumber<=2;classNumber++)
		{
			for (var questionIndex=1; questionIndex<=maxQuestions;questionIndex++)
			{
				key=levelName +"/"+classNumber +"/"+ questionIndex
				firebase.database().ref(key).set(bareData);
			}
		}
	}

	
}
