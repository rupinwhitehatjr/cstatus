import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

# step={}	
# step["index"]=1

# fields=[]
# levelObj={"label":"Curriculum","mandatory":True, "type":"dropdown", "options":["BEG", "INT", "ADV", "PRO", "APT"]}
# versionObject={"label":"Version", "mandatory":True, "type":"dropdown", "options":["V1", "V2"]}
# classObject={"label":"Class","mandatory":True, "type":"text"}
# documentType={"label":"Asset Type","mandatory":True, "type":"dropdown","options":["Class Document", "Summary"]}
# documentURL={"label":"Document URL","mandatory":True, "type":"text"}
# systemURL={"label":"System URL","type":"label"}
# fields.append(levelObj)
# fields.append(versionObject)
# fields.append(classObject)
# fields.append(documentType)
# fields.append(documentURL)
# fields.append(systemURL)
# step["fields"]=fields


#db.collection(u'CurriculumWorkflow').document().set(step)


step={}	
step["index"]=2
step["name"]="ID Review"
fields=[]
levelObj={}
versionObject={}
classObject={}
documentType={}
documentURL={}
systemURL={}
fields.append(levelObj)
fields.append(versionObject)
fields.append(classObject)
fields.append(documentType)
fields.append(documentURL)
fields.append(systemURL)
step["fields"]=fields


db.collection(u'CurriculumWorkflow').document().set(step)
	


# 	#fields=db.collection(u'CurriculumWorkflow').document(stepID).collection(u'Fields')
# 	db.collection(u'Workflows').document().set(data)
# 	#for field in fields.stream():
# 		#print(f'{field.id} => {field.to_dict()}')
	
	
	