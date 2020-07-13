from LambdaBase import LambdaBase
import json

class CreateHealthCareProLambda(LambdaBase):
    def __init__(self): # implementation-specific args and/or kwargs
        pass

    def handle(self, event, context):
        print("event: {}".format(event))
        result = {"hello" : "world"}
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

lambda_handler = CreateHealthCareProLambda.get_handler() # input values for args and/or kwargs