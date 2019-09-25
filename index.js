var AWS = require('aws-sdk');

/* to change the setting of Async */
let lambda = new AWS.Lambda();

/* a http request library */
const axios = require('axios');

/* where the SQS come from, for the retry */
const originalSQSUrl = 'https://sqs.us-west-2.amazonaws.com/045483043004/DEV-Timeout';

/* Dead Letter Queue */
const dlqSQSUrl      = 'https://sqs.us-west-2.amazonaws.com/045483043004/TEST-Timeout-DLQ';

const max_retry      = 5;


exports.handler = function (event, context)  {
  /* Change the setting to Sync */
  let getAccountSettingsPromise = lambda.getAccountSettings().promise();
  
  /* get the main body (payload) */
  var body = event.Records[0];
  
  /* get retry from message attributes */
  var retry = body.messageAttributes.retry.stringValue;
  
  /* get the URL to post from message attributes */
  var url   = body.messageAttributes.url.stringValue;
  
  /* get the Payload */
  var payload = body.body;
  
  try{
      const res =  axios.get( url, {
          headers: {
            'Content-Type': 'application/json'
          },
          /* this timeout has to be less then AWS's timeout */
          timeout: 500
      })
      .then(function(){
          console.log("Http request successed.");
      })
      .catch(function(error){
          if(error.message.includes('timeout')){
              processRetry(url, retry, payload, originalSQSUrl);
              return;
        }
    });         
    
  }catch(err){
    console.log(err);
  }
};

/**
 * Process the retry, or send to DLQ
 */
function processRetry(url, retry, payload, originalSQSUrl){
    retry = Number(retry);
    if(retry > max_retry){
        /* for debug */
        console.log("stop retrying, sent to DLQ .retry: "+retry);
        retry = String(retry);
        pushToQueue(url, retry, dlqSQSUrl, payload);
    } else {
        retry++;
        retry = String(retry);
        console.log("Send back to original SQS with Retry: "+retry);
        pushToQueue(url, retry, originalSQSUrl, payload);
    }
}

/**
 * Send to an SQS
 */
function pushToQueue (dataUrl, retry, queueUrl, payload ){
    var sqs = new AWS.SQS({region : 'us-west-2'});
    var date = new Date();
    var min  = date.getMinutes();
    var sec  = date.getSeconds();
    var msc  = date.getMilliseconds();
    let params = {
        MessageAttributes: {
            "Author": {
                DataType: "String",
                StringValue: "4Over retry test"
            },
            "url": {
                DataType: "String",
                StringValue: dataUrl
            },
            "retry":{
                DataType: "String",
                StringValue: retry
            },
            "sentTime":{
                DataType: "String",
                StringValue: min+":"+sec+":"+msc,
            }
        },
        MessageBody: payload,
        QueueUrl: queueUrl
    };
    console.log(params);

    sqs.sendMessage(params, function(err, data) {
        if (err) {
            console.log("Error", err);
            return false;
        } else {
            console.log("Success sent out SQS", data.MessageId);
            return true;
        }
    });
}
