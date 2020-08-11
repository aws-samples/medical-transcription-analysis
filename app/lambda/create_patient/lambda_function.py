import json
import uuid
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import Patient
from constant_variables import *
from response_helper import sendResponse

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
            if name is None or name.strip() == '':
                return sendResponse(400, {'message': DATASTORE_COLUMN_PATIENT_NAME + ' should not be empty.'})
            id = self.putItem(name.strip())
            result = {DATASTORE_COLUMN_PATIENT_ID : id}
            return sendResponse(200, result)
        except Exception as e:
            return sendResponse(500, {'message':  "An unknown error has occurred. Please try again."})


lambda_handler = CreatePatientLambda.get_handler() 
