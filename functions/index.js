const admin = require('firebase-admin');
admin.initializeApp();


const upload = require('./upload')
const setAdmin = require('./setAdmin')

exports.upload = upload.upload
exports.setAdmin = setAdmin.setAdmin
