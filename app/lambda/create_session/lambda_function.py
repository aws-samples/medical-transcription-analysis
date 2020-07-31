import json
import sys
import time
import uuid

sys.path.append("../")
import boto3
from lambda_base import LambdaBase
from constant_variables import *
from models import Session


class CreateSessionLambda(LambdaBase):
    def __init__(self): 
        pass

    def CurTimeToEpoch(self): 
        return int(time.time())

    def EpochToCurTime(self, epoch): #int
        return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(epoch))

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

    def handle(self, event, context):
        try:
            PatientId = event["queryStringParameters"][DATASTORE_COLUMN_PATIENT_ID] if DATASTORE_COLUMN_PATIENT_ID in event["queryStringParameters"] else None
            HealthCareProfessionalId = event["queryStringParameters"][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID] if DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID in event["queryStringParameters"] else None
            SessionName = event["queryStringParameters"][DATASTORE_COLUMN_SESSION_NAME] if DATASTORE_COLUMN_SESSION_NAME in event["queryStringParameters"] else None
            SessionId = event["queryStringParameters"][DATASTORE_COLUMN_SESSION_ID] if DATASTORE_COLUMN_SESSION_ID in event["queryStringParameters"] else None
            TimeStampStart = event["queryStringParameters"][DATASTORE_COLUMN_TIMESTAMP_START] if DATASTORE_COLUMN_TIMESTAMP_START in event["queryStringParameters"] else None
            TimeStampEnd= event["queryStringParameters"][DATASTORE_COLUMN_TIMESTAMP_END] if DATASTORE_COLUMN_TIMESTAMP_END in event["queryStringParameters"] else None
            TranscribeS3Path = event["queryStringParameters"][DATASTORE_COLUMN_TRANSCRIBE_S3_PATH] if DATASTORE_COLUMN_TRANSCRIBE_S3_PATH in event["queryStringParameters"] else None
            ComprehendS3Path = event["queryStringParameters"][DATASTORE_COLUMN_COMPREHEND_S3_PATH] if DATASTORE_COLUMN_COMPREHEND_S3_PATH in event["queryStringParameters"] else None

            id = self.putItem(PatientId, HealthCareProfessionalId, SessionName, SessionId, TimeStampStart, TimeStampEnd, TranscribeS3Path, ComprehendS3Path)
            result = {DATASTORE_COLUMN_SESSION_ID : id}
            return {
            "isBase64Encoded": False,
            "statusCode": 200,
            # 'body': json.dumps(result),
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