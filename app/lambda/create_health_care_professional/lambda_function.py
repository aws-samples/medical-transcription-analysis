import json
import uuid
import sys

sys.path.append("../")
# import boto3
from lambda_base import LambdaBase
from models import HealthCareProfessional


class CreateHealthCareProfessionalLambda(LambdaBase):
    def __init__(self): # implementation-specific args and/or kwargs
        pass

    def putItem(self, HealthCareProfessionalName):
        HealthCareProfessionalId = "h-"+uuid.uuid4().hex 
        info = {'HealthCareProfessionalId': HealthCareProfessionalId, 'HealthCareProfessionalName':  HealthCareProfessionalName}
        HealthCareProfessional().createHealthCareProfessional(info)
        return HealthCareProfessionalId
        # client = boto3.resource('dynamodb')
        # table = client.Table("HealthCareProfessionals")
        # HealthCareProfessionalId = "h-"+uuid.uuid4().hex 
        # table.put_item(Item= {'HealthCareProfessionalId': HealthCareProfessionalId,
        #                      'HealthCareProfessionalName':  HealthCareProfessionalName})
        # return HealthCareProfessionalId

    def handle(self, event, context):
        # return {
        #     "isBase64Encoded": False,
        #     "statusCode": 200,
        #     'body': json.dumps({}),
        #     "headers": {
        #         'Content-Type': 'application/json',
        #         'Access-Control-Allow-Origin': '*',
        #         'Access-Control-Allow-Headers': '*',
        #         'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        #     }
        # }
        # print("event: {}".format(event))
        try:
            name = event['HealthCareProfessionalName'] #need further discussion about json format in request
            id = self.putItem(name)
            result = {'HealthCareProfessionalId' : id}
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
