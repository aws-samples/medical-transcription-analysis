import unittest
import boto3
from moto import mock_dynamodb2
import sys
sys.path.append("../lambda/")
from datastore import DataStore

class TestDynamo(unittest.TestCase):

    def setUp(self):
        pass

    @mock_dynamodb2
    def test_recoverBsaleAssociation(self):
        table_name = 'Patients'
        dynamodb = boto3.resource('dynamodb', 'us-west-2')
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[{'AttributeName': 'PatientId', 'KeyType': 'HASH'},],
            AttributeDefinitions=[{'AttributeName': 'PatientId', 'AttributeType': 'S'},],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        d = DataStore('dynamodb', 'Patients', 'PatientId')
        d.save({'PatientId': 'p-3e3477c37d674ecc98e3cdf5487ee07b', 'PatientName':'Hello'},'us-west-2')

        table = dynamodb.Table(table_name)
        response = table.scan()
        item = response['Item'][0] if 'Item' in response else {}

        self.assertTrue("p-3e3477c37d674ecc98e3cdf5487ee07b" in item)
        self.assertEquals(item["p-3e3477c37d674ecc98e3cdf5487ee07b"], 'Hello')


if __name__ == '__main__':
    unittest.main()

