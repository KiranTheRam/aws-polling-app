import json
import boto3

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
polls_table = dynamodb.Table('Polls')  # Replace 'Polls' with your DynamoDB table name

def lambda_handler(event, context):
    try:
        # Query DynamoDB to get the latest 50 polls
        response = polls_table.scan(
            Limit=50,
            ProjectionExpression='PollId, Question'  # Include PollId in the response
        )
        
        # Extract poll data from the response and format it
        poll_data = [{'pollId': item['PollId'], 'question': item['Question']} for item in response.get('Items', [])]
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and GET methods
            },
            'body': json.dumps({
                'polls': poll_data
            })
        }
    except Exception as e:
        # Return error response if something goes wrong
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

