import sys
sys.path.append("../lambda/")
import unittest
import boto3
from moto import mock_dynamodb2
from datastore import DataStore
from constant_variables import *

class TestDynamo(unittest.TestCase):
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
    def test_save_patient(self):
        # test common save
        tableName,patientId,patientName,patientIdVal,patientNameVal='Patients','PatientId','PatientName','p-1','Hello'
        table = self.create_patient_table()
        d = DataStore('dynamodb', tableName, patientId)
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        item = items[0] if items else None
        self.assertTrue(patientIdVal in item[patientId])
        self.assertEqual(item[patientName], patientNameVal)

        # test save none value
        patientIdVal, patientNameVal = 'p-2', None
        response = d.save({patientId : patientIdVal, patientName : patientNameVal}, 'us-west-2')
        self.assertEqual('PatientName should not be empty.', response['error'])
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        for item in items:
            self.assertTrue(patientIdVal not in item[patientId])

        # test save empty value
        patientIdVal, patientNameVal = 'p-3', ''
        response = d.save({patientId : patientIdVal, patientName : patientNameVal}, 'us-west-2')
        self.assertEqual('PatientName should not be empty.', response['error'])
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        for item in items:
            self.assertTrue(patientIdVal not in item[patientId])

    @mock_dynamodb2
    def test_save_session(self):
         # test common save
        tableName = 'Sessions'
        table = self.create_session_table()
        d = DataStore('dynamodb', tableName, 'PatientId', 'SessionId')
        info = {DATASTORE_COLUMN_SESSION_ID : 's-1',
                DATASTORE_COLUMN_PATIENT_ID: 'p-1',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-1',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        response = d.save(info, 'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        item = items[0] if items else None
        self.assertTrue('ComprehendS3Path' in item[DATASTORE_COLUMN_COMPREHEND_S3_PATH])
        self.assertEqual('p-1', item[DATASTORE_COLUMN_PATIENT_ID])

        # test save none value
        info[DATASTORE_COLUMN_PATIENT_ID] = 'p-2'
        info[DATASTORE_COLUMN_COMPREHEND_S3_PATH] = ''
        response = d.save(info, 'us-west-2')
        self.assertEqual('BAD', response['status'])
        self.assertEqual('ComprehendS3Path should not be empty.', response['error'])
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        for item in items:
            self.assertTrue('p-2' not in item[DATASTORE_COLUMN_PATIENT_ID])

        # test save empty value
        info[DATASTORE_COLUMN_PATIENT_ID] = 'p-3'
        info[DATASTORE_COLUMN_COMPREHEND_S3_PATH] = None
        response = d.save(info, 'us-west-2')
        self.assertEqual('BAD', response['status'])
        self.assertEqual('ComprehendS3Path should not be empty.', response['error'])
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        for item in items:
            self.assertTrue('p-3' not in item[DATASTORE_COLUMN_PATIENT_ID])

        # tableName,healthCareProfessionalId,healthCareProfessionalName,healthCareProfessionalIdVal,healthCareProfessionalNameVal='HealthCareProfessionals','HealthCareProfessionalId','HealthCareProfessionalName','h-3e3477c37d674ecc98e3cdf5487ee07b','World'
        # table = self.create_health_care_professional_table()
        # d = DataStore('dynamodb', tableName, healthCareProfessionalId)
        # d.save({healthCareProfessionalId: healthCareProfessionalIdVal, healthCareProfessionalName: healthCareProfessionalNameVal},'us-west-2')
        # response = table.scan()
        # items = response['Items'] if 'Items' in response else {}
        # item = items[0] if items else None
        # self.assertTrue(healthCareProfessionalIdVal in item[healthCareProfessionalId])
        # self.assertEquals(item[healthCareProfessionalName], healthCareProfessionalNameVal)

    @mock_dynamodb2
    def test_list_items_sessions(self):
        table = self.create_session_table()
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 0)


        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        info = {DATASTORE_COLUMN_SESSION_ID : 's-1',
                DATASTORE_COLUMN_PATIENT_ID: 'p-1',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-1',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        response = d.save(info, 'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 1)
        for item in items:
            if 's-1' in item[DATASTORE_COLUMN_SESSION_ID]:
                self.assertEquals('p-1', item[DATASTORE_COLUMN_PATIENT_ID])

        info = {DATASTORE_COLUMN_SESSION_ID : 's-2',
                DATASTORE_COLUMN_PATIENT_ID: 'p-2',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-2',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        response = d.save(info, 'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 2)
        for item in items:
            if 's-2' in item[DATASTORE_COLUMN_SESSION_ID]:
                self.assertEquals('p-2', item[DATASTORE_COLUMN_PATIENT_ID])

        info = {DATASTORE_COLUMN_SESSION_ID : 's-3',
                DATASTORE_COLUMN_PATIENT_ID: 'p-3',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-3',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        response = d.save(info, 'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 3)
        for item in items:
            if 's-3' in item[DATASTORE_COLUMN_SESSION_ID]:
                self.assertEquals('p-3', item[DATASTORE_COLUMN_PATIENT_ID])

    @mock_dynamodb2
    def test_list_items_patients(self):
        table = self.create_patient_table()

        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 0)

        tableName,patientId,patientName,patientIdVal,patientNameVal='Patients','PatientId','PatientName','p-3e3477c37d674ecc98e3cdf5487ee07a','p1'
        d = DataStore('dynamodb', tableName, patientId)
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 1)
        for item in items:
            if patientIdVal in item[patientId]:
                self.assertEquals('p1', item[patientName])


        patientIdVal,patientNameVal='p-3e3477c37d674ecc98e3cdf5487ee07b','p2'
        d = DataStore('dynamodb', tableName, patientId)
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 2)
        for item in items:
            if patientIdVal in item[patientId]:
                self.assertEquals('p2', item[patientName])

        patientIdVal,patientNameVal='p-3e3477c37d674ecc98e3cdf5487ee07c','p3'
        d = DataStore('dynamodb', tableName, patientId)
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        self.assertEquals(len(items), 3)
        for item in items:
            if patientIdVal in item[patientId]:
               self. assertEquals('p3', item[patientName])

    @mock_dynamodb2
    def test_query_by_partition_key_sessions(self):
        tableName = 'Sessions'
        table = self.create_session_table()
        d = DataStore('dynamodb', tableName, 'PatientId', 'SessionId')
        info = {DATASTORE_COLUMN_SESSION_ID : 's-1',
                DATASTORE_COLUMN_PATIENT_ID: 'p-1',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-1',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        d.save(info, 'us-west-2')

        info = {DATASTORE_COLUMN_SESSION_ID : 's-2',
                DATASTORE_COLUMN_PATIENT_ID: 'p-2',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-2',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        d.save(info, 'us-west-2')

        info = {DATASTORE_COLUMN_SESSION_ID : 's-3',
                DATASTORE_COLUMN_PATIENT_ID: 'p-3',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-3',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        d.save(info, 'us-west-2')
        
        # test querying existed
        response = d.queryByPartitionKey('p-1', 'us-west-2')
        for dict in response:
            if 'p-1' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('s-1', dict[DATASTORE_COLUMN_SESSION_ID])
        response = d.queryByPartitionKey('p-2', 'us-west-2')
        for dict in response:
            if 'p-2' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('s-2', dict[DATASTORE_COLUMN_SESSION_ID])
        response = d.queryByPartitionKey('p-3', 'us-west-2')
        for dict in response:
            if 'p-3' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('s-3', dict[DATASTORE_COLUMN_SESSION_ID])

        # test querying unexisted
        response = d.queryByPartitionKey('p-0', 'us-west-2')
        self.assertEqual(len(response),0)

        response = d.queryByPartitionKey('p-5', 'us-west-2')
        self.assertEqual(len(response),0)

    @mock_dynamodb2
    def test_query_by_partition_key_patients(self):
        table = self.create_patient_table()

        tableName,patientId,patientName,patientIdVal,patientNameVal='Patients','PatientId','PatientName','p-1','p1'
        d = DataStore('dynamodb', tableName, patientId)
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
       
        patientIdVal,patientNameVal='p-2','p2'
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')

        patientIdVal,patientNameVal='p-3','p3'
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')

        # test querying existed
        response = d.queryByPartitionKey('p-1', 'us-west-2')
        for dict in response:
            if 'p-1' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('p1', dict[patientName])
        response = d.queryByPartitionKey('p-2', 'us-west-2')
        for dict in response:
            if 'p-2' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('p2', dict[patientName])
        response = d.queryByPartitionKey('p-3', 'us-west-2')
        for dict in response:
            if 'p-3' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('p3', dict[patientName])

        # test querying unexisted
        response = d.queryByPartitionKey('p-0', 'us-west-2')
        self.assertEqual(len(response),0)

        response = d.queryByPartitionKey('p-5', 'us-west-2')
        self.assertEqual(len(response),0)

    @mock_dynamodb2
    def test_query_by_both_keys(self):
        tableName = 'Sessions'
        table = self.create_session_table()
        d = DataStore('dynamodb', tableName, 'PatientId', 'SessionId')
        info = {DATASTORE_COLUMN_SESSION_ID : 's-1',
                DATASTORE_COLUMN_PATIENT_ID: 'p-1',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-1',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        d.save(info, 'us-west-2')

        info = {DATASTORE_COLUMN_SESSION_ID : 's-2',
                DATASTORE_COLUMN_PATIENT_ID: 'p-2',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-2',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        d.save(info, 'us-west-2')

        info = {DATASTORE_COLUMN_SESSION_ID : 's-3',
                DATASTORE_COLUMN_PATIENT_ID: 'p-3',
                DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID: 'h-3',
                DATASTORE_COLUMN_SESSION_NAME: 'SessionName',
                DATASTORE_COLUMN_COMPREHEND_S3_PATH: 'ComprehendS3Path',
                DATASTORE_COLUMN_TRANSCRIBE_S3_PATH: 'TranscribeS3Path',
                DATASTORE_COLUMN_TIMESTAMP_START: 1969,
                DATASTORE_COLUMN_TIMESTAMP_END: 2030}
        d.save(info, 'us-west-2')

        # test querying existed
        response = d.queryByBothKeys('p-1', 's-1', 'us-west-2')
        for dict in response:
            if 'p-1' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('h-1', dict[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID])
        response = d.queryByBothKeys('p-2', 's-2', 'us-west-2')
        for dict in response:
            if 'p-2' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('h-2', dict[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID])
        response = d.queryByBothKeys('p-3', 's-3', 'us-west-2')
        for dict in response:
            if 'p-3' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('h-3', dict[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID])

        # test querying unexisted
        response = d.queryByBothKeys('p-0', 'h-1', 'us-west-2')
        self.assertEqual(len(response),0)

        response = d.queryByBothKeys('p-5', 'h-1', 'us-west-2')
        self.assertEqual(len(response),0)

        response = d.queryByBothKeys('p-1', 'h-0', 'us-west-2')
        self.assertEqual(len(response),0)

        response = d.queryByBothKeys('p-0', 'h-0', 'us-west-2')
        self.assertEqual(len(response),0)

if __name__ == '__main__':
    unittest.main()

