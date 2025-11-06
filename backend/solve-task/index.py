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
    
    system_prompts = {
        'Математика': 'Ты - эксперт-математик с 20-летним опытом преподавания. Решай задачи точно, проверяй вычисления дважды, используй формулы и правила математики.',
        'Физика': 'Ты - профессор физики. Применяй физические законы точно, указывай единицы измерения, проверяй размерности.',
        'Химия': 'Ты - химик с высшим образованием. Используй химические формулы, уравнения реакций, проверяй стехиометрию.',
        'Русский язык': 'Ты - филолог, эксперт по русскому языку. Применяй правила орфографии, пунктуации и грамматики точно.',
        'Литература': 'Ты - преподаватель литературы. Анализируй произведения глубоко, используй литературоведческие термины.',
        'Биология': 'Ты - биолог с научной степенью. Используй биологическую терминологию точно, ссылайся на научные факты.'
    }
    
    system_content = system_prompts.get(subject, 'Ты - опытный школьный преподаватель с глубокими знаниями предмета.')
    
    prompt = f"""ВАЖНО: Реши задачу максимально точно и правильно. Проверь все вычисления и выводы.

Предмет: {subject}
Задача: {question}

ТРЕБОВАНИЯ К РЕШЕНИЮ:
1. Проверь правильность каждого шага
2. Используй точные формулы и правила для {subject}
3. Объясни каждый шаг простым языком для школьника
4. В финальном ответе дай точный результат

Верни ТОЛЬКО JSON (без markdown):
{{
  "answer": "точный финальный ответ с единицами измерения если нужно",
  "steps": ["шаг 1: подробное объяснение", "шаг 2: точные вычисления", "шаг 3: проверка", ...]
}}"""
    
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {'role': 'system', 'content': system_content},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.3
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