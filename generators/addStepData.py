import firebase_admin
import mock
from firebase_admin import credentials
from firebase_admin import firestore
import os
from google.cloud import firestore
import google.auth.credentials
import argparse
import random
import time
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
# Initialize parser 
parser = argparse.ArgumentParser() 
# Adding optional argument 
parser.add_argument("-s", "--stepID", help = "Add Step ID")
parser.add_argument("-f", "--flowID", help = "Add Flow ID") 
  
# Read arguments from command line 
args = parser.parse_args() 
#print(args)  
if args.stepID: 
    stepID=args.stepID 
if args.flowID: 
    flowID=args.flowID 

#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

# creationData={}	
# creationData["flowType"]="CurriculumWorkflow"
# creationData["uid"]="abcd"
# creationData["email"]="rupin@whitehatjr.com"
# creationData["name"]="Rupin Chheda"
# creationData["ready"]=False

commentMeta={}
commentMeta["by"]={"email":"rupin@whitehatjr.com", "name":"Rupin Chheda"}
commentMeta["timestamp"]=time.time()
commentMeta["comment"]="This is the comment text"
formData={}

formData["fieldValues"]=["BEG","V87","C84",4,5]
formData["flowID"]=flowID
formData["stepID"]=stepID

formData["action"]="approved"
userDetail={}
userDetail["uid"]="abcd"
userDetail["email"]="poonam11gala@gmail.com"
userDetail["name"]="Anjali Kanitkar"

formData["timestamp"]=time.time()

formData["by"]=userDetail
formData["commentMeta"]=commentMeta
cacheDoc=db.collection(u'Cache').document().set(formData)

#stepDoc.update(formData)


