!function( undefined ) {
	var oex = opera.extension;
	var i18nObj = function() {
		var _m = [],
			lang = 'en',
			readyTransactions = [],
			localizeTransactions = [],
			initialized = false;
		function _om ( msg ) {
			var d = msg.data, 
				s = [];
			if(!d || d.action!=='i18n_localized') return;
			for(var j in d.data) s[j] = _m[j] = d.data[j];
			if(d.id) localizeTransactions[ d.id ]( d.language, s );
			if(!initialized) {
				initialized = true;
				lang = d.language;
				for(var i = 0, l = readyTransactions.length; i < l; i++) {
					readyTransactions[ i ]( lang );
					readyTransactions = readyTransactions.splice(i, 1);
				}
			}
		}
		var _l = function( stringData, callback ) {
			if( !stringData )	{ // no data :(
				if( callback && typeof callback == 'function' )	callback( '??', stringData );
				return; 
			}
			var id = Math.floor(Math.random()*1e16),
				cb = (callback && typeof callback == 'function') ? callback : function() {};
			localizeTransactions[ id ] = cb;
			oex.postMessage({ "action": 'i18n_localize', "id": id, "messages": stringData });
		};
		var _r = function( callback ) {
			var cb = (callback && typeof callback == 'function') ? callback : function() {};
			initialized ? callback( lang ) : readyTransactions.push( cb );
		};
		var _gm = function( id, replacements ) {
			if( !_m[ id ]) return id;
			var s = _m[ id ][ "message" ];
			if(replacements)
				for(var i in replacements) s = s.replace('<string/>', replacements[i] );
			return s;
		};
		oex.messages = _m;
		oex.addEventListener('message', _om, false);
		oex.postMessage({ "action": 'i18n_load' }); 
		return {
			get ready() { return _r; }, 	 // parameters: (callback_function)
			get localize() { return _l; },   // parameters: (strings, callback_function)
			get getMessage() { return _gm; } // parameters: (message_id[, replacements])
		};
	};
	if(!oex.i18n) oex.i18n = new i18nObj();
}();

// Status codes as per rfc2616
// @see http://tools.ietf.org/html/rfc2616#section-10
var statusCodes = new Array();
// Informational 1xx
statusCodes[100] = 'Continue';
statusCodes[101] = 'Switching Protocols';
// Successful 2xx
statusCodes[200] = 'OK';
statusCodes[201] = 'Created';
statusCodes[202] = 'Accepted';
statusCodes[203] = 'Non-Authoritative Information';
statusCodes[204] = 'No Content';
statusCodes[205] = 'Reset Content';
statusCodes[206] = 'Partial Content';
// Redirection 3xx
statusCodes[300] = 'Multiple Choices';
statusCodes[301] = 'Moved Permanently';
statusCodes[302] = 'Found';
statusCodes[303] = 'See Other';
statusCodes[304] = 'Not Modified';
statusCodes[305] = 'Use Proxy';
statusCodes[307] = 'Temporary Redirect';
// Client Error 4xx
statusCodes[400] = 'Bad Request';
statusCodes[401] = 'Unauthorized';
statusCodes[402] = 'Payment Required';
statusCodes[403] = 'Forbidden';
statusCodes[404] = 'Not Found';
statusCodes[405] = 'Method Not Allowed';
statusCodes[406] = 'Not Acceptable';
statusCodes[407] = 'Proxy Authentication Required';
statusCodes[408] = 'Request Time-out';
statusCodes[409] = 'Conflict';
statusCodes[410] = 'Gone';
statusCodes[411] = 'Length Required';
statusCodes[412] = 'Precondition Failed';
statusCodes[413] = 'Request Entity Too Large';
statusCodes[414] = 'Request-URI Too Long';
statusCodes[415] = 'Unsupported Media Type';
statusCodes[416] = 'Requested range not satisfiable';
statusCodes[417] = 'Expectation Failed';
// Server Error 5xx
statusCodes[500] = 'Internal Server Error';
statusCodes[501] = 'Not Implemented';
statusCodes[502] = 'Bad Gateway';
statusCodes[503] = 'Service Unavailable';
statusCodes[504] = 'Gateway Time-out';
statusCodes[505] = 'HTTP Version not supported';

function grow(id) {
  var textarea = document.getElementById(id);
  var newHeight = textarea.scrollHeight;
  var currentHeight = textarea.clientHeight;
  if (newHeight == 0 || $("#"+id).val() == "") {
    newHeight = 20;
  }
  textarea.style.height = newHeight + 'px';
}

function clearFields() {
  $("#response").css("display", "");
  $("#loader").css("display", "");
  $("#responsePrint").css("display", "none");

  $("#responseStatus").html("");
  $("#responseHeaders").val("");
  $("#codeData").text("");

  $("#responseHeaders").height(20);
  $("#headers").height(20);
  $("#postputdata").height(20);

  $("#respHeaders").css("display", "none");
  $("#respData").css("display", "none");
}

function sendRequest() {
  clearFields();
  if($("#url").val() != "") {
    addHistory($("#url").val(), $("#headers").val(), $("input[type=radio]:checked").val());
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = readResponse;
    try {
      xhr.open($("input[type=radio]:checked").val(), $("#url").val(), true);
      var headers = $("#headers").val();
      headers = headers.split("\n");
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i].split(": ");
        if (header[1])
            xhr.setRequestHeader(header[0],header[1]);
      }
      if(jQuery.inArray($("input[type=radio]:checked").val(), ["post", "put"]) > -1) {
        xhr.send($("#postputdata").val());
      } else {
        xhr.send("");
      }
    }
     catch(e){
      console.log(e);
      $("#responseStatus").html("<span style=\"color:#FF0000\">"+opera.extension.i18n.getMessage("bad_request")+"</span>");
      $("#respHeaders").css("display", "none");
      $("#respData").css("display", "none");

      $("#loader").css("display", "none");
      $("#responsePrint").css("display", "");
    }
  } else {
    console.log("no uri");
    $("#responseStatus").html("<span style=\"color:#FF0000\">"+opera.extension.i18n.getMessage("bad_request")+"</span>");
    $("#respHeaders").css("display", "none");
    $("#respData").css("display", "none");

    $("#loader").css("display", "none");
    $("#responsePrint").css("display", "");
  }
}

