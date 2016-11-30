var needle = require('needle')
var util = require('util')
var fs = require('fs')
var querystring = require('querystring')

// Constructor
function HODClient(apikey, version, proxy, staging) {
  // always initialize all instance properties
  if (apikey=='http://api.havenondemand.com' || apikey=='http://api.havenondemand.com/' || apikey=='https://api.havenondemand.com' || apikey=='https://api.havenondemand.com/') {
    throw new Error("Using an outdated wrapper constructor method. No need to include API URL.\nInclude as such:\n client = new havenondemand.HODClient(API_KEY, VERSION)")
  }
  if (version==undefined) {this.version="v1";}
  else {this.version=version;}
  this.apikey = apikey;
  if (staging==undefined || staging==false) {
    this.endpoint = "https://api.havenondemand.com/1/api/%s/%s/"+this.version;
  } else if (staging==true) {
    this.endpoint = "https://api.staging.havenondemand.com/1/api/%s/%s/"+this.version;
  }
  this.proxy = proxy;
  this.getJobResultEndpoint = "https://api.havenondemand.com/1/job/result/%s?apikey=%s";
  this.getJobStatusEndpoint = "https://api.havenondemand.com/1/job/status/%s?apikey=%s";
  this.jobAPIEndpoint = "https://api.havenondemand.com/1/job";
}
// class methods

needle.defaults({ timeout: 120000});

validadeParameters=function(hodApp,params,async,callback) {
  if (typeof hodApp == "undefined") {
    throw new Error("Missing hodApp parameter. Required valid API name")
  }
  if (typeof params == "undefined") {
    throw new Error("Missing params parameter. Required API's input and configuration parameters")
  }
  if (typeof async == "undefined") {
    throw new Error("Missing async parameter. Required true or false")
  }else if (typeof async == "function"){
    if (typeof callback == "undefined") {
      throw new Error("Missing async parameter. Required true or false")
    }else{
      throw new Error("Wrong parameters order. Required (hodApp,params,async,callback)")
    }
  }
  if (typeof callback == "undefined") {
    throw new Error("Missing callback parameter. Required callback function")
  }else if (typeof callback != "function"){
    throw new Error("Wrong callback parameter. Required callback function")
  }
}
isJSON=function(value) {
  var ret = true
  try {
    JSON.parse(value);
  } catch (e) {
    ret = false
  }
  return ret
}
HODClient.prototype.post_combination = function(hodApp,params,async,callback) {
  var data = {}
  validadeParameters(hodApp,params,async,callback)
  async_string = "sync";
  data.apikey = this.apikey;
  data.combination = hodApp;

  for(var item in params){
    if (item == 'file'){
      var files = params[item].file
      var count = files.length
      for(var i=0; i<count; i++){
        var key = Object.keys(files[i])[0]
        var value = files[i][key]
        if (typeof data.file_parameters == "undefined")
          data.file_parameters = key
        else
          data.file_parameters += key

        if (typeof data.file == "undefined")
          data.file = {'file':value,'content_type':'multipart/form-data'}
        else
          data.file += {'file':value,'content_type':'multipart/form-data'}
        }
    }
    else {
      var d = ""
      if (isJSON(params[item])){
        d = util.format('{"name":"%s","value":%s}', item, params[item])
      }else {
        d = util.format('{"name":"%s","value":"%s"}', item, params[item])
      }
      if (typeof data.parameters == "undefined")
        data.parameters = d
      else
        data.parameters += d
    }
  }
  if (async)  async_string="async";

  var url = util.format(this.endpoint, async_string, "executecombination");

    if (async){
      var callback = callback;
      var callbackmanager=function(err,resp,body){
        var error;
        if (typeof(resp) == 'undefined') {
          error = 'Problem getting result from Haven OnDemand. Please try aagain.';
        } else if (resp.body.error) {
          error = resp.body;
        } else {
          error = null;
        }
        body={'async':true,'data':body};
        body.status
        callback(error, resp, body);
      }
    }
    else{
      var callbackmanager = function(err, resp, body) {
        var error;
        if (typeof(resp) == 'undefined') {
          error = 'Problem getting result from Haven OnDemand. Please try aagain.'
        } else if (resp.body.error) {
          error = resp.body;
        } else {
          error = null;
        }
        callback(error, resp, body);
      }
    }
    if (this.proxy != undefined) {
      needle.post(url, data, { multipart: true, proxy: this.proxy }, callbackmanager);
    } else {
      needle.post(url, data, { multipart: true }, callbackmanager);
    }
}
HODClient.prototype.get_combination = function(hodApp,params,async,callback) {
  validadeParameters(hodApp,params,async,callback)
  var data= {};
  async_string="sync";
  data.apikey=this.apikey;

  if (async) {
    async_string="async";
  }
  data.apikey = this.apikey;
  data.combination = hodApp;

  for(var item in params){
    if (item == 'file'){
      throw new Error("Cannot perform GET with file. Use POST request.")
    }
    else {
      var d = ""
      if (isJSON(params[item]))
        d = util.format('{"name":"%s","value":%s}', item, params[item])
      else
        d = util.format('{"name":"%s","value":"%s"}', item, params[item])

      if (typeof data.parameters == "undefined")
        data.parameters = d
      else
        data.parameters += d
    }
  }
  var url = util.format(this.endpoint, async_string,"executecombination") + "?" + querystring.stringify(data)
  if (async){
    var callback = callback;
    var callbackmanager=function(err,resp,body){
      var error;
      if (typeof(resp) == 'undefined') {
        error = 'Problem getting result from Haven OnDemand. Please try aagain.';
      } else if (resp.body.error) {
        error = resp.body;
      } else {
        error = null;
      }
      body={'async':true,'data':body};
      body.status
      callback(error, resp, body);
    }
  }
  else{
    var callbackmanager = function(err, resp, body) {
      var error;
      if (typeof(resp) == 'undefined') {
        error = 'Problem getting result from Haven OnDemand. Please try aagain.';
      } else if (resp.body.error) {
        error = resp.body;
      } else {
        error = null;
      }
      callback(error, resp, body);
    }
  }
  if (this.proxy != undefined) {
    needle.get(url, { proxy: this.proxy }, callbackmanager);
  } else {
    needle.get(url, callbackmanager);
  }
};
HODClient.prototype.post = function(hodApp,params,async,callback) {
  validadeParameters(hodApp,params,async,callback)
  var data = params
  if (data["file"]){
    data.file={'file':data["file"],'content_type':'multipart/form-data'}
  }
  async_string="sync";
  data.apikey=this.apikey;

  if (async) {
    async_string="async";
  }

  var url = util.format(this.endpoint,async_string,hodApp);

  if (async){
    var callback = callback;
    var callbackmanager=function(err,resp,body){
      var error;
      if (typeof(resp) == 'undefined') {
        error = 'Problem getting result from Haven OnDemand. Please try aagain.';
      } else if (resp.body.error) {
        error = resp.body;
      } else {
        error = null;
      }
      body={'async':true,'data':body};
      body.status
      callback(error, resp, body);
    }
  }
  else{
    var callbackmanager = function(err, resp, body) {
      var error;
      if (typeof(resp) == 'undefined') {
        error = 'Problem getting result from Haven OnDemand. Please try aagain.'
      } else if (resp.body.error) {
        error = resp.body;
      } else {
        error = null;
      }
      callback(error, resp, body);
    }
  }
  if (this.proxy != undefined) {
    needle.post(url, data, { multipart: true, proxy: this.proxy }, callbackmanager);
  } else {
    needle.post(url, data, { multipart: true }, callbackmanager);
  }
};

