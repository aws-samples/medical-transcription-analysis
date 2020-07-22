import json
import sys
import time
import uuid

sys.path.append("../")
import boto3
from lambda_base import LambdaBase


class CreateSessionLambda(LambdaBase):
    def __init__(self): 
        pass

    def CurTimeToEpoch(self): 
        return int(time.time())

    def EpochToCurTime(self, epoch): #int
        return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(epoch))

    def putItem(self, PatientId, HealthCareProfessionalId, SessionName, TimeStampStart):
        client = boto3.resource('dynamodb')
        table = client.Table("Sessions")
        tempId = uuid.uuid4().hex 
        epochTime = self.CurTimeToEpoch()
        SessionId = "s-"+tempId+str(epochTime)
        ComprehendS3Path = "c-"+tempId+str(epochTime)
        TranscribeS3Path = "t-"+tempId+str(epochTime)
        AudioS3Path = "a-"+tempId+str(epochTime)
        table.put_item(Item= {'SessionId': SessionId,
                              'PatientId': PatientId,
                              'HealthCareProfessionalId': HealthCareProfessionalId,
                              'SessionName': SessionName,
                              'ComprehendS3Path': ComprehendS3Path,
                              'TranscribeS3Path': TranscribeS3Path,
                              'AudioS3Path': AudioS3Path,
                              'TimeStampStart': TimeStampStart,
                              'TimeStampEnd': epochTime})
        s3_client = boto3.resource('s3')
        return SessionId

    def handle(self, event, context):
        print("event: {}".format(event))
        try:
            PatientId = event['PatientId'] if 'PatientId' in event else None
            HealthCareProfessionalId = event['HealthCareProfessionalId'] if 'HealthCareProfessionalId' in event else None
            SessionName = event['SessionName'] if 'SessionName' in event else None
            TimeStampStart = event['TimeStampStart'] if 'TimeStampStart' in event else None
            id = self.putItem(PatientId, HealthCareProfessionalId, SessionName, TimeStampStart)
            result = {'SessionId' : id}
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

lambda_handler = CreateSessionLambda.get_handler()