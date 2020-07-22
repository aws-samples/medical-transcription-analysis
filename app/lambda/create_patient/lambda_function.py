import json
import uuid
import sys

sys.path.append("../")
# import boto3
from lambda_base import LambdaBase
from models import Patient

class CreatePatientLambda(LambdaBase):
    def __init__(self): 
        pass

    def putItem(self, PatientName):
        PatientId = "p-"+uuid.uuid4().hex
        info = {'PatientId': PatientId, 'PatientName':  PatientName}
        Patient().createPatient(info)
        return PatientId
        # client = boto3.resource('dynamodb')
        # table = client.Table("Patients")
        # PatientId = "p-"+uuid.uuid4().hex 
        # table.put_item(Item= {'PatientId': PatientId,
        #                      'PatientName':  PatientName})
        # return PatientId

    def handle(self, event, context):
        try:
            name = event['PatientName'] #need further discussion about json format in request
            id = self.putItem(name)
            result = {'PatientId' : id}
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

lambda_handler = CreatePatientLambda.get_handler() 
