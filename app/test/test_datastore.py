import sys
sys.path.append("../lambda/")
import unittest
import boto3
from moto import mock_dynamodb2
from datastore import DataStore

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
    def test_save(self):
        tableName,patientId,patientName,patientIdVal,patientNameVal='Patients','PatientId','PatientName','p-3e3477c37d674ecc98e3cdf5487ee07b','Hello'
        table = self.create_patient_table()
        d = DataStore('dynamodb', tableName, patientId)
        d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        item = items[0] if items else None
        self.assertTrue(patientIdVal in item[patientId])
        self.assertEquals(item[patientName], patientNameVal)

        tableName,healthCareProfessionalId,healthCareProfessionalName,healthCareProfessionalIdVal,healthCareProfessionalNameVal='HealthCareProfessionals','HealthCareProfessionalId','HealthCareProfessionalName','h-3e3477c37d674ecc98e3cdf5487ee07b','World'
        table = self.create_health_care_professional_table()
        d = DataStore('dynamodb', tableName, healthCareProfessionalId)
        d.save({healthCareProfessionalId: healthCareProfessionalIdVal, healthCareProfessionalName: healthCareProfessionalNameVal},'us-west-2')
        response = table.scan()
        items = response['Items'] if 'Items' in response else {}
        item = items[0] if items else None
        self.assertTrue(healthCareProfessionalIdVal in item[healthCareProfessionalId])
        self.assertEquals(item[healthCareProfessionalName], healthCareProfessionalNameVal)

    # @mock_dynamodb2
    # def test_list_items(self):
    #     table = self.create_patient_table()

    #     tableName,patientId,patientName,patientIdVal,patientNameVal='Patients','PatientId','PatientName','p-3e3477c37d674ecc98e3cdf5487ee07a','p1'
    #     d = DataStore('dynamodb', tableName, patientId)
    #     d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
    #     response = table.scan()
    #     items = response['Items'] if 'Items' in response else {}
    #     self.assertEquals(len(items), 1)


    #     patientIdVal,patientNameVal='p-3e3477c37d674ecc98e3cdf5487ee07b','p2'
    #     d = DataStore('dynamodb', tableName, patientId)
    #     d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
    #     response = table.scan()
    #     items = response['Items'] if 'Items' in response else {}
    #     self.assertEquals(len(items), 2)

    #     patientIdVal,patientNameVal='p-3e3477c37d674ecc98e3cdf5487ee07c','p3'
    #     d = DataStore('dynamodb', tableName, patientId)
    #     d.save({patientId: patientIdVal, patientName:patientNameVal},'us-west-2')
    #     response = table.scan()
    #     items = response['Items'] if 'Items' in response else {}
    #     self.assertEquals(len(items), 3)

if __name__ == '__main__':
    unittest.main()

