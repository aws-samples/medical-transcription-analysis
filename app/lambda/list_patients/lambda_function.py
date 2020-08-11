import json
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import Patient
from constant_variables import *
from response_helper import sendResponse

class ListPatientsLambda(LambdaBase):
    def __init__(self): 
        pass

    def getItems(self, Patientid):
        return Patient().requestPatients(Patientid)
        
    def handle(self, event, context):
        try:
            id = event["queryStringParameters"][DATASTORE_COLUMN_PATIENT_ID] if DATASTORE_COLUMN_PATIENT_ID in event["queryStringParameters"] else None  
            result = self.getItems(id)
            return sendResponse(200, result)
        except Exception as e:
            return sendResponse(500, {'message':  "An unknown error has occurred. Please try again."})


lambda_handler = ListPatientsLambda.get_handler() 