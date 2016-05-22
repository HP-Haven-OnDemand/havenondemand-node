import util from 'util';

function Client(apikey, version, proxy, staging) {
	// always initialize all instance properties
	if (apikey == 'http://api.havenondemand.com' || apikey == 'http://api.havenondemand.com/' || apikey == 'https://api.havenondemand.com' || apikey == 'https://api.havenondemand.com/') {
		throw new Error("Using an outdated wrapper constructor method. No need to include API URL.\nInclude as such:\n client = new havenondemand.HODClient(API_KEY, VERSION)");
	}

	if (version == undefined) {
		this.version = "v1";
	} else {
		this.version = version;
	}
	this.apikey = apikey;

	if (staging == undefined || staging == false) {
		this.endpoint = "https://api.havenondemand.com/1/api/%s/%s/" + this.version;
	} else if (staging == true) {
		this.endpoint = "https://api.staging.havenondemand.com/1/api/%s/%s/" + this.version;
	}
	this.proxy = proxy;
	this.getJobResultEndpoint = "https://api.havenondemand.com/1/job/result/%s?apikey=%s";
	this.getJobStatusEndpoint = "https://api.havenondemand.com/1/job/status/%s?apikey=%s";
}


function parseArgs(arg1, arg2, arg3) {
	let data, callback, async;
	if (typeof arg1 == "function") {
		callback = arg1;
	} else if (typeof arg1 == "object") {
		data = arg1;
	} else {
		async = arg1;
	}

	if (typeof arg2 == "function") {
		callback = arg2;
	} else if (typeof arg2 == "object") {
		data = arg2;
	} else {
		async = arg2;
	}

	if (typeof arg3 == "function") {
		callback = arg3;
	} else if (typeof arg3 == "object") {
		data = arg3;
	} else {
		async = arg3;
	}

	return {
		'data': data,
		'callback': callback,
		'async': async
	};
}

Client.prototype.call = function(handler, arg1, arg2, arg3) {
	let args = parseArgs(arg1, arg2, arg3);
	let data = args.data;
	let async = args.async;
	let callback = args.callback;
	if (typeof async == "undefined") async = false;
	if (typeof data == "undefined") data = {};

	if (data["file"]) {
		data["file"] = {
			'file': data["file"],
			'content_type': 'multipart/form-data'
		};
	}

	let async_string = "sync";
	data.apikey = this.apikey;

	if (async) {
		async_string = "async";
	}

	let url = util.format(this.endpoint, async_string, handler);


	url += '?' + (toQueryString(data));

	return fetch(url, {
		method: "GET"
	}).then(callback);
};

function toQueryString(obj) {
	let qString = '';
	for (let key in obj) {
		if (qString) {
			qString += '&';
		}
		// skip loop if the property is from prototype
		if (!obj.hasOwnProperty(key)) continue;

		if (typeof obj[key] !== 'object') {
			//your code
			qString += key + "=" + encodeURI(obj[key]);
		}
	}
	return qString;
}

export default {
	addToTextIndex: function(state, apiKey, indexName) {
		let client = new Client(apiKey, 'v1');		
		let data = JSON.stringify({
			"document": [{
				"content": state
			}]
		});

		let ApiParams = {
			"index": indexName,
			"json": data
		};

		let saved = client.call('addtotextindex', ApiParams, function(res) {
			if (res.ok) {
				return true;
			} else {
				return false;
			}
		});
		return {saved};
	}
};