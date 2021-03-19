import json
import sys
import os
sys.path.append("../")
import boto3
from lambda_base import LambdaBase
from constant_variables import *
from response_helper import sendResponse

class GetSessionDataLambda(LambdaBase):
    def __init__(self): 
        pass

    def getKeyName(self, sessionId, category, fileType):
        return 'public/'+category+'-medical-output/'+sessionId+'/'+sessionId+'-session-'+category+'.'+fileType

    def handle(self, event, context):
        try:
            sessionId = event['queryStringParameters'][DATASTORE_COLUMN_SESSION_ID].strip() if DATASTORE_COLUMN_SESSION_ID in event['queryStringParameters'] else None
            if sessionId is None or sessionId[:2] != 's-':
                return sendResponse(400, {'message':  DATASTORE_COLUMN_SESSION_ID + " has incorrect format"})

            bucket = os.environ['BUCKET_NAME']
            comprehend_key = self.getKeyName(sessionId,'comprehend','json')
            transcribe_key = self.getKeyName(sessionId,'transcribe','txt')
            soap_key = self.getKeyName(sessionId,'soap-notes','txt')
            client = boto3.client('s3', region_name=os.environ['AWS_REGION'])
            comprehend_result = client.get_object(Bucket=bucket, Key=comprehend_key)
            transcribe_result = client.get_object(Bucket=bucket, Key=transcribe_key)
            soap_result = client.get_object(Bucket=bucket, Key=soap_key)
            result = {'comprehend': (comprehend_result['Body'].read()).decode("utf-8"), 'transcribe': (transcribe_result['Body'].read()).decode("utf-8"), 'soapNotes': (soap_result['Body'].read()).decode("utf-8")}

            return sendResponse(200, result)
        except Exception as e:
            print(str(e))
            return sendResponse(500, {'message':  "An unknown error has occurred. Please try again."})

lambda_handler = GetSessionDataLambda.get_handler()
 