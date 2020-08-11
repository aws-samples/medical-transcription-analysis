import json
import uuid
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import Patient
from constant_variables import *

class CreatePatientLambda(LambdaBase):
    def __init__(self): 
        pass

    def putItem(self, PatientName):
        PatientId = "p-"+uuid.uuid4().hex
        info = {DATASTORE_COLUMN_PATIENT_ID: PatientId, DATASTORE_COLUMN_PATIENT_NAME:  PatientName}
        Patient().createPatient(info)
        return PatientId

    def handle(self, event, context):
        try:
            name = event["queryStringParameters"][DATASTORE_COLUMN_PATIENT_NAME] if DATASTORE_COLUMN_PATIENT_NAME in event["queryStringParameters"] else None
            if not name or name == '':
                return {
                "isBase64Encoded": False,
                "statusCode": 400,
                'body': json.dumps({'message': DATASTORE_COLUMN_PATIENT_NAME + ' should not be empty.'}),
                "headers": {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                    }
                }
            id = self.putItem(name)
            result = {DATASTORE_COLUMN_PATIENT_ID : id}
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
            return {
            "isBase64Encoded": False,
            "statusCode": 500,
            'body': json.dumps({'errorType': 'InternalServerError', 'message':  "An unknown error has occurred. Please try again."}),
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                }
            }

lambda_handler = CreatePatientLambda.get_handler() 
