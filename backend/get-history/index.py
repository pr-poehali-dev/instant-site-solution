import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает историю решённых задач из базы данных
    Args: event - dict с httpMethod, queryStringParameters (limit)
          context - объект с request_id
    Returns: HTTP response со списком решений
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 10))
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, subject, question, answer, steps, created_at FROM solutions ORDER BY created_at DESC LIMIT %s",
        (limit,)
    )
    
    rows = cur.fetchall()
    
    solutions = []
    for row in rows:
        solutions.append({
            'id': str(row[0]),
            'subject': row[1],
            'question': row[2],
            'answer': row[3],
            'steps': json.loads(row[4]),
            'timestamp': row[5].isoformat()
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'solutions': solutions}, ensure_ascii=False),
        'isBase64Encoded': False
    }
