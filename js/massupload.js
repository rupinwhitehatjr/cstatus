$(document).ready(function(){

})

$(document).on("authready", function(event){

    //openWaitingModal();



});

const ref = firebase.storage().ref();


async function uploadxl()
{
	var New = +new Date
	const init = await swal({
		title: "Uploading Initialising",
		text: "Please wait...",
		icon: "info",
		dangerMode: true,
		button: false,
		timer: 3000
	  });
	// New Upload File
	try {
		var isChild = isChildExist('errorColumn')
		console.log(isChild)
		if (isChild)
			removeChild('errorColumn')
		console.log('NEW ---->', New)

		const file = $("#xlfile").prop('files')[0]
		var filecount = 0
		const name = Date.now() + "_" + filecount + "_" + file.name;
		console.log('NEW ---->', New)
		// Task save
		const task = await ref.child(name).put(file);
		console.log('NEW ---->', New)

		// Get download url
		const downloadURL = await task.ref.getDownloadURL();
		const willDelete = await swal({
			title: "File uploading...",
			text: "Please do not refresh",
			icon: "warning",
			dangerMode: true,
			button: false,
			timer: 5500
		});		
		if (downloadURL) {
			var uploadError = []
			// New document added query generate
			var snapshot = await db.collection('excelUploadError').orderBy("createdAt", "desc").limit(1).get();
			await snapshot.docChanges().reverse().forEach(async doc => {
				uploadError = await doc.doc.data()
				
				if (doc.type === 'added' && await doc.doc.data()) {
					var errorLogs = await doc.doc.data().errorLog
					console.log(errorLogs)
				}
				else {
					await swal({
						title: "Error",
						text: "Please retry or check your internet connection",
						icon: "error",
						dangerMode: true,
						button: true						
					});
					return
				}
				console.log(uploadError)
				console.log(uploadError.createdAt, New)
				console.log(((((uploadError.createdAt - New) / 60) / 1000) > 0))
				console.log('NEW ---->', New)
				const willDelete = await swal({
					title: "File verifying...",
					text: "Thanks For Your Patients",
					icon: "info",
					dangerMode: true,
					button: false,
					timer: 3000
				});
				console.log('NEW ---->', uploadError.createdAt, New)
				console.log('UPLOAD ERROR ----->', uploadError)
				
				// Latest error log
				if (uploadError.createdAt >= New) {
					let errorMessage = ''
					$('#errorColumn').append('<h1 style="color: #FF0000">Got Error</h1>')
					for (let item of errorLogs) {
						// errorMessage += `${item}\n\n`
						$('#errorColumn').append('<img style="width: 5%" src="https://cdn2.iconfinder.com/data/icons/20-flat-general-pack/512/Cross-512.png"/><p>' + item + '</p')
					}
				} else {
					// Progress bar
					$('#searchButton').hide();
					var progressBar = `<div class="progress border">
					<div id="progressBarValue" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
				  </div>`
					$('#progressBar').append(progressBar)
					var delay = 50000;
					$(".progress-bar").each(function (i) {

						$(this).delay(delay * i).animate({
							width: $(this).attr('aria-valuenow') + '%'
						}, delay);

						$(this).prop('Counter', 0).animate({
							Counter: $(this).text()
						}, {
							duration: delay,
							// easing: 'swing',
							step: async function (now) {
								$(this).text(Math.ceil(now) + '%');
								document.getElementById("progressBarValue").innerHTML = '100%'
								var fileUpload = swal({
									icon: 'success',
									title: 'Congratulation, File has been uploaded',
									button: false
								}).then((res) => {
									window.location = 'index.html'
								})
							}
						});
					});
				}
			});
		}
		else {
			swal({
				title: "Error",
				text: "Download url not generated",
				icon: "error",
				dangerMode: true				
			})
		}
	}
	catch (error) {
		console.log(error)
		if (!($("#xlfile").prop('files')[0])) {
			swal({
				title: "Got Error!",
				text: 'Please upload file',
				icon: "error",
				button: "Ok!",
			});
		} else {
			swal({
				title: "Got Error!",
				text: 'Internal Error',
				icon: "error",
				button: "Ok!",
			});
		}
	}


	// batchSize=200
	// const file = $("#xlfile").prop('files')[0]
	// const rowCount = $("#rowcount").val()

	// filecopies=Math.ceil(parseInt(rowCount)/batchSize)
	// console.log(filecopies)

	// const name = Date.now()+"_"+filecount+"_"+file.name;
	// for(filecount=0;filecount<filecopies;filecount++)
	// {

	// 	const name = Date.now()+"_"+filecount+"_"+file.name;
	// 	// const metadata = {
	// 	// 	contentType: file.type,
	// 	// 	customMetadata: {
    // 	// 		'index': filecount
  	// 	// 	}

	// 	// };
	// 	const task = ref.child(name).put(file, metadata);
	// 	task.then(snapshot => snapshot.ref.getDownloadURL()).then((url) => {

	// 		console.log(url);

	// 	})
	// 	.catch(console.error);

	// }



}

// Remove child
function removeChild(childId) {
	$(`#${childId}`).empty();
}

// Child Exist
function isChildExist(parentId) {
	var child = $(`#${parentId}`)
	if (child) {
		return true
	} else {
		return false
	}
}