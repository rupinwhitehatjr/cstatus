const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();



exports.escalate = functions
					.region('asia-east2')
					.pubsub
					.schedule('every 60 minutes')
					.onRun((context) => {
  console.log('This will be run every 60 minutes!');
  return null;
});
