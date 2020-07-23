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
    options = {'/getCredentials': GetCredentialsLambda(),
               '/createHealthCareProfessional': CreateHealthCareProfessionalLambda(),
               '/createPatient': CreatePatientLambda(),
               '/listHealthCareProfessionals': ListHealthCareProfessionalsLambda(),
               '/listPatients': ListPatientsLambda(),
               '/createSession': CreateSessionLambda(),
               '/listSessions': ListSessionsLambda()}
    if event['resource'] in options:
        return options[event['resource']].handle(event, context)
    else:
        raise Exception("operations not supported")
    # if(event['resource'] == '/getCredentials'):
    #     return GetCredentialsLambda().handle(event,context)
    # elif(event['resource'] == '/createHealthCareProfessional'):
    #     return CreateHealthCareProfessionalLambda().handle(event,context)
    # elif(event['resource'] == '/createPatient'):
    #     return CreatePatientLambda().handle(event,context)
    # elif(event['resource'] == '/listHealthCareProfessionals'):
    #     return ListHealthCareProfessionalsLambda().handle(event,context)
    # elif(event['resource'] == '/listPatients'):
    #     return ListPatientsLambda().handle(event,context)
    # elif(event['resource'] == '/createSession'):
    #     return CreateSessionLambda().handle(event,context)
    # elif(event['resource'] == '/listSessions'):
    #     return ListSessionsLambda().handle(event,context)
    # else:
    #     raise Exception("operation not supported")