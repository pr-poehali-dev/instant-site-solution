import json
import os
from typing import Dict, Any
import psycopg2
import openai

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Решает школьные задачи с помощью OpenAI GPT-4 и сохраняет в базу данных
    Args: event - dict с httpMethod, body (question, subject)
          context - объект с request_id
    Returns: HTTP response с решением задачи
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    question: str = body_data.get('question', '')
    subject: str = body_data.get('subject', 'Математика')
    
    if not question.strip():
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Question is required'}),
            'isBase64Encoded': False
        }
    
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'OpenAI API key not configured'}),
            'isBase64Encoded': False
        }
    
    openai.api_key = openai_key
    
    prompt = f"""Ты - опытный школьный учитель по предмету "{subject}".
Реши следующую задачу пошагово и дай подробное объяснение каждого шага.

Задача: {question}

Верни ответ в формате JSON:
{{
  "answer": "краткий финальный ответ",
  "steps": ["шаг 1", "шаг 2", "шаг 3", ...]
}}

Каждый шаг должен быть понятным школьнику."""
    
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {'role': 'system', 'content': 'Ты - профессиональный школьный учитель, объясняющий решение задач простым языком.'},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.7
    )
    
    solution_json = json.loads(response.choices[0].message['content'])
    answer = solution_json.get('answer', '')
    steps = solution_json.get('steps', [])
    
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        steps_json = json.dumps(steps, ensure_ascii=False)
        
        cur.execute(
            "INSERT INTO solutions (subject, question, answer, steps) VALUES (%s, %s, %s, %s) RETURNING id",
            (subject, question, answer, steps_json)
        )
        solution_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
    else:
        solution_id = 0
    
    result = {
        'id': str(solution_id),
        'subject': subject,
        'question': question,
        'answer': answer,
        'steps': steps
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result, ensure_ascii=False),
        'isBase64Encoded': False
    }