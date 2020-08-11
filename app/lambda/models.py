from datastore import DataStore
import os

class Patient:
    def __init__(self):
        """Constructor for the Patient class to store information regarding the Patient table
        
        Args:
            None

        Returns:
            The Patient object
        """
        self._databaseName = "dynamodb"
        self._tableName = "Patients"
        self._partitionKeyName = "PatientId"
        self._patientDataStore = DataStore(self._databaseName, self._tableName, self._partitionKeyName)

    def createPatient(self, info):
        """Create the patient and store the data into database
        
        Args:
            info(dict): information regarding the patient (patient id, patient name, etc.)

        Returns:
            None
        """
        return self._patientDataStore.save(info) 

    def requestPatients(self, partitionKey):
        """Request and get the specific patient from the database based on partition key.
        If there is no partition key provided, return list of all patients through pagination
        
        Args:
            partitionKey(str): partition key value of the patient table

        Returns:
            List of patient(s) info
        """
        return self._patientDataStore.queryByPartitionKey(partitionKey) if partitionKey else self._patientDataStore.listItems()
     
            

class HealthCareProfessional:
    def __init__(self):
        """Constructor for the health care professional class to store information regarding the health care professional table
        
        Args:
            None

        Returns:
            The HealthCareProfessional object
        """
        self._databaseName = "dynamodb"
        self._tableName = "HealthCareProfessionals"
        self._partitionKeyName = "HealthCareProfessionalId"
        self._healthCareProfessionalDataStore = DataStore(self._databaseName, self._tableName, self._partitionKeyName)

    def createHealthCareProfessional(self, info):
        """Create the healthcare care professional and store the data into database
        
        Args:
            info(dict): information regarding the health care professional (health care professional id, health care professional name, etc.)

        Returns:
            None
        """
        return self._healthCareProfessionalDataStore.save(info)

    def requestHealthCareProfessionals(self, partitionKey):
        """Request and get the specific health care professional from the database based on partition key.
        If there is no partition key provided, return list of all health care professionals through pagination
        
        Args:
            partitionKey(str): partition key value of the health care professional table

        Returns:
            List of health care professional(s) info
        """
        return self._healthCareProfessionalDataStore.queryByPartitionKey(partitionKey) if partitionKey else self._healthCareProfessionalDataStore.listItems()
        

class Session:
    def __init__(self):
        """Constructor for the session class to store information regarding the session table
        
        Args:
            None

        Returns:
            The Session object
        """
        self._databaseName = "dynamodb"
        self._tableName = "Sessions"
        self._partitionKeyName = "PatientId"
        self._sortKeyName = "SessionId"
        self._indexName = "hcpIndex"
        self._indexPartitionKeyName = "HealthCareProfessionalId"
        self._indexSortKeyName = "SessionId"
        self._sessionDataStore = DataStore(self._databaseName, self._tableName, self._partitionKeyName, self._sortKeyName, self._indexName, self._indexPartitionKeyName, self._indexSortKeyName)
    
    def createSession(self, info):
        """Create the session and store the data into database
        
        Args:
            info(dict): information regarding the session (patient id, session id, health care professional id, session name etc.)

        Returns:
            None
        """
        return self._sessionDataStore.save(info)

    def requestSession(self, partitionKey, sortKey, indexPartitionKey):
        """Request and get the specific session(s) from the database.
        If both partition key and sort key are provided, return that single specific session.
        if both index partition key and sort key are provided, return that single specific session.
        if only partition key is provided, return sessions with that partition key.
        if onyl index partition key is provided, return sessions with that index partition key.
        
        Args:
            partitionKey(str): partition key value of the session table
            sortKey(str): sort key value of the session table
            indexPartitionKey(str): index partition key value of the session table

        Returns:
            List of session(s) info
        """
        if partitionKey and sortKey:
            return self._sessionDataStore.queryByBothKeys(partitionKey, sortKey)
        elif indexPartitionKey and sortKey:
            return self._sessionDataStore.queryByIndexBothKeys(indexPartitionKey, sortKey)
        elif partitionKey:
            return self._sessionDataStore.queryByPartitionKey(partitionKey)
        elif indexPartitionKey:
            return self._sessionDataStore.queryByIndexPartitionKey(indexPartitionKey)

        return {"Items": [], "status": "BAD", "message": "Wrong Way to Search."}