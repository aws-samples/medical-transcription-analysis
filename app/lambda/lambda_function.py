import boto3
import os
import json

def lambda_handler(context, event):
    print("event: {}".format(event))
    sts = boto3.client('sts')
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
