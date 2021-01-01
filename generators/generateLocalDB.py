import firebase_admin
import mock
from firebase_admin import credentials
from firebase_admin import firestore
import os
from google.cloud import firestore
import google.auth.credentials

# Use a service account
#cred = credentials.Certificate('config.json')
#firebase_admin.initialize_app(cred)

os.environ["FIRESTORE_DATASET"] = "test"
os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8081"
os.environ["FIRESTORE_EMULATOR_HOST_PATH"] = "localhost:8081/firestore"
os.environ["FIRESTORE_HOST"] = "http://localhost:8081"
os.environ["FIRESTORE_PROJECT_ID"] = "test"

credentials = mock.Mock(spec=google.auth.credentials.Credentials)
db = firestore.Client(project="test", credentials=credentials)



#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

step={}	
step["index"]=10
step["isFirst"]=True
step["activestep"]=True
step["visible"]=True
step["nextStep"]=20
step["previousStep"]=None
fields=[]
levelObj={"label":"Curriculum","mandatory":True,"isSearchTerm":True, "userGroupKey":True,"type":"dropdown", "options":["BEG", "INT", "ADV", "PRO", "APT"]}
versionObject={"label":"Version", "mandatory":True, "isSearchTerm":True,"type":"dropdown", "options":["V1", "V2"]}
classObject={"label":"Class","mandatory":True,"isSearchTerm":True, "type":"range", "min":0, "max":300}
documentType={"label":"Asset Type","mandatory":True, "type":"dropdown","options":["Class Document", "Summary"]}
documentURL={"label":"Document URL","mandatory":True, "type":"text"}
fields.append(levelObj)
fields.append(versionObject)
fields.append(classObject)
fields.append(documentType)
fields.append(documentURL)

step["fields"]=fields
step["name"]="Development and Creation"

doc_ref = db.collection(u'CurriculumWorkflow').document()
newid =doc_ref.id
db.collection(u'CurriculumWorkflow').document(newid).set(step)
step1ID=newid

step={}	
step["index"]=20
step["name"]="ID Review"
step["nextStep"]=None
step["previousStep"]=10
step["activestep"]=False
step["visible"]=False
# fields=[]
# levelObj={}
# versionObject={}
# classObject={}
# documentType={}
# documentURL={}
# systemURL={}
# fields.append(levelObj)
# fields.append(versionObject)
# fields.append(classObject)
# fields.append(documentType)
# fields.append(documentURL)
# fields.append(systemURL)
# step["fields"]=fields

doc_ref = db.collection(u'CurriculumWorkflow').document()
newid =doc_ref.id
db.collection(u'CurriculumWorkflow').document(newid).set(step)
step2ID=newid

GroupData={}


GroupData["groupKey"]="BEG"
groupList=[]


group2={}
group2["stepID"]=step2ID
group2["users"]=["#creator",'anjali@whitehatjr.com']

group1={}
group1["stepID"]=step1ID
group1["users"]=["#creator"]
						 

groupList.append(group1)
groupList.append(group2)
GroupData["groupList"]=groupList


#userGroupData
#doc_ref = db.collection(u'UserGroups').document()
#newid = doc_ref.id
db.collection(u"UserGroups").document().set(GroupData)


# 	#fields=db.collection(u'CurriculumWorkflow').document(stepID).collection(u'Fields')
# 	db.collection(u'Workflows').document().set(data)
# 	#for field in fields.stream():
# 		#print(f'{field.id} => {field.to_dict()}')
	
	
	