HODClient.prototype.get = function(hodApp,params,async,callback) {
  validadeParameters(hodApp,params,async,callback)
  if (params["file"]){
    throw new Error("Cannot perform GET with file. Use POST request.")
  }
  async_string="sync";
  params.apikey=this.apikey;

  if (async) {
    async_string="async";
  }

  var url = util.format(this.endpoint, async_string,hodApp) + "?" + querystring.stringify(params)
  if (async){
    var callback = callback;
    var callbackmanager=function(err,resp,body){
      var error;
      if (typeof(resp) == 'undefined') {
        error = 'Problem getting result from Haven OnDemand. Please try aagain.';
      } else if (resp.body.error) {
        error = resp.body;
      } else {
        error = null;
      }
      body={'async':true,'data':body};
      body.status
      callback(error, resp, body);
    }
  }
  else{
    var callbackmanager = function(err, resp, body) {
      var error;
      if (typeof(resp) == 'undefined') {
        error = 'Problem getting result from Haven OnDemand. Please try aagain.';
      } else if (resp.body.error) {
        error = resp.body;
      } else {
        error = null;
      }
      callback(error, resp, body);
    }
  }
  if (this.proxy != undefined) {
    needle.get(url, { proxy: this.proxy }, callbackmanager);
  } else {
    needle.get(url, callbackmanager);
  }
};

validadeGetJob=function(jobID,callback) {
  if (typeof jobID == "undefined") {
    if (typeof callback == "undefined") {
      throw new Error("Missing jobID parameter. Required valid job ID")
    }else{
      throw new Error("Wrong parameters order. Required function(jobID,callback)")
    }
  }else if (typeof jobID == "function"){
    if (typeof callback == "undefined") {
      throw new Error("Missing jobID parameter. Required valid job ID")
    }else{
      throw new Error("Wrong parameters order. Required function(jobID,callback)")
    }
  }
  if (typeof callback == "undefined") {
    throw new Error("Missing callback parameter. Required callback function")
  }else if (typeof callback != "function"){
    throw new Error("Wrong callback parameter. Required callback function")
  }
}
HODClient.prototype.getJobResult = function(jobID,callback) {
  validadeGetJob(jobID,callback)
  var url = util.format(this.getJobResultEndpoint, jobID, this.apikey);

  if (this.proxy != undefined) {
    return needle.get(url, {proxy: this.proxy}, callback);
  } else {
    return needle.get(url, callback);
  }
}

