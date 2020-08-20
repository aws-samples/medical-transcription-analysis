import json
import boto3 
import os
import time

WORK_GROUP_NAME = 'MTAWorkGroup'
DATABASE_NAME = 'mtadatabase'
QUERY_EXECUTION_CONTEXT= {'Database': DATABASE_NAME}
RESULT_CONFIGURATION = {'OutputLocation' : 's3://'+os.environ['BUCKET_NAME']+'/public/athena-output/','EncryptionConfiguration' : { 'EncryptionOption': 'SSE_S3' }}

def lambda_handler(event, context):
  print("event: {}".format(event))
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event)
  if request_type == 'Update': return on_update(event)
  if request_type == 'Delete': return on_delete(event)
  raise Exception("Invalid request type: %s" % request_type)

def on_create(event):
    client = boto3.client('s3', region_name=os.environ['AWS_REGION'])
    client.put_object(Bucket=os.environ['BUCKET_NAME'], Key='public/athena-output/')
    client.put_object(Bucket=os.environ['BUCKET_NAME'], Key='public/comprehend-medical-output/') 

    client = boto3.client('athena', region_name=os.environ['AWS_REGION'])
    
    namedQueryIds = []

    create_work_group(client, RESULT_CONFIGURATION)
    create_database(client, DATABASE_NAME, RESULT_CONFIGURATION)
    create_table(client, QUERY_EXECUTION_CONTEXT, RESULT_CONFIGURATION)
    time.sleep(2)
    create_views(client, QUERY_EXECUTION_CONTEXT, RESULT_CONFIGURATION)
    create_queries(client, DATABASE_NAME, RESULT_CONFIGURATION, namedQueryIds)

    return {'NamedQueryIds': namedQueryIds}

def on_update(event):
    pass 

def on_delete(event):
    client = boto3.client('athena', region_name=os.environ['AWS_REGION'])
   
    delete_views(client, QUERY_EXECUTION_CONTEXT, RESULT_CONFIGURATION)
    delete_table(client, QUERY_EXECUTION_CONTEXT, RESULT_CONFIGURATION)
    delete_database(client, DATABASE_NAME, RESULT_CONFIGURATION)
    delete_work_group_and_queries(client, RESULT_CONFIGURATION)

def create_work_group(client, resultConfiguration):
    client.create_work_group(Name=WORK_GROUP_NAME,Configuration={'ResultConfiguration': resultConfiguration})

def create_database(client, databaseName, resultConfiguration):
    queryString = 'CREATE DATABASE IF NOT EXISTS ' + databaseName
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

def delete_database(client, databaseName, resultConfiguration):
    queryString = 'DROP DATABASE ' + databaseName
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

def create_table(client, queryExecutionContext, resultConfiguration):
    # create the big table
    queryString = '''CREATE EXTERNAL TABLE IF NOT EXISTS Comprehend ( 
                        Session struct<sessionId: string,
                                        patientId: string,
                                        healthCareProfessionalId: string,
                                        timeStampStart: bigint,
                                        timeStampEnd: bigint>,
                        Medication array<
                                struct<medicationId: string,
                                    sessionId: string,
                                    medicationText: string,
                                    medicationType: string>>,
                        RXNorm array<struct<code: bigint, description: string>>,
                        MedicationRxNorm array<struct<medicationId: string, code: bigint>>,
                        MedicalCondition array<
                                        struct<medicalConditionId: string, 
                                                sessionId: string, 
                                                medicalConditionText: string>>,
                        ICD10CMConcept array<struct<code: string, description: string>>,
                        MedicalConditionICD10CMConcept array<struct<medicalConditionId: string, code: string>>,
                        TestTreatmentProcedures array<
                                                struct<testTreatmentProcedureId: string,
                                                        sessionId: string,
                                                        testTreatmentProcedureText: string,
                                                        testTreatmentProcedureType: string>>
                        
                        )
                        ROW FORMAT SERDE "org.openx.data.jsonserde.JsonSerDe"
                        LOCATION "s3://'''+ os.environ['BUCKET_NAME'] + '''/public/comprehend-medical-output/"'''
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def create_views(client, queryExecutionContext, resultConfiguration):
    with open('queries/createViewQueries.json') as json_file:
        queries = json.load(json_file)['queries']
        for queryString in queries:
            client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
            time.sleep(2) # to avoid throttling
   
def delete_views(client, queryExecutionContext, resultConfiguration):
    with open('queries/deleteViewQueries.json') as json_file:
        queries = json.load(json_file)['queries']
        for queryString in queries:
            client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
            time.sleep(2) # to avoid throttling

def delete_table(client, queryExecutionContext, resultConfiguration):
    queryString = 'DROP TABLE Comprehend;'
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def create_queries(client, database, resultConfiguration, namedQueryIds):
    with open('queries/createNamedQueries.json') as json_file:
        queries = json.load(json_file)['queries']
        for query in queries:
            client.create_named_query(Name=query['name'],Database=database,Description=query['description'],QueryString=query['queryString'],WorkGroup=WORK_GROUP_NAME)
    
def list_queries(client):
    response = client.list_named_queries(WorkGroup=WORK_GROUP_NAME)
    return response['NamedQueryIds']
    
def delete_queries(client, namedQueryIds):
    for namedQueryId in namedQueryIds:
        client.delete_named_query(NamedQueryId=namedQueryId)

def delete_work_group_and_queries(client, resultConfiguration):
    client.delete_work_group(WorkGroup=WORK_GROUP_NAME,RecursiveDeleteOption=True)


