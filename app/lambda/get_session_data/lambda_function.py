import json
import sys
import os
sys.path.append("../")
import boto3
from lambda_base import LambdaBase
from constant_variables import *

class GetSessionDataLambda(LambdaBase):
    def __init__(self): 
        pass

    def putItem(self, PatientId, HealthCareProfessionalId, SessionName, SessionId, TimeStampStart, TimeStampEnd, TranscribeS3Path, ComprehendS3Path):
        info = {DATASTORE_COLUMN_SESSION_ID : SessionId,
                DATASTORE_COLUMN_PATIENT_ID: PatientId,
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: HealthCareProfessionalId,
                DATASTORE_COLUMN_SESSION_NAME: SessionName,
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: ComprehendS3Path,
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: TranscribeS3Path,
                DATASTORE_COLUMN_TIMESTAMP_START: TimeStampStart,
                DATASTORE_COLUMN_TIMESTAMP_END: TimeStampEnd}
        Session().createSession(info)
        return SessionId

    def getKeyName(self, sessionId, category, fileType):
        return 'public/'+category+'-medical-output/'+sessionId+'/'+sessionId+'-session-'+category+'.'+fileType

    def handle(self, event, context):
        try:
            print(event)
            sessionId = event['queryStringParameters']['sessionId'] if 'sessionId' in event['queryStringParameters'] else None
            print(sessionId)
            bucket = os.environ['BUCKET_NAME']
            comprehend_key = self.getKeyName(sessionId,'comprehend','json')
            transcribe_key = self.getKeyName(sessionId,'transcribe','txt')
            client = boto3.client('s3', region_name=os.environ['AWS_REGION'])
            comprehend_result = client.get_object(Bucket=bucket, Key=comprehend_key)
            transcribe_result = client.get_object(Bucket=bucket, Key=transcribe_key)
            result = {'comprehend': (comprehend_result['Body'].read()).decode("utf-8"), 'transcribe': (transcribe_result['Body'].read()).decode("utf-8")}

            return {
            "isBase64Encoded": False,
            "statusCode": 200,
            'body': json.dumps(result),
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                }
            }
        except Exception as e:
            print(str(e))

lambda_handler = GetSessionDataLambda.get_handler()
 