import json
import sys
import decimal

sys.path.append("../")
from lambda_base import LambdaBase
from models import Session

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return {
                "_type": "decimal",
                "value": str(obj)
            }
        return super(DecimalEncoder, self).default(obj)

class DecimalDecoder(json.JSONDecoder):
    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, obj):
        if '_type' not in obj:
            return obj
        type = obj['_type']
        if type == 'decimal':
            return decimal.Decimal(obj['value'])
        return obj

# encoded = json.dumps(input, cls=DecimalEncoder)
# decoded = json.loads(encoded, cls=DecimalDecoder)

class ListSessionsLambda(LambdaBase):
    def __init__(self): 
        pass

    def getItems(self, PatientId, HealthCareProfessionalId, SessionId):
        return Session().requestSession(PatientId, HealthCareProfessionalId, SessionId)
        # client = boto3.resource('dynamodb')
        # table = client.Table("Sessions")
        # response = {"Items": []}

        # # search by session id given patient id 
        # # search by session id given healthcare professional id
        # # search by patient id 
        # # search by health care professional id 

        # if PatientId and SessionId:
        #     response = table.query(KeyConditionExpression=Key('PatientId').eq(PatientId) & Key('SessionId').eq(SessionId))
        # elif HealthCareProfessionalId and SessionId:
        #     response = table.query(
        #         IndexName='hcpIndex',
        #         KeyConditionExpression=Key('HealthCareProfessionalId').eq(HealthCareProfessionalId) & Key('SessionId').eq(SessionId)
        #     )
        # elif PatientId:
        #     response = table.query(KeyConditionExpression=Key('PatientId').eq(PatientId))
        # elif HealthCareProfessionalId:
        #     response = table.query(
        #         IndexName='hcpIndex',
        #         KeyConditionExpression=Key('HealthCareProfessionalId').eq(HealthCareProfessionalId)
        #     )

        # return response["Items"]

    def handle(self, event, context):
        print("event: {}".format(event))
        PatientId = event['PatientId'] if 'PatientId' in event else None
        HealthCareProfessionalId = event['HealthCareProfessionalId'] if 'HealthCareProfessionalId' in event else None
        SessionId = event['SessionId'] if 'SessionId' in event else None
        result = self.getItems(PatientId, HealthCareProfessionalId, SessionId)
        return {
        "isBase64Encoded": False,
        "statusCode": 200,
        'body': json.dumps(result, cls=DecimalEncoder),
        "headers": {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            }
        }

lambda_handler = ListSessionsLambda.get_handler() 