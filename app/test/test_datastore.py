import sys
sys.path.append("../lambda/")
import unittest
import boto3
from moto import mock_dynamodb2
from datastore import DataStore
from constant_variables import *
from data.test_constants import *

class TestDataStore(unittest.TestCase):
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
    def test_save(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        response = d.save(SESSION_INFO_1)
        self.assertEqual('OK', response['status'])
        response = table.scan()
        item = response['Items'][0]
        self.assertTrue('ComprehendS3Path' in item[DATASTORE_COLUMN_COMPREHEND_S3_PATH])
        self.assertEqual('p-1', item[DATASTORE_COLUMN_PATIENT_ID])

    @mock_dynamodb2
    def test_save_empty(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        response = d.save(SESSION_INFO_EMPTY)
        self.assertEqual('BAD', response['status'])
        response = table.scan()
        self.assertEqual(0, len(response['Items']))

    @mock_dynamodb2
    def test_save_multiple(self):
        table = self.create_session_table()
        self.assertEqual(0, len(table.scan()['Items']))
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        response = table.scan()
        self.assertEqual(1, len(response['Items']))
        d.save(SESSION_INFO_2)
        response = table.scan()
        self.assertEqual(2, len(response['Items']))
        d.save(SESSION_INFO_3)
        response = table.scan()
        self.assertEqual(3, len(response['Items']))

    @mock_dynamodb2
    def test_save_collision(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        response = table.scan()
        self.assertEqual(1, len(response['Items']))
        self.assertEqual('SessionName', response['Items'][0]['SessionName'])
        response = d.save(SESSION_INFO_1_SAMEKEY)
        self.assertEqual('OK', response['status'])
        response = table.scan()
        self.assertEqual(1, len(response['Items']))
        self.assertEqual('NO', response['Items'][0]['SessionName'])

    @mock_dynamodb2
    def test_list_items(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        response = d.listItems()
        self.assertEqual(1, len(response))
        d.save(SESSION_INFO_1)
        response = d.listItems()
        self.assertEqual(1, len(response))
        d.save(SESSION_INFO_2)
        response = d.listItems()
        self.assertEqual(2, len(response))
        d.save(SESSION_INFO_3)
        response = d.listItems()
        self.assertEqual(3, len(response))

    @mock_dynamodb2
    def test_list_items_empty(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        response = d.listItems()
        self.assertEqual(0, len(response))

    @mock_dynamodb2
    def test_query_by_partition_key(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        response = d.queryByPartitionKey('p-1')
        self.assertEqual('s-1', response[0][DATASTORE_COLUMN_SESSION_ID])

    @mock_dynamodb2
    def test_query_by_partition_key_multiple(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        d.save(SESSION_INFO_2)
        d.save(SESSION_INFO_3)
        response = d.queryByPartitionKey('p-1')
        for dict in response:
            if 'p-1' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('s-1', dict[DATASTORE_COLUMN_SESSION_ID])
        response = d.queryByPartitionKey('p-2')
        for dict in response:
            if 'p-2' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('s-2', dict[DATASTORE_COLUMN_SESSION_ID])
        response = d.queryByPartitionKey('p-3')
        for dict in response:
            if 'p-3' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('s-3', dict[DATASTORE_COLUMN_SESSION_ID])

    @mock_dynamodb2
    def test_query_by_partition_key_nonexistent(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        d.save(SESSION_INFO_2)
        d.save(SESSION_INFO_3)
        response = d.queryByPartitionKey('p-0')
        self.assertEqual(0, len(response))
        response = d.queryByPartitionKey('p-5')
        self.assertEqual(0, len(response))
        
    @mock_dynamodb2
    def test_query_by_both_keys(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        d.save(SESSION_INFO_2)
        d.save(SESSION_INFO_3)
        response = d.queryByBothKeys('p-1', 's-1')
        for dict in response:
            if 'p-1' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('h-1', dict[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID])
        response = d.queryByBothKeys('p-2', 's-2')
        for dict in response:
            if 'p-2' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('h-2', dict[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID])
        response = d.queryByBothKeys('p-3', 's-3')
        for dict in response:
            if 'p-3' in dict[DATASTORE_COLUMN_PATIENT_ID]:
                self.assertEqual('h-3', dict[DATASTORE_COLUMN_HEALTH_CARE_PROFESSSIONAL_ID])

    @mock_dynamodb2
    def test_query_by_both_keys_nonexistent(self):
        table = self.create_session_table()
        d = DataStore('dynamodb', 'Sessions', 'PatientId', 'SessionId')
        d.save(SESSION_INFO_1)
        d.save(SESSION_INFO_2)
        d.save(SESSION_INFO_3)
        response = d.queryByBothKeys('p-0', 's-1')
        self.assertEqual(len(response),0)
        response = d.queryByBothKeys('p-5', 's-1')
        self.assertEqual(len(response),0)
        response = d.queryByBothKeys('p-1', 's-0')
        self.assertEqual(len(response),0)
        response = d.queryByBothKeys('p-0', 's-0')
        self.assertEqual(len(response),0)


if __name__ == '__main__':
    unittest.main()