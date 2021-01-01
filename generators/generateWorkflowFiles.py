import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

steps = db.collection(u'CurriculumWorkflow').order_by(u'index').stream()


for step in steps:
    print(f'{step.id} => {step.to_dict()}')
	#stepID=step.id


	


	
	