import json
import uuid
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import HealthCareProfessional
from constant_variables import *

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
            id = self.putItem(name)
            result = {DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID : id}
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

lambda_handler = CreateHealthCareProfessionalLambda.get_handler() 
