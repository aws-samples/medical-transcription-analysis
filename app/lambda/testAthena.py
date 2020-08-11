import boto3
import json 
import time

client = boto3.client('athena', region_name='us-west-2')
queryString, resultConfiguration = '', {'OutputLocation' : 's3://mtastack-mtastackstorages3bucketc161f3b3-1tfncqzctldb1/public/output/',
                                        'EncryptionConfiguration' : { 'EncryptionOption': 'SSE_S3' }}
namedQueryIds = []
databaseName = 'mydatabase'
queryExecutionContext={
    'Database': databaseName,
}

# create database and delete database

def create_table():
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
                        LOCATION "s3://mtastack-mtastackstorages3bucketc161f3b3-1tfncqzctldb1/public/comprehend-medical-output/"'''
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def create_views():
    # create different views: Session, Medication, RXNorm, MedicationRxNorm, MedicalCondition, ICD10CMConcept, MedicalConditionICD10CMConcept, TestTreatmentProcedures
    queryString = '''CREATE OR REPLACE VIEW SessionView AS
                        SELECT 
                            Session.sessionId, 
                            Session.patientId, 
                            Session.healthCareProfessionalId,
                            Session.timeStampStart,
                            Session.timeStampEnd
                        FROM Comprehend;''' # Session
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW MedicationView AS
    #                     SELECT
    #                         m.medicationId,
    #                         m.sessionId,
    #                         m.medicationText,
    #                         m.medicationType
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(Medication) AS t(m);''' # Medication
    # client.start_query_execution(QueryString=queryString,QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW RxNormView AS
    #                     SELECT
    #                         Distinct r.code,
    #                         r.description
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(RxNorm) AS t(r);''' # RxNorm
    # client.start_query_execution(QueryString=queryString,QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW MedicationRxNormView AS
    #                     SELECT
    #                         m.medicationId,
    #                         m.code
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(MedicationRxNorm) AS t(m);''' # MedicationRxNorm
    # client.start_query_execution(QueryString=queryString,QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW MedicalConditionView AS
    #                     SELECT
    #                         m.medicalConditionId,
    #                         m.sessionId,
    #                         m.medicalConditionText
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(MedicalCondition) AS t(m);''' # MedicalCondition
    # client.start_query_execution(QueryString=queryString,QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW ICD10CMConceptView AS
    #                     SELECT
    #                         Distinct i.code,
    #                         i.description
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(ICD10CMConcept) AS t(i);''' # ICD10CMConceptView
    # client.start_query_execution(QueryString=queryString,QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW MedicalConditionICD10CMConceptView AS
    #                     SELECT
    #                         m.medicalconditionid,
    #                         m.code
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(MedicalConditionICD10CMConcept) AS t(m);''' # MedicalConditionICD10CMConceptView
    # client.start_query_execution(QueryString=queryString,QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)
    # queryString = '''CREATE OR REPLACE VIEW TestTreatmentProceduresView AS
    #                     SELECT
    #                         t.testTreatmentProcedureId,
    #                         t.sessionId,
    #                         t.testTreatmentProcedureText,
    #                         t.testTreatmentProcedureType
    #                     FROM Comprehend
    #                     CROSS JOIN UNNEST(TestTreatmentProcedures) AS t(t);''' # TestTreatmentProceduresView
    # client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def delete_views():
    # drop different views
    queryString = "DROP VIEW SessionView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicationView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW RxNormView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicationRxNormView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicalConditionView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW ICD10CMConceptView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW MedicalConditionICD10CMConceptView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)
    queryString = "DROP VIEW TestTreatmentProceduresView;"
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

def delete_table():
    # drop the table
    queryString = 'DROP TABLE Comprehend;'
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

def create_queries():
    database = 'default'

    description = 'Top 5 most frequent medical conditions assigned all time.'
    queryString = 'SELECT medicalConditionText, count(*) AS count FROM MedicalConditionView GROUP BY medicalConditionText ORDER BY count(*) DESC LIMIT 5;'
    namedQueryIds.append(client.create_named_query(Name='1',Database=database,Description=description,QueryString=queryString)['NamedQueryId'])

    description = 'Top 5 most frequent medications assigned all time.'
    queryString = 'SELECT medicationText, count(*) AS count FROM MedicationView GROUP BY medicationText ORDER BY count(*) DESC LIMIT 5;'
    namedQueryIds.append(client.create_named_query(Name='1',Database=database,Description=description,QueryString=queryString)['NamedQueryId'])

    description = 'Top 5 most frequent procedures assigned all time.'
    queryString = '''SELECT testTreatmentProcedureText, count(*) as count FROM TestTreatmentProceduresView WHERE testTreatmentProcedureType="PROCEDURE_NAME" GROUP BY testTreatmentProcedureText ORDER BY count(*) DESC LIMIT 5;'''
    namedQueryIds.append(client.create_named_query(Name='1',Database=database,Description=description,QueryString=queryString)['NamedQueryId'])

def delete_queries():
    for namedQueryId in namedQueryIds:
        client.delete_named_query(NamedQueryId=namedQueryId)

def on_create(event):
    create_table()
    create_views()
    # create_queries()
    
def on_delete(event):
    delete_views()
    delete_table()
    delete_queries()
    queryString = 'DROP DATABASE MyDatabase'
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

# event = {}
# on_create(event)
# on_delete(event)

def c():
    queryString = 'CREATE DATABASE IF NOT EXISTS ' + databaseName
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

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
                        LOCATION "s3://mtastack-mtastackstorages3bucketc161f3b3-1tfncqzctldb1/public/comprehend-medical-output/"'''
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

    queryString = '''CREATE OR REPLACE VIEW SessionView AS
                            SELECT 
                                Session.sessionId, 
                                Session.patientId, 
                                Session.healthCareProfessionalId,
                                Session.timeStampStart,
                                Session.timeStampEnd
                            FROM Comprehend;''' # Session
    print(queryExecutionContext)
    response1 = client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

def d():
    queryString = "DROP VIEW SessionView;"
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

    queryString = 'DROP TABLE Comprehend;'
    client.start_query_execution(QueryString=queryString, QueryExecutionContext=queryExecutionContext, ResultConfiguration=resultConfiguration)

    queryString = 'DROP DATABASE MyDatabase'
    client.start_query_execution(QueryString=queryString, ResultConfiguration=resultConfiguration)

# on_delete({})
# while True:
#     time.sleep(1)
#     response_2 = client.get_query_execution(
#         QueryExecutionId=query_execution_id
#     )
#     query_status = response_2['QueryExecution']['Status']
#     print(query_status)
#     if query_status not in ["QUEUED", "RUNNING", "CANCELLED"]:
#         break

c()
# d()