var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

function getLoggedInUserObject()
{
		user=firebase.auth().currentUser
        //console.log(user.uid)
        userData={}
        userData["uid"]=user.uid
        userData["email"]=user.email
        userData["name"]=user.displayName
        userData["photo"]=user.photoURL;
        return userData;
}

async function getLoggedInUserRole() {
	try {
		// firebase.auth().currentUser.getIdToken(true)
		const {
			claims: { admin },
		} = await firebase.auth().currentUser.getIdTokenResult(true)
		return admin
	} catch (err) {
		return err
	}
}


function closeAllModals()
{
    $.modal.close();
}

function gotoLink(path)
{
	oldPath=window.location.href
	oldPathArray=oldPath.split("/")
	newPath=oldPathArray.slice(0, oldPathArray.length-1).join("/")+path
	window.location.replace(newPath);
}

function getFormattedLink(path)
{
	oldPath=window.location.href
	oldPathArray=oldPath.split("/")
	newPath=oldPathArray.slice(0, oldPathArray.length-1).join("/")+path
	return newPath
}


function getLinkFromBasePath(path)
{
	originPath=window.location.origin
	pathName=window.location.pathname
	pathNameList=pathName.split("/")
	newPathRef=pathNameList[1]
	//console.log(newPathRef)
	/*if(newPathRef)
	{
		newPath=originPath+"/"+newPathRef+path
	}
	else
	{
		
	}
	*/
	newPath=originPath+path
	//console.log(newPath)
	return newPath
}
