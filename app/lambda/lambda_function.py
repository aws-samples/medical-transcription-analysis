# import boto3
# import os
# import json

# def lambda_handler(event, context):
#     print("event: {}".format(event))
#     sts = boto3.client('sts')
#     transcribeCredentials = sts.assume_role(
#         RoleArn=os.environ['TRANSCRIBE_ACCESS_ROLEARN'],
#         RoleSessionName="access_transcribe_role"
#     )['Credentials']
#     print(transcribeCredentials)
#     result = {}
#     result['accessKeyId'] = transcribeCredentials['AccessKeyId']
#     result['secretAccessKey'] = transcribeCredentials['SecretAccessKey']
#     result['sessionToken'] = transcribeCredentials['SessionToken']
#     result['region'] = os.environ['AWS_REGION']
#     return {
#         "isBase64Encoded": False,
#         "statusCode": 200,
#         'body': json.dumps(result),
#         "headers": {
#             'Content-Type': 'application/json',
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Headers': '*',
#             'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
#             }
#     }

import boto3
import os
import json
from get_credentials.lambda_function import GetCredentialsLambda
from create_health_care_professional.lambda_function import CreateHealthCareProfessionalLambda
from create_patient.lambda_function import CreatePatientLambda
from list_health_care_professionals.lambda_function import ListHealthCareProfessionalsLambda
from list_patients.lambda_function import ListPatientsLambda
from create_session.lambda_function import CreateSessionLambda
from list_sessions.lambda_function import ListSessionsLambda

def lambda_handler(event, context):
    if(event['resource'] == '/getCredentials'):
        return GetCredentialsLambda().handle(event,context)
    elif(event['resource'] == '/createHealthCareProfessional'):
        return CreateHealthCareProfessionalLambda().handle(event,context)
    elif(event['resource'] == '/createPatient'):
        return CreatePatientLambda().handle(event,context)
    elif(event['resource'] == '/listHealthCareProfessionals'):
        return ListHealthCareProfessionalsLambda().handle(event,context)
    elif(event['resource'] == '/listPatients'):
        return ListPatientsLambda().handle(event,context)
    elif(event['resource'] == '/createSession'):
        return CreateSessionLambda().handle(event,context)
    elif(event['resource'] == '/listSessions'):
        return ListSessionsLambda().handle(event,context)
    else:
        return GetCredentialsLambda().handle(event,context)