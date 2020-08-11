import sys
sys.path.append("../lambda/")
import unittest
import boto3
from moto import mock_dynamodb2
from datastore import DataStore
from models import *
from constant_variables import *
from data.test_constants import *

class TestModel(unittest.TestCase):
    @mock_dynamodb2 
    def create_dyanamodb(self):
        dynamodb = boto3.resource('dynamodb', 'us-west-2')
        return dynamodb

    @mock_dynamodb2 
    def create_patient_table(self):
        dynamodb = self.create_dyanamodb()
        table = dynamodb.create_table(
            TableName='Patients',
            KeySchema=[{'AttributeName': 'PatientId', 'KeyType': 'HASH'},],
            AttributeDefinitions=[{'AttributeName': 'PatientId', 'AttributeType': 'S'},],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        return table

    @mock_dynamodb2 
    def create_health_care_professional_table(self):
        dynamodb = self.create_dyanamodb()
        table = dynamodb.create_table(
            TableName='HealthCareProfessionals',
            KeySchema=[{'AttributeName': 'HealthCareProfessionalId', 'KeyType': 'HASH'},],
            AttributeDefinitions=[{'AttributeName': 'HealthCareProfessionalId', 'AttributeType': 'S'},],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        return table

    @mock_dynamodb2 
    def create_session_table(self):
        dynamodb = self.create_dyanamodb()
        table = dynamodb.create_table(
            TableName='Sessions',
            KeySchema=[{'AttributeName': 'PatientId', 'KeyType': 'HASH'},{'AttributeName': 'SessionId', 'KeyType': 'RANGE'}],
            AttributeDefinitions=[{'AttributeName': 'PatientId', 'AttributeType': 'S'},{'AttributeName': 'SessionId', 'AttributeType': 'S'}],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        return table

    @mock_dynamodb2 
    def test_patient_create_patient(self):
        table = self.create_patient_table()
        p = Patient()
        response = p.createPatient(PATIENT_INFO_1)
        self.assertEqual(response['status'], 'OK')
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_PATIENT_NAME],'p1')

    @mock_dynamodb2 
    def test_patient_create_patient_multiple(self):
        table = self.create_patient_table()
        p = Patient()
        response = p.createPatient(PATIENT_INFO_1)
        self.assertEqual(response['status'], 'OK')
        response = p.createPatient(PATIENT_INFO_2)
        self.assertEqual(response['status'], 'OK')
        response = p.createPatient(PATIENT_INFO_3)
        self.assertEqual(response['status'], 'OK')
        response = table.scan()
        self.assertEqual(len(response['Items']),3)

    @mock_dynamodb2 
    def test_patient_create_patient_empty(self):
        table = self.create_patient_table()
        p = Patient()
        response = p.createPatient(PATIENT_INFO_EMPTY)
        self.assertEqual(response['status'], 'BAD')

    @mock_dynamodb2 
    def test_patient_create_patient_conflict(self):
        table = self.create_patient_table()
        p = Patient()
        response = p.createPatient(PATIENT_INFO_1)
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_PATIENT_NAME],'p1')
        response = p.createPatient(PATIENT_INFO_1_SAMEKEY)
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_PATIENT_NAME],'pConflict')

    @mock_dynamodb2 
    def test_patient_request_patient(self):
        table = self.create_patient_table()
        p = Patient()
        p.createPatient(PATIENT_INFO_1)
        response = p.requestPatients('p-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_NAME],'p1')

    @mock_dynamodb2 
    def test_patient_request_patient_multiple(self):
        table = self.create_patient_table()
        p = Patient()
        p.createPatient(PATIENT_INFO_1)
        p.createPatient(PATIENT_INFO_2)
        p.createPatient(PATIENT_INFO_3)
        response = p.requestPatients('p-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_NAME],'p1')
        response = p.requestPatients('p-2')
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_NAME],'p2')
        response = p.requestPatients('p-3')
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_NAME],'p3')

    @mock_dynamodb2 
    def test_patient_request_patient_empty(self):
        table = self.create_patient_table()
        p = Patient()
        response = p.requestPatients('p-1')
        self.assertEqual(len(response), 0)
        p.createPatient(PATIENT_INFO_1)
        response = p.requestPatients('p-2')
        self.assertEqual(len(response), 0)
        response = p.requestPatients('p-3')
        self.assertEqual(len(response), 0)

    @mock_dynamodb2 
    def test_hcp_create_hcp(self):
        table = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1)
        self.assertEqual(response['status'], 'OK')
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'h1')

    @mock_dynamodb2 
    def test_hcp_create_hcp_multiple(self):
        table = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1)
        self.assertEqual(response['status'], 'OK')
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_2)
        self.assertEqual(response['status'], 'OK')
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_3)
        self.assertEqual(response['status'], 'OK')
        response = table.scan()
        self.assertEqual(len(response['Items']),3)

    @mock_dynamodb2 
    def test_hcp_create_hcp_empty(self):
        table = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_EMPTY)
        self.assertEqual(response['status'], 'BAD')

    @mock_dynamodb2 
    def test_hcp_create_hcp_conflict(self):
        table = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1)
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'h1')
        response = hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1_SAMEKEY)
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'hConflict')

    @mock_dynamodb2 
    def test_hcp_request_hcp(self):
        table = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1)
        response = hp.requestHealthCareProfessionals('h-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'h1')

    @mock_dynamodb2 
    def test_hcp_request_hcp_multiple(self):
        table = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1)
        hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_2)
        hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_3)
        response = hp.requestHealthCareProfessionals('h-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'h1')
        response = hp.requestHealthCareProfessionals('h-2')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'h2')
        response = hp.requestHealthCareProfessionals('h-3')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_NAME],'h3')

    @mock_dynamodb2 
    def test_hcp_request_hcp_empty(self):
        able = self.create_health_care_professional_table()
        hp = HealthCareProfessional()
        response = hp.requestHealthCareProfessionals('h-1')
        self.assertEqual(len(response), 0)
        hp.createHealthCareProfessional(HEALTH_CARE_PROFESSIONAL_INFO_1)
        response = hp.requestHealthCareProfessionals('h-2')
        self.assertEqual(len(response), 0)
        response = hp.requestHealthCareProfessionals('h-3')
        self.assertEqual(len(response), 0)

    @mock_dynamodb2 
    def test_session_create_session(self):
        table = self.create_session_table()
        s = Session()
        response = s.createSession(SESSION_INFO_1)
        self.assertEqual(response['status'], 'OK')
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_SESSION_NAME],'SessionName')

    @mock_dynamodb2 
    def test_session_create_session_multiple(self):
        table = self.create_session_table()
        s = Session()
        response = s.createSession(SESSION_INFO_1)
        self.assertEqual(response['status'], 'OK')
        response = s.createSession(SESSION_INFO_2)
        self.assertEqual(response['status'], 'OK')
        response = s.createSession(SESSION_INFO_3)
        self.assertEqual(response['status'], 'OK')
        response = table.scan()
        self.assertEqual(len(response['Items']),3)

    @mock_dynamodb2 
    def test_session_create_session_conflict(self):
        table = self.create_session_table()
        s = Session()
        response = s.createSession(SESSION_INFO_1)
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_SESSION_NAME],'SessionName')
        response = s.createSession(SESSION_INFO_1_SAMEKEY)
        response = table.scan()
        self.assertEqual(response['Items'][0][DATASTORE_COLUMN_SESSION_NAME],'NO')

    @mock_dynamodb2 
    def test_session_create_session_empty(self):
        table = self.create_session_table()
        s = Session()
        response = s.createSession(SESSION_INFO_EMPTY)
        self.assertEqual(response['status'], 'BAD')

    @mock_dynamodb2 
    def test_session_request_session(self):
        table = self.create_session_table()
        s = Session()
        response = s.createSession(SESSION_INFO_1)
        response = s.requestSession('p-1', None, None)
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_ID],'p-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_SESSION_ID],'s-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID],'h-1')

    @mock_dynamodb2 
    def test_session_request_session_multiple(self):
        table = self.create_session_table()
        s = Session()
        s.createSession(SESSION_INFO_1)
        s.createSession(SESSION_INFO_2)
        s.createSession(SESSION_INFO_3)
        response = s.requestSession('p-1', None, None)
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_ID],'p-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_SESSION_ID],'s-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID],'h-1')
        response = s.requestSession('p-1', 's-1', None)
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_ID],'p-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_SESSION_ID],'s-1')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID],'h-1')
        response = s.requestSession('p-2', None, None)
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_ID],'p-2')
        self.assertEqual(response[0][DATASTORE_COLUMN_SESSION_ID],'s-2')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID],'h-2')
        response = s.requestSession('p-3', None, None)
        self.assertEqual(response[0][DATASTORE_COLUMN_PATIENT_ID],'p-3')
        self.assertEqual(response[0][DATASTORE_COLUMN_SESSION_ID],'s-3')
        self.assertEqual(response[0][DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID],'h-3')

    @mock_dynamodb2 
    def test_session_request_session_empty(self):
        table = self.create_session_table()
        s = Session()
        response = s.requestSession('p-1', None, None)
        self.assertEqual(len(response), 0)
        response = s.requestSession('p-1', 's-1', None)
        self.assertEqual(len(response), 0)
        s.createSession(SESSION_INFO_1)
        response = s.requestSession('p-1', 's-2', None)
        self.assertEqual(len(response), 0)
        response = s.requestSession('p-2', 's-1', None)
        self.assertEqual(len(response), 0)
        response = s.requestSession('p-2', None, None)
        self.assertEqual(len(response), 0)
        response = s.requestSession(None, 's-2', None)
        self.assertTrue('status' in response)
        self.assertEqual(response['status'], 'BAD')

if __name__ == '__main__':
    unittest.main()