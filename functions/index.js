const admin = require('firebase-admin');
admin.initializeApp();



const copy = require('./copy');
const ps = require('./processSubmission');
const notification = require('./sendNotification');
const setRoles = require('./onSubmission/setRoles');
const onApprove = require('./onSubmission/onApprove');
const onReject = require('./onSubmission/onReject');
const onReOpen = require('./onSubmission/onReOpen');

const updateFacade = require('./onSubmission/updateFacade');
const copyRole = require('./onSubmission/copyRoles');
const escalation = require('./scheduled/escalation');



//exports.processSubmission = ps.processSubmission;
exports.makeCopy = copy.copyLayout;

exports.setRoles = setRoles.setRoles;
exports.onApprove = onApprove.onApprove;
exports.onReject = onReject.onReject;
exports.onReOpen = onReOpen.onReOpen;
exports.updateFacade = updateFacade.updateFacade;


exports.sendNotification = notification.sendNotification;
exports.copyRoleForActiveStep=copyRole.copyRoleForActiveStep

//exports.escalation=escalation.escalate

