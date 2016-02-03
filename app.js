window.onload = function () {
	function getUrlParameter(variable, defaultValue) {
	  var query = location.search.substring(1);
	  var vars = query.split('&');
	  for (var i = 0; i < vars.length; i++) {
	    var pair = vars[i].split('=');
	    if (pair[0] === variable) {
	      return decodeURIComponent(pair[1]);
	    }
	  }
	  return defaultValue || false;
	}

	var data = getUrlParameter("json");
	
	try {
		data = JSON.parse(data);
	} catch(e) {
		data = [];
	}

	$.each(data, function(index, val) {
		$('#url-list').append($('#url-template').html()
			.replace(/{{title}}/g, val["title"])
			.replace(/{{url}}/g, val["url"])
			);
	});

	$("#url-list").on("click", ".url-remove", function() {
		$(this).parent().remove();
	});

	$("#url-add").on("click", function() {
		$('#url-list').append($('#url-template').html()
			.replace(/{{title}}/g, "")
			.replace(/{{url}}/g, "")
			);
	});

	$("#save-to-pebble").on("click", function() {
		var config = [];
		$("#url-list li").each( function() {
			var url_info = $(this).children('.url-info');
			config.push({
				title: url_info.children(".title").val(),
				url: url_info.children(".url").val()
			});
		});
		var return_to = getUrlParameter("return_to", "pebblejs://close#");
		var url = return_to + encodeURIComponent(JSON.stringify(config));
		console.log(url);
		document.location = url;
	});
}
