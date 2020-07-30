import json
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import Session
from constant_variables import *
from utility import DecimalEncoder
        
class ListSessionsLambda(LambdaBase):
    def __init__(self): 
        pass

    def getItems(self, PatientId, HealthCareProfessionalId, SessionId):
        return Session().requestSession(PatientId, SessionId, HealthCareProfessionalId)

    def handle(self, event, context):
        PatientId = event["queryStringParameters"][DATASTORE_COLUMN_PATIENT_ID] if DATASTORE_COLUMN_PATIENT_ID in event["queryStringParameters"] else None
        HealthCareProfessionalId = event["queryStringParameters"][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID] if DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID in event["queryStringParameters"] else None
        SessionId = event["queryStringParameters"][DATASTORE_COLUMN_SESSION_ID] if DATASTORE_COLUMN_SESSION_ID in event["queryStringParameters"] else None
        result = self.getItems(PatientId, HealthCareProfessionalId, SessionId)
        return {
        "isBase64Encoded": False,
        "statusCode": 200,
        'body': json.dumps(result, cls=DecimalEncoder),
        "headers": {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            }
        }

lambda_handler = ListSessionsLambda.get_handler() 