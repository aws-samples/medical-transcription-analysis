import json
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from models import HealthCareProfessional
from constant_variables import *

class ListHealthCareProfessionalsLambda(LambdaBase):
    def __init__(self): 
        pass

    def getItems(self, HealthCareProfessionalid):
        return HealthCareProfessional().requestHealthCareProfessionals(HealthCareProfessionalid)

    def handle(self, event, context):
        try:
            id = event[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID] if DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID in event else None  
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

lambda_handler = ListHealthCareProfessionalsLambda.get_handler()