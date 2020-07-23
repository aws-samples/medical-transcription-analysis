import json
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import Patient
from constant_variables import *

class ListPatientsLambda(LambdaBase):
    def __init__(self): 
        pass

    def getItems(self, Patientid):
        return Patient().requestPatients(Patientid)
        
    def handle(self, event, context):
        try:
            id = event[DATASTORE_COLUMN_PATIENT_ID] if DATASTORE_COLUMN_PATIENT_ID in event else None  
            result = self.getItems(id)
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


lambda_handler = ListPatientsLambda.get_handler() 