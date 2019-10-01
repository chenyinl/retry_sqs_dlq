# Using promise on AWS Lambda Node.js
![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)
![version](https://img.shields.io/badge/version-0.0.1-green.svg)
> Example of how to use Promise() in AWS' way to make sure the function gets executed.

This code received payload from AWS SQS, make a GET call to the URL in the message attributes. If the process fails due to `timeout`, it will send it back to SQS and increment the retry. If the retry is more then a number (for example: 5). It will send this payload to a `DEAD-LETTER-QUEUE (DLQ)`.

## Table of Contents
- [Background](#background)
- [Install](#install)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Reference](#reference)

## Background
When we have a heavy loaded API call, we can use message Queue to avoid over-load the server and result in server crash or DB freeze. We can put the URL, http method in the message attributes, put the API payload in the message body in JSON format, and use a Lambda function to process those Queue.

## Install
This modules needs the following `NPM`:
```
> npm install aws-sdk
> npm install axios
```

## Deployment
Compress the files into a zip file, upload the zip to AWS Lambda. Set up the trigger from SQS.
```
zip anyfilename.zip -r index.js node_modules/
```

## Usage
After deployed to AWS, use `CloudWatch` or `Xray` to trace the log.

## Files
index.js is the main file.
send.js is just the file to send out SQS, mostly for development and testing.

## Contributing

PRs accepted.

## License

Private

## Reference
```
https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
```
