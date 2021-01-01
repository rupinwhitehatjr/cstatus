// Created by STRd6
// MIT License
// jquery.paste_image_reader.js
(function($) {
	var defaults;
	$.event.fix = (function(originalFix) {
		return function(event) {
			event = originalFix.apply(this, arguments);
			if (event.type.indexOf("copy") === 0 || event.type.indexOf("paste") === 0) {
				event.clipboardData = event.originalEvent.clipboardData;
			}
			return event;
		};
	})($.event.fix);
	defaults = {
		callback: $.noop,
		matchType: /image.*/
	};
	return ($.fn.pasteImageReader = function(options) {
		if (typeof options === "function") {
			options = {
				callback: options
			};
		}
		options = $.extend({}, defaults, options);
		return this.each(function() {
			var $this, element;
			element = this;
			$this = $(this);
			return $this.bind("paste", function(event) {
				var clipboardData, found;
				found = false;
				clipboardData = event.clipboardData;
				return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
					var file, reader;
					if (found) {
						return;
					}
					if (
						type.match(options.matchType) ||
						clipboardData.items[i].type.match(options.matchType)
					) {
						file = clipboardData.items[i].getAsFile();
						reader = new FileReader();
						reader.onload = function(evt) {
							return options.callback.call(element, {
								dataURL: evt.target.result,
								event: evt,
								file: file,
								name: file.name
							});
						};
						reader.readAsDataURL(file);
						//snapshoot();
						return (found = true);
					}
				});
			});
		});
	});
})(jQuery);

var dataURL, filename;
$("html").pasteImageReader(function(results) {
	filename = results.filename, dataURL = results.dataURL;
	$data.text(dataURL);
	$size.val(results.file.size);
	$type.val(results.file.type);
	var img = document.createElement("img");
	img.src = dataURL;
	var w = img.width;
	var h = img.height;
	$width.val(w);
	$height.val(h);
	//console.log(dataURL)
	eventObj={}
	eventObj.data=dataURL
	eventObj.id=$(".active").attr("id")
	$(document).trigger("imagepasted", eventObj);
	return $(".active")
		.css({
			//backgroundImage: "url(" + dataURL + ")"
		})
		.data({ width: w, height: h });
});

var $data, $size, $type, $width, $height;
$(function() {
	$data = $(".data");
	$size = $(".size");
	$type = $(".type");
	$width = $("#width");
	$height = $("#height");
	$(".target").on("click", function() {
		var $this = $(this);
		var bi = $this.css("background-image");
		if (bi != "none") {
			$data.text(bi.substr(4, bi.length - 6));
		}

		$(".active").removeClass("active");
		$this.addClass("active");

		$this.toggleClass("contain");

		$width.val($this.data("width"));
		$height.val($this.data("height"));
		if ($this.hasClass("contain")) {
			$this.css({
				width: $this.data("width"),
				height: $this.data("height"),
				"z-index": "10"
			});
		} else {
			$this.css({ width: "", height: "", "z-index": "" });
		}
	});
});

function copy(text) {
	var t = document.getElementById("base64");
	t.select();
	try {
		var successful = document.execCommand("copy");
		var msg = successful ? "successfully" : "unsuccessfully";
		alert("Base64 data copied " + msg + " to clipboard");
	} catch (err) {
		alert("Unable to copy text");
	}
}
