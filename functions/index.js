const admin = require('firebase-admin');
admin.initializeApp();


const upload = require('./upload')
exports.upload = upload.upload
