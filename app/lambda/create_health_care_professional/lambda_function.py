import json
import uuid
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import HealthCareProfessional
from constant_variables import *
from response_helper import sendResponse

class CreateHealthCareProfessionalLambda(LambdaBase):
    def __init__(self): 
        pass

    def putItem(self, HealthCareProfessionalName):
        HealthCareProfessionalId = "h-"+uuid.uuid4().hex 
        info = {DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: HealthCareProfessionalId, DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME:  HealthCareProfessionalName}
        HealthCareProfessional().createHealthCareProfessional(info)
        return HealthCareProfessionalId

    def handle(self, event, context):
        try:
            name = event["queryStringParameters"][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME] if DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME in event["queryStringParameters"] else None
            if name is None or name.strip() == '':
                return sendResponse(400, {'message': DATASTORE_COLUMN_PROFESSSIONAL_NAME + ' should not be empty.'})
            id = self.putItem(name.strip())
            result = {DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID : id}
            return sendResponse(200, result)
        except Exception as e:
            print(str(e))
            return sendResponse(500, {'message':  "An unknown error has occurred. Please try again."})

lambda_handler = CreateHealthCareProfessionalLambda.get_handler() 
