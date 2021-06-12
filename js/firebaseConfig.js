
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyABwrFjBQT2_qP2OcEVFWu3i564eEDKsr4",
    authDomain: "certificatestatuschecker.firebaseapp.com",
    projectId: "certificatestatuschecker",
    storageBucket: "certificatestatuschecker.appspot.com",
    messagingSenderId: "307736054885",
    appId: "1:307736054885:web:939a6737fa20757cf90a8c",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const analytics = firebase.analytics();

  var db = firebase.firestore();
  //console.log(location.hostname)
  localhostnames=["localhost", "127.0.0.1"]
  isPresentInLH=localhostnames.indexOf(location.hostname)
  //console.log(isPresentInLH)
  if (isPresentInLH!=-1) {
    console.log("localhost")
    //db.useEmulator(location.hostname, 8081);
  }