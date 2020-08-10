import json
import sys

sys.path.append("../")
import boto3
from lambda_base import LambdaBase
from constant_variables import *

class GetTranscriptionComprehendLambda(LambdaBase):
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
            # bucket get where 
            # region
            bucket = 'mtastack-mtastackstorages3bucketc161f3b3-1tfncqzctldb1'
            comprehend_key = self.getKeyName(sessionId,'comprehend','json')
            transcribe_key = self.getKeyName(sessionId,'transcribe','txt')
            print(comprehend_key)
            print(transcribe_key)
            client = boto3.client('s3', region_name='us-west-2')
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

lambda_handler = GetTranscriptionComprehendLambda.get_handler()

# def getKeyName(sessionId, category, fileType):     
#     return 'public/'+category+'-medical-output/'+sessionId+'/'+sessionId+'-session-'+category+'.'+fileType

# bucket = 'mtastack-mtastackstorages3bucketc161f3b3-1tfncqzctldb1'
# comprehend_key = getKeyName('s-1596908098q9nbq4KpsgXXqVuHjcTWYC','comprehend','json')
# transcribe_key = getKeyName('s-1596908098q9nbq4KpsgXXqVuHjcTWYC','transcribe','txt')
# client = boto3.client('s3', region_name='us-west-2')
# comprehend_result = client.get_object(Bucket=bucket, Key=comprehend_key)
# # transcribe_result = client.get_object(Bucket=bucket, Key=transcribe_key)
# print(comprehend_result['Body'].read())
# # print(transcribe_result['Body'].read())

# transcribe_key = 'public/transcribe-medical-output/s-1596908098q9nbq4KpsgXXqVuHjcTWYC/s-1596908098q9nbq4KpsgXXqVuHjcTWYC-session-transcribe.txt'
