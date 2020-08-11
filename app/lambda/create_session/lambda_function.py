import json
import sys
import time
import uuid

sys.path.append("../")
import boto3
from lambda_base import LambdaBase
from constant_variables import *
from models import Session
from response_helper import sendResponse


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
            PatientId = event["queryStringParameters"][DATASTORE_COLUMN_PATIENT_ID].strip() if DATASTORE_COLUMN_PATIENT_ID in event["queryStringParameters"] else None
            HealthCareProfessionalId = event["queryStringParameters"][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID].strip() if DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID in event["queryStringParameters"] else None
            SessionName = event["queryStringParameters"][DATASTORE_COLUMN_SESSION_NAME].strip() if DATASTORE_COLUMN_SESSION_NAME in event["queryStringParameters"] else None
            SessionId = event["queryStringParameters"][DATASTORE_COLUMN_SESSION_ID].strip() if DATASTORE_COLUMN_SESSION_ID in event["queryStringParameters"] else None
            TimeStampStart = event["queryStringParameters"][DATASTORE_COLUMN_TIMESTAMP_START] if DATASTORE_COLUMN_TIMESTAMP_START in event["queryStringParameters"] else None
            TimeStampEnd= event["queryStringParameters"][DATASTORE_COLUMN_TIMESTAMP_END] if DATASTORE_COLUMN_TIMESTAMP_END in event["queryStringParameters"] else None
            TranscribeS3Path = event["queryStringParameters"][DATASTORE_COLUMN_TRANSCRIBE_S3_PATH] if DATASTORE_COLUMN_TRANSCRIBE_S3_PATH in event["queryStringParameters"] else None
            ComprehendS3Path = event["queryStringParameters"][DATASTORE_COLUMN_COMPREHEND_S3_PATH] if DATASTORE_COLUMN_COMPREHEND_S3_PATH in event["queryStringParameters"] else None

            if PatientId is None or PatientId == '' or PatientId[:2] != 'p-':
                return sendResponse(400, {'message':  DATASTORE_COLUMN_PATIENT_ID + " has incorrect format"})
            if HealthCareProfessionalId is None or HealthCareProfessionalId == '' or HealthCareProfessionalId[:2] != 'h-':
                return sendResponse(400, {'message':  DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID + " has incorrect format"})
            if SessionName is None or SessionName == '':
                return sendResponse(400, {'message':  DATASTORE_COLUMN_SESSION_NAME + " should not be empty"})
            if SessionId is None or SessionId == '' or SessionId[:2] != 's-':
                return sendResponse(400, {'message':  DATASTORE_COLUMN_SESSION_ID + " has incorrect format"})

            id = self.putItem(PatientId, HealthCareProfessionalId, SessionName, SessionId, TimeStampStart, TimeStampEnd, TranscribeS3Path, ComprehendS3Path)
            result = {DATASTORE_COLUMN_SESSION_ID : id}
            return sendResponse(200, result)
        except Exception as e:
            print("Unexpected error: %s" % e)
            return sendResponse(500, {'message':  "An unknown error has occurred. Please try again."})

lambda_handler = CreateSessionLambda.get_handler()