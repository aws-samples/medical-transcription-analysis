import json
import sys

sys.path.append("../")
# import boto3
# from boto3.dynamodb.conditions import Key
from lambda_base import LambdaBase
from models import Patient


class ListPatientsLambda(LambdaBase):
    def __init__(self): 
        pass

    def getItems(self, Patientid):
        return Patient().requestPatients(Patientid)
        # client = boto3.resource('dynamodb')
        # table = client.Table("Patients")
        # response = None
        # if Patientid == '':
        #     response = table.scan()
        # else:
        #     response = table.query(KeyConditionExpression=Key('PatientId').eq(Patientid))
        # return response["Items"]
        

    def handle(self, event, context):
        try:
            id = event['PatientId'] if 'PatientId' in event else None  
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