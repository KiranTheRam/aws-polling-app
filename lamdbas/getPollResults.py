import json
import boto3

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
polls_table = dynamodb.Table('Polls')  # Replace 'Polls' with your DynamoDB table name

def lambda_handler(event, context):
    try:
        print("HELLO!")
        # Extract poll ID from the request body
        request_body = json.loads(event['body'])
        print(request_body)
        poll_id = request_body.get('pollId')
        print("Received poll id: ", poll_id)
        if not poll_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                    'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                    'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
                },
                'body': json.dumps({
                    'error': 'Poll ID is missing in the request body'
                })
            }
        # Retrieve the poll from DynamoDB
        response = polls_table.get_item(
            Key={
                'PollId': poll_id
            }
        )
        
        # Check if the poll exists
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                    'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                    'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
                },
                'body': json.dumps({
                    'error': 'Poll not found'
                })
            }
        
        # Extract poll details and return them
        poll_item = response['Item']
        poll_question = poll_item['Question']
        poll_options = poll_item['Options']
        poll_votes = {option: int(vote) for option, vote in poll_item['Votes'].items()}
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
            },
            'body': json.dumps({
                'pollId': poll_id,
                'question': poll_question,
                'options': poll_options,
                'votes': poll_votes
            })
        }
    except Exception as e:
        # Return error response if something goes wrong
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
            },
            'body': json.dumps({
                'error': str(e)
            })
        }

