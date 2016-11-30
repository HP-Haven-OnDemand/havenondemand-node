**Note:** formerly known as `iod-node`. For the older version, see the `iod` branch.

# Node JS client library for Haven OnDemand
Official client library to help with calling Haven OnDemand APIs [http://havenondemand.com](http://havenondemand.com).

## What is Haven OnDemand?
Haven OnDemand is a set of over 60 APIs for handling all sorts of unstructured data. Here are just some of our APIs' capabilities:
* Speech to text
* OCR
* Text extraction
* Indexing documents
* Smart search
* Language identification
* Concept extraction
* Sentiment analysis
* Web crawlers
* Machine learning

For a full list of all the APIs and to try them out, check out https://www.havenondemand.com/developer/apis

### Installation
To install, run the following command:
```
npm install havenondemand
```
If you want to install the latest module directly from Github, use the following command:
```
npm install git+https://github.com/HP-Haven-OnDemand/havenondemand-node
```

### Include it
```js
var havenondemand = require('havenondemand')
var client = new havenondemand.HODClient(apikey, version, proxy)
```
You can find your API key [here](https://www.haveondemand.com/account/api-keys.html) after signing up.

`version` is an optional parameter (defaults to `'v1'`) and can be either `'v1'` or `'v2'`.

`proxy` is an optional parameter. Please set this if you're behind a firewall. Here is an example of iniating the client if you're using a proxy:
```js
var havenondemand = require('havenondemand')
var client = new havenondemand.HODClient('123456-asdf', 'v1', 'http://user:pass@proxy.server.com:3128')
```
### Callback
We must define a callback function and pass it as an argument
```js
var callback = function(err,resp,body){
  console.log(body)
}
var data = {'text' : 'I like cats'}
client.post('analyzesentiment', data, false, callback)
```

The order of the arguments is strict. It must be in the following order:
method("api_name", {params}, async=[true|false], callback_method)
```js
//1
var data = {'text' : 'I like cats'}
client.post('analyzesentiment', data, false, callback)
```

### GET request
APIs can be accessed via a GET request.
```js
var data = {'text' : 'I like cats'}
client.get('analyzesentiment', data, false, function(err, resp, body) {
  if (!err) {
    console.log(resp.body)
  }
})
```

### Async calls

While node will mostly deals with processes asynchronously, Haven OnDemand offers server side asynchronous call methods which should be used with large files and slow queries. Pass a boolean for the async parameter. The API response will return back a job ID which is used to check the status or result of your API request.
```js
var jobID
var data = {'text': 'I love dogs'}
client.post('analyzesentiment', data, true, function(err, resp, body) {
  jobID = resp.body.jobID
  console.log(jobID)
})
```
**(Recommended method)** To check the status of your API call, use the following code with the jobID from obtained from the async call above. This will tell you if it's still processing or if it's complete, and if so, it will return the result.
```js
client.getJobStatus(jobID, function(err, resp, body) {
  console.log(resp.body)
})
```
Or, to check the result of your API call, use the following code with the jobID obtained from the async call. *Note: This method may timeout if your async API call is still processing.*
```js
client.getJobResult(jobID, function(err, resp, body) {
  console.log(resp.body)
})
```

### Posting files

File posting is handled using the "file" parameter name which is used for all current file postings in Haven OnDemand

```js
var data = {'file' : 'test.txt'}
client.post('analyzesentiment', data, false, function(err, resp, body) {
  if (err) {
    console.log(err)
  } else {
    console.log(resp.body)
  }
})
```

### Combinations

Haven OnDemand allows to chain two ore more APIs together to create customizable, reusable services. These combinations enable one data input to have unlimited transformations and processing all from a single API call.
E.g. if you created a combination API name "sentimentanalysistoindex" which takes input as plain text. You can call the combination API from the code shown below:
```js
var params = {text : "Haven OnDemand is awesome."};
client.post_combination('sentimentanalysistoindex', params, false, function(err, resp, body) {
  if (err) {
    console.log(err)
  } else {
    console.log(resp.body)
  }
})
```

**Note: using local files and publicly accessible URLs is not supported by this wrapper**

To find out more about combinations and how to create one, see [here](https://dev.havenondemand.com/combination/home).

### Batch jobs

Haven OnDemand allows you to batch multiple API jobs in a single request using the Job API, for example, to analyze a batch of web pages, documents or social media messages where you need to analyze each text individually but want to be more efficient with your code, or where you want to execute multiple API calls on a single web page, document, or text. **Note: files are currently not supported in this wrapper for batch jobs.**

```js
var jobID
var data = [
  { "name": "analyzesentiment",
     "version": "v1",
     "params": {
        'text': 'I love dogs'
      }
   },
   { "name": "extractconcepts",
      "version": "v1",
      "params": {
         "url": "http://en.wikipedia.org/wiki/United_Kingdom"
       }
    }
 ]
client.batchJob(data, function(err, resp, body) {
  jobID = resp.body.jobID
  console.log(jobID)
})

//
// check result of async request with Status API after some time
//

client.getJobStatus(jobID, function(err, resp, body) {
  console.log(resp.body)
})
```


## Contributing
We encourage you to contribute to this repo! Please send pull requests with modified and updated code.

1. Fork it ( https://github.com/HPE-Haven-OnDemand/havenondemand-node/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
