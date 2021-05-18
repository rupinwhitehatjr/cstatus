const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setAdmin = functions.region('asia-south1')
.firestore
.document('SetAdmin/{SetAdminId}')
.onWrite((change, context) => {
    try {
        const { isAdmin, email } = change.after.data()
        if (email) {
            admin.auth().getUserByEmail(email).then(user => {
                admin.auth().setCustomUserClaims(user.uid, {
                    admin: isAdmin ? true : false
                });
            }).then(() => {
                console.log(`New Admin Set to ${isAdmin} ${email}`)
            }).catch(err => {
                console.log(err)
            })
            return 0
        }
        else {
            console.log('Error')
            return 0
        }
    } catch (err) {
        console.log(err)
        return 0
    }
})