HODClient.prototype.getJobStatus = function(jobID,callback) {
  validadeGetJob(jobID,callback)
  var url = util.format(this.getJobStatusEndpoint, jobID, this.apikey);

  if (this.proxy != undefined) {
    return needle.get(url, {proxy: this.proxy}, callback);
  } else {
    return needle.get(url, callback);
  }
}

validadeBatchJob=function(params, callback) {
  if (typeof params == "undefined") {
    if (typeof callback == "undefined") {
      throw new Error("Missing params parameter. Required valid batch job parameters")
    }else{
      throw new Error("Wrong parameters order. Required function(params,callback)")
    }
  }else if (typeof params == "function"){
    if (typeof callback == "undefined") {
      throw new Error("Missing params parameter. Required valid batch job parameters")
    }else{
      throw new Error("Wrong parameters order. Required function(params,callback)")
    }
  }
  if (typeof callback == "undefined") {
    throw new Error("Missing callback parameter. Required callback function")
  }else if (typeof callback != "function"){
    throw new Error("Wrong callback parameter. Required callback function")
  }
}
HODClient.prototype.batchJob=function(params, callback) { // data is array
  validadeBatchJob(params,callback)
  var data = {};
  var url = this.jobAPIEndpoint;
  var apikey = this.apikey

  if (typeof params =="undefined") {
    data={};
  } else {
    processData(params, function(processedData) { //processedData is array
      data.apikey= apikey;
      data["job"] = processedData;
      var callbackmanager=function(err,resp,body){
        var error;
        if (typeof(resp) == 'undefined') {
          error = 'Problem getting result from Haven OnDemand. Please try aagain.'
        } else  if (resp.body.error) {
          error = resp.body;
        } else {
          error = null;
        }
        body={'async':true,'data':body};
        body.status
        callback(error, resp, body);
      }

      if (this.proxy != undefined) {
        needle.post(url, data, { multipart: true, proxy: this.proxy }, callbackmanager);
      } else {
        needle.post(url, data, { multipart: true }, callbackmanager);
      }
    })
  }
}

processData = function(params, callback) {
  for (var i=0; i<params.length; i++) {
    if (params[i]['params']["file"]) {
      params[i]['params']["file"]={'file':params[i]['params']["file"],'content_type':'multipart/form-data'}
    }
  }
  var payload = JSON.stringify({'actions': params});
  callback(payload);
}

function HODIndex(client,name){
  this.client=client;
  this.name=name;
}

HODClient.prototype.createIndex=function(name,arg1,arg2,arg3){
  throw new Error("Removed. Use post/get with \"createtextindex\" instead.")
}

HODClient.prototype.getIndex=function(name){
    throw new Error("Removed. Use post/get with \"listresources\" instead.")
}

HODClient.prototype.deleteIndex=function(name,arg1,arg2,arg3){
  throw new Error("Removed. Use post/get with \"deletetextindex\" instead.")
}

HODIndex.prototype.retrieveindexfields=function(callback){
  throw new Error("Removed. Use post/get with \"retrieveindexfields\" instead.")
}

HODIndex.prototype.status=function(callback){
  throw new Error("Removed. Use post/get with \"indexstatus\" instead.")
}

HODIndex.prototype.delete=function(callback){
  throw new Error("Removed. Use post/get with \"deletetextindex\" instead.")
}

HODIndex.prototype.deletedocs=function(callback,data){
  throw new Error("Removed. Use post/get with HODApps.DELETE_FROM_TEXT_INDEX instead.")
}

HODIndex.prototype.create=function(callback,data){
  throw new Error("Removed. Use post/get with HODApps.CREATE_TEXT_INDEX instead.")
}

HODIndex.prototype.adddocs=function(callback,docs,data){
  throw new Error("Removed. Use post/get with HODApps.ADD_TO_TEXT_INDEX instead.")
}


function HODConnector(client,name){
  this.client=client;
  this.name=name;
}

HODConnector.prototype.start=function(callback){
  throw new Error("Removed. Use post/get with \"startconnector\" instead.")
}

HODConnector.prototype.status=function(callback){
  throw new Error("Removed. Use post/get with \"connectorstatus\" instead.")
}

HODConnector.prototype.retrieveconfig=function(callback){
  throw new Error("Removed. Use post/get with \"retrieveconfig\" instead.")
}

HODConnector.prototype.updateconnector=function(callback,data){
  throw new Error("Removed. Use post/get with \"updateconnector\" instead.")
}

HODConnector.prototype.delete=function(callback){
  throw new Error("Removed. Use post/get with \"deleteconnector\" instead.")
}

// export the class
exports.HODClient=HODClient
exports.HODConnector=HODConnector
exports.HODIndex=HODIndex
