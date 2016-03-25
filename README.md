**Note:** formerly known as `iod-node`. For the older version, see the `iod` branch.

# Node JS client library for Haven OnDemand
Official client library to help with calling Haven OnDemand APIs [http://havenondemand.com](http://havenondemand.com).

## What is Haven OnDemand?
Haven OnDemand is a set of over 70 APIs for handling all sorts of unstructured data. Here are just some of our APIs' capabilities:
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
var hod = require('havenondemand')
client = new hod.HODClient(apikey, version)
```
You can find your API key [here](https://www.haveondemand.com/account/api-keys.html) after signing up.

`version` is an optional parameter (defaults to `'v1'`) and can be either `'v1'` or `'v2'`.
### Callbacks

```js
var callback = function(err,resp,body){
  console.log(body)
}
```

We can define our callbacks as functions and pass them as arguments

```js
var data = {'text' : 'I like cats'}
client.call('analyzesentiment', callback, data)
```
Or, we can use the .on('data') hook to do the same thing.

```js
client.call('analyzesentiment',data).on('data',callback)
```

The order of the arguments after the API name doesn't matter when passed, so all of these are the equivalent.

```js
//1
client.call('analyzesentiment', data, callback)
//2
client.call(data, 'analyzesentiment', callback)
//3
client.call(data, callback, 'analyzesentiment')
```


### Async calls

While node will mostly deal with things asynchronously, Haven OnDemand offers server side asynchronous call method which should be used with large files and slow queries. Pass a boolean for the async parameter.

```js
client.call('analyzesentiment', data, callback, true)
```

**Querying jobs from async calls**

When you create a job asynchronously, you will get a jobID returned as ```body.data.jobID```. You can then query this job to get it status and eventually the result. You can see the API here: [docs/AsynchronousAPI](https://dev.havenondemand.com/docs/AsynchronousAPI.htm). You use the same ```client.call``` method to query jobs by adding ```jobID``` & ```method``` to the ```data``` object.

```js
client.call('job', {jobID: <jobID>, type: 'status'}, callback); // get the status of the job, including results if the job is finished.

client.call('job', {jobID: <jobID>, type: 'result'}, callback); // waits until the job has finished and then returns the result.
```

### Posting files

File posting is handled using the "file" parameter name which is used for all current file postings in Haven OnDemand

```js
var data = {'file' : 'test.txt'}
client.call('analyzesentiment', data, callback)
```

## Contributing
We encourage you to contribute to this repo! Please send pull requests with modified and updated code.

1. Fork it ( https://github.com/HPE-Haven-OnDemand/havenondemand-node/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
