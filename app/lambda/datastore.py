import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from helper import AwsHelper
import datetime
import re

class DataStore:
    def __init__(self, databaseName, tableName, partitionKeyName, sortKeyName=None, indexName=None, indexPartitionKeyName=None, indexSortKeyName=None):
        """Constructor for the DataStore class to store information into the database
        
        Args:
            databaseName(str): name of the database
            tableName(str): name of the table
            partitionKeyName(str): name of the partition key
            sortKeyName(str): name of the sort key
            indexName(str): name of the index
            indexPartitionKeyName(str): name of the index partition key
            indexSortKeyName(str): name of the index sort key

        Returns:
            The DataStore object
        """
        self._databaseName = databaseName
        self._tableName = tableName
        self._partitionKeyName = partitionKeyName
        self._sortKeyName = sortKeyName
        self._indexName = indexName
        self._indexPartitionKeyName = indexPartitionKeyName
        self._indexSortKeyName = indexSortKeyName
    
    def save(self, info, awsRegion=None):
        """Store the data into database
        
        Args:
            info(dict): information to store

        Returns:
            None
        """
        if self._databaseName == 'dynamodb':
            dynamodb = AwsHelper().getResource(self._databaseName, awsRegion)
            table = dynamodb.Table(self._tableName)
            try:
                table.put_item(Item=info)
            except Exception as e:
                print(str(e))

    def listItems(self, awsRegion=None):
        """List the data from database
        
        Args:
            None

        Returns:
            List of data from data base
        """
        response = {'Items' : []}
        if self._databaseName == 'dynamodb':
            dynamodb = AwsHelper().getResource(self._databaseName, awsRegion)
            table = dynamodb.Table(self._tableName)
            try:
                response = table.scan()
            except Exception as e:
                print(str(e))
        return response['Items']

    def queryByPartitionKey(self, partitionKey):
        """List the data from database based on partition key
        
        Args:
           partitionKey(str): partition key value

        Returns:
            List of data from database based on partition key
        """
        response = {'Items' : []}
        if self._databaseName == 'dynamodb':
            dynamodb = AwsHelper().getResource(self._databaseName)
            table = dynamodb.Table(self._tableName)
            try:
                response = table.query(KeyConditionExpression=Key(self._partitionKeyName).eq(partitionKey))
            except Exception as e:
                print(str(e))
        return response['Items']

    def queryByBothKeys(self, partitionKey, sortKey):
        """List the data from database based on partition key and sort key
        
        Args:
           partitionKey(str): partition key value
           sortKey(str): sort key value

        Returns:
            List of data from database based on partition key and sort key
        """
        response = {'Items' : []}
        if self._databaseName == 'dynamodb':
            dynamodb = AwsHelper().getResource(self._databaseName)
            table = dynamodb.Table(self._tableName)
            try:
                response = table.query(KeyConditionExpression=Key(self._partitionKeyName).eq(partitionKey) & Key(self._sortKeyName).eq(sortKey))
            except Exception as e:
                print(str(e))
        return response['Items']
    
    def queryByIndexPartitionKey(self, indexPartitionKey):
        """List the data from database based on index partition key
        
        Args:
           indexPartitionKey(str): partition key value of index

        Returns:
            List of data from database based on  index partition key
        """
        response = {'Items' : []}
        if self._databaseName == 'dynamodb':
            dynamodb = AwsHelper().getResource(self._databaseName)
            table = dynamodb.Table(self._tableName)
            try:
                response = table.query(
                    IndexName=self._indexName,
                    KeyConditionExpression=Key(self._indexPartitionKeyName).eq(indexPartitionKey)
                )
            except Exception as e:
                print(str(e))
        return response['Items']

    def queryByIndexBothKeys(self, indexPartitionKey, indexSortKey):
        """List the data from database based on index partition key and index sort key
        
        Args:
           indexPartitionKey(str): partition key value of index
           indexSortKey(str): sort key value of index

        Returns:
            List of data from database based on partition key and sort key
        """
        response = {'Items' : []}
        if self._databaseName == 'dynamodb':
            dynamodb = AwsHelper().getResource(self._databaseName)
            table = dynamodb.Table(self._tableName)
            try:
                response = table.query(
                    IndexName=self._indexName,
                    KeyConditionExpression=Key(self._indexPartitionKeyName).eq(indexPartitionKey) & Key(self._indexSortKeyName).eq(indexSortKey)
                )
            except Exception as e:
                print(str(e))
        return response['Items']
        


   