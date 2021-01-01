import firebase_admin
import mock
from firebase_admin import credentials
from firebase_admin import firestore
import os
from google.cloud import firestore
import google.auth.credentials

# use firebase emulators:start --project test
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

creationData={}	
creationData["flowType"]="CurriculumWorkflow"
creationData["uid"]="abcd"
creationData["email"]="rupin@whitehatjr.com"
creationData["name"]="Rupin Chheda"
creationData["ready"]=False

doc_ref = db.collection(u'Workflows').document()
db.collection(u'Workflows').document(doc_ref.id).set(creationData)

print(doc_ref.id)

