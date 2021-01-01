
      initApp = function() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            console.log("User signed in");
            // User is signed in.
            /*var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            console.log(email)*/
            closeAllModals()
            $(document).trigger("authready")

            user.getIdToken().then(function(accessToken) {
              //document.getElementById('sign-in-status').textContent = 'Signed in';
              //document.getElementById('sign-in').textContent = 'Sign out';
              /*document.getElementById('account-details').textContent = JSON.stringify({
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                phoneNumber: phoneNumber,
                photoURL: photoURL,
                uid: uid,
                accessToken: accessToken,
                providerData: providerData
              }, null, '  ');*/
            });
          } else {
            // User is signed out.
            console.log("User is Signed Out")
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);
            //
            //document.getElementById('sign-in-status').textContent = 'Signed out';
            //document.getElementById('sign-in').textContent = 'Sign in';
           //document.getElementById('account-details').textContent = 'null';
          }
        }, function(error) {
          console.log(error);
        });
      };

      window.addEventListener('load', function() {
        $("#loginmodal").modal({
          escapeClose: false,
          clickClose: false,
          showClose: false
        });
        initApp();
      });