function readResponse() {
  grow('headers');
  grow('postputdata');
  if (this.readyState == 4) {
    try {
      if(this.status == 0) {
        throw('Status = 0');
      }
      $("#responseStatus").html(this.status+' '+statusCodes[this.status]);
      $("#responseHeaders").val(jQuery.trim(this.getAllResponseHeaders()));
      var debugurl = /X-Debug-URL: (.*)/i.exec($("#responseHeaders").val());
      if (debugurl) {
	  $("#debugLink").attr('href', debugurl[1]).html(debugurl[1]);
	  $("#debugLinks").css("display", "");
      }
      $("#codeData").html(jQuery.trim(this.responseText).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

      $("#respHeaders").css("display", "");
      $("#respData").css("display", "");

      $("#loader").css("display", "none");
      $("#responsePrint").css("display", "");

      grow('responseHeaders');
	  prettyPrint();
   }
   catch(e) {
     $("#responseStatus").html("No response.");
     $("#respHeaders").css("display", "none");
     $("#respData").css("display", "none");

     $("#loader").css("display", "none");
     $("#responsePrint").css("display", "");
   }
  }
}

function toggleData() {
  if(jQuery.inArray($("input[type=radio]:checked").val(), ["post", "put"]) > -1) {
    $("#data").css("display", "");
  } else {
    $("#data").css("display", "none");
  }
}

function init() {
  $("#url").width($("#purl").width()-80-30);
  $("#headers").width($("#pheaders").width()-80-30);
  $("#postputdata").width($("#data").width()-80-30);

  $("#responseHeaders").width($("#respHeaders").width()-80-30);
  $("#responseData").width($("#respHeaders").width()-80-30);

  $("#response").css("display", "none");
  $("#loader").css("display", "");
  $("#responsePrint").css("display", "none");
  $("#sep").css("display", "none");

  $("#data").css("display", "none");

  $("#responseStatus").html("");
  $("#respHeaders").css("display", "none");
  $("#respData").css("display", "none");

  $("#submit").click(function() { sendRequest(); return false; });
  $("#reset").click(function() { location.reload(); });
  $(".radio").change(function() { toggleData(); });
  $(".radio").focus(function() { toggleData(); });
  createTable();
}

//create table
function createTable() {
	var dbSize = 5 * 1024 * 1024; // 5MB
    restClientDB = openDatabase("SimpleRestClient", "1.0", "Simple REST Client", dbSize);
    restClientDB.transaction(
		function (tx) {
			tx.executeSql(
				"CREATE TABLE IF NOT EXISTS requests(url TEXT PRIMARY KEY ASC, headers TEXT, method TEXT, postputdata TEXT, timestamp DATETIME)",
				[],
				function(tx,r) {
					tx.executeSql(
						"DELETE FROM requests WHERE url NOT IN (SELECT url FROM requests ORDER BY timestamp ASC LIMIT 100)"
					);
					getHistory(tx,r);
				},
				onError
			);
		}
	);
}

//DB error handling
onError = function (tx, e) {
    console.log("Error: " + e.message);
}

function getHistory(tx, r) {
	restClientDB.transaction(
		function (tx) { tx.executeSql(
			"SELECT url FROM requests order by timestamp",
			[],
			function (tx, rs) {
				var availableTags = new Array();
				
				for (var i = 0; i < rs.rows.length; i++) {
					availableTags.push(rs.rows.item(i).url);
				}
				$( "#url" ).autocomplete({
						source: availableTags,
						select: autoCompleteSelected
				});
			},
			onError);
		}
	);
}

function autoCompleteSelected(event, ui) {
	restClientDB.transaction(
		function (tx) { 
			tx.executeSql(
				"SELECT headers, method, postputdata FROM requests WHERE url = ? ORDER BY timestamp DESC",
				[ui.item.value],
				function (tx, rs) {
					$("#headers").val(rs.rows.item(0).headers);
					$("#postputdata").val(rs.rows.item(0).postputdata);
					$("input[value="+rs.rows.item(0).method+"]").attr('checked',true);
					return true;
				},
				onError
			);
		}
	);
}

function addHistory(url, headers, method) {
	var newdt = new Date();
	var addedOn = newdt.getFullYear()+"-"+(newdt.getMonth()+1)+"-"+newdt.getDate()+" "+newdt.getHours()+":"+newdt.getMinutes()+":"+newdt.getSeconds();
	restClientDB.transaction(function (tx) { tx.executeSql("INSERT OR REPLACE INTO requests(url, headers, method, timestamp) VALUES (?,?,?,?)", [url, headers, method, addedOn], getHistory, onError); });
}
		
function lang() {
  $('._msg_').each(function () {
    var val = $(this).html();
    $(this).html(opera.extension.i18n.getMessage(val));
  });
  $('._msg_val_').each(function () {
    var val = $(this).val();
    $(this).val(opera.extension.i18n.getMessage(val));
  });
}

var restClientDB;

$(document).ready(function() {
  lang();
  init();
});
