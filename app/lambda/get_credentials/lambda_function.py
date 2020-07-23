import os
import json
import sys

sys.path.append("../")
from lambda_base import LambdaBase
from helper import AwsHelper


class GetCredentialsLambda(LambdaBase):
    def __init__(self): # implementation-specific args and/or kwargs
        pass

    def handle(self, event, context):
        print("event: {}".format(event))
        sts = AwsHelper().getClient('sts')
        transcribeCredentials = sts.assume_role(
            RoleArn=os.environ['TRANSCRIBE_ACCESS_ROLEARN'],
            RoleSessionName="access_transcribe_role"
        )['Credentials']
        print(transcribeCredentials)
        result = {}
        result['accessKeyId'] = transcribeCredentials['AccessKeyId']
        result['secretAccessKey'] = transcribeCredentials['SecretAccessKey']
        result['sessionToken'] = transcribeCredentials['SessionToken']
        result['region'] = os.environ['AWS_REGION']
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

lambda_handler = GetCredentialsLambda.get_handler() # input values for args and/or kwargs
