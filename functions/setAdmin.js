const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setAdmin = functions.region('asia-south1')
.firestore
.document('SetAdmin/{SetAdminId}')
.onWrite((change, context) => {
    try {
        const { role, isRoleActive, email } = change.after.data()
        if (role && email) {
            admin.auth().getUserByEmail(email).then(user => {
                admin.auth().setCustomUserClaims(user.uid, {
                    admin: isRoleActive ? true : false
                });
            }).then(() => {
                console.log(`New Admin Set to ${isRoleActive} ${email}`)
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