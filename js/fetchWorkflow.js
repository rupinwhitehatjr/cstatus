$(document).ready(function(){
// Initialize Cloud Firestore through Firebase


db.collection("CurriculumWorkflow").where("position", "==", 1).get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
});


});