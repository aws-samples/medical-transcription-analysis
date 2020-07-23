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
        raise Exception("operation not supported")
    
