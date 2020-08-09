import boto3
import json 

def on_create(event):
    client = boto3.client('athena', region_name='us-west-2')
    
def on_delete(event):
    pass