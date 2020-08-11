import json
import boto3 
import os

def lambda_handler(event, context):
  print("event: {}".format(event))
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event)
  if request_type == 'Update': return on_update(event)
  if request_type == 'Delete': return on_delete(event)
  raise Exception("Invalid request type: %s" % request_type)

def on_create(event):
    client = boto3.client('s3', region_name=os.environ['AWS_REGION'])
    client.put_object(Bucket=os.environ['BUCKET_NAME'], Key='public/output/')
    client.put_object(Bucket=os.environ['BUCKET_NAME'], Key='public/comprehend-medical-output/')

    client = boto3.client('athena', region_name=os.environ['AWS_REGION'])
    databaseName = 'mydatabase'
    queryExecutionContext= {'Database': databaseName}
    resultConfiguration = {'OutputLocation' : 's3://'+os.environ['BUCKET_NAME']+'/public/output/',
                           'EncryptionConfiguration' : { 'EncryptionOption': 'SSE_S3' }}
    namedQueryIds = []

    print('CREATING DATABASE TABLE AND VIEWS AND QUERIES')
    create_database(client, databaseName, resultConfiguration)
    create_table(client, queryExecutionContext, resultConfiguration)
    create_views(client, queryExecutionContext, resultConfiguration)
    create_queries(client, databaseName, resultConfiguration, namedQueryIds)

    return {'NamedQueryIds': namedQueryIds}

def on_update(event):
    pass 

def on_delete(event):
    client = boto3.client('athena', region_name=os.environ['AWS_REGION'])
    databaseName = 'mydatabase'
    queryExecutionContext= {'Database': databaseName}
    resultConfiguration = {'OutputLocation' : 's3://'+os.environ['BUCKET_NAME']+'/public/output/',
                           'EncryptionConfiguration' : { 'EncryptionOption': 'SSE_S3' }}
    namedQueryIds = event['NamedQueryIds']
    
    delete_queries(client, namedQueryIds)
    delete_views(client, queryExecutionContext, resultConfiguration)
    delete_table(client, queryExecutionContext, resultConfiguration)
    delete_database(client, databaseName, resultConfiguration)

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
    # create different views: Session, Medication, RXNorm, MedicationRxNorm, MedicalCondition, ICD10CMConcept, MedicalConditionICD10CMConcept, TestTreatmentProcedures
    queryString = '''CREATE OR REPLACE VIEW SessionView AS
                        SELECT 
                            Session.sessionId, 
                            Session.patientId, 
                            Session.healthCareProfessionalId,
                            Session.timeStampStart,
                            Session.timeStampEnd
                        FROM Comprehend;''' # Session
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW MedicationView AS
                        SELECT
                            m.medicationId,
                            m.sessionId,
                            m.medicationText,
                            m.medicationType
                        FROM Comprehend
                        CROSS JOIN UNNEST(Medication) AS t(m);''' # Medication
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW RxNormView AS
                        SELECT
                            Distinct r.code,
                            r.description
                        FROM Comprehend
                        CROSS JOIN UNNEST(RxNorm) AS t(r);''' # RxNorm
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW MedicationRxNormView AS
                        SELECT
                            m.medicationId,
                            m.code
                        FROM Comprehend
                        CROSS JOIN UNNEST(MedicationRxNorm) AS t(m);''' # MedicationRxNorm
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW MedicalConditionView AS
                        SELECT
                            m.medicalConditionId,
                            m.sessionId,
                            m.medicalConditionText
                        FROM Comprehend
                        CROSS JOIN UNNEST(MedicalCondition) AS t(m);''' # MedicalCondition
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW ICD10CMConceptView AS
                        SELECT
                            Distinct i.code,
                            i.description
                        FROM Comprehend
                        CROSS JOIN UNNEST(ICD10CMConcept) AS t(i);''' # ICD10CMConceptView
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW MedicalConditionICD10CMConceptView AS
                        SELECT
                            m.medicalconditionid,
                            m.code
                        FROM Comprehend
                        CROSS JOIN UNNEST(MedicalConditionICD10CMConcept) AS t(m);''' # MedicalConditionICD10CMConceptView
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
    queryString = '''CREATE OR REPLACE VIEW TestTreatmentProceduresView AS
                        SELECT
                            t.testTreatmentProcedureId,
                            t.sessionId,
                            t.testTreatmentProcedureText,
                            t.testTreatmentProcedureType
                        FROM Comprehend
                        CROSS JOIN UNNEST(TestTreatmentProcedures) AS t(t);''' # TestTreatmentProceduresView
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    
def delete_views(client, queryExecutionContext, resultConfiguration):
    # drop different views
    queryString = "DROP VIEW SessionView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicationView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW RxNormView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicationRxNormView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicalConditionView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW ICD10CMConceptView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicalConditionICD10CMConceptView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW TestTreatmentProceduresView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def delete_table(client, queryExecutionContext, resultConfiguration):
    # drop the table
    queryString = 'DROP TABLE Comprehend;'
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def create_queries(client, database, resultConfiguration, namedQueryIds):
    description = 'Top 5 most frequent medical conditions assigned all time.'
    queryString = 'SELECT medicalConditionText, count(*) AS count FROM MedicalConditionView GROUP BY medicalConditionText ORDER BY count(*) DESC LIMIT 5;'
    namedQueryIds.append(client.create_named_query(Name='1',Database=database,Description=description,QueryString=queryString)['NamedQueryId'])

    description = 'Top 5 most frequent medications assigned all time.'
    queryString = 'SELECT medicationText, count(*) AS count FROM MedicationView GROUP BY medicationText ORDER BY count(*) DESC LIMIT 5;'
    namedQueryIds.append(client.create_named_query(Name='1',Database=database,Description=description,QueryString=queryString)['NamedQueryId'])

    description = 'Top 5 most frequent procedures assigned all time.'
    queryString = '''SELECT testTreatmentProcedureText, count(*) as count FROM TestTreatmentProceduresView WHERE testTreatmentProcedureType="PROCEDURE_NAME" GROUP BY testTreatmentProcedureText ORDER BY count(*) DESC LIMIT 5;'''
    namedQueryIds.append(client.create_named_query(Name='1',Database=database,Description=description,QueryString=queryString)['NamedQueryId'])

def delete_queries(client, namedQueryIds):
    for namedQueryId in namedQueryIds:
        client.delete_named_query(NamedQueryId=namedQueryId)

# event = {}
# event = on_create({})
# on_delete(event)
