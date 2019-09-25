# retry_sqs_dlq
process the sqs, send it back if time out. DLQ if more then 5 times.

# AWS Lambda Issue
The problem of running Node.js with AWS Lambda is, sometime the callback function just does not get executed and it is really hard to debug. The key is 
`
let getAccountSettingsPromise = lambda.getAccountSettings().promise();
`
That was from https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
