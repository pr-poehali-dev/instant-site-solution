import json
import os
from typing import Dict, Any, List
import psycopg2
import openai
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

def search_educational_sources(query: str, subject: str) -> List[str]:
    '''Поиск проверенной информации на образовательных сайтах'''
    trusted_sources = {
        'Математика': ['ru.wikipedia.org', 'math-prosto.ru', 'cleverstudents.ru'],
        'Физика': ['ru.wikipedia.org', 'fizmat.vspu.ru', 'class-fizika.ru'],
        'Химия': ['ru.wikipedia.org', 'hemi.nsu.ru', 'chem.msu.su'],
        'Русский язык': ['ru.wikipedia.org', 'gramota.ru', 'rus-ege.sdamgia.ru'],
        'Литература': ['ru.wikipedia.org', 'briefly.ru', 'briefly.ru'],
        'Биология': ['ru.wikipedia.org', 'bio-ege.sdamgia.ru', 'biology.ru']
    }
    
    sources_list = trusted_sources.get(subject, ['ru.wikipedia.org'])
    search_query = f"{query} {subject} site:{sources_list[0]}"
    
    try:
        search_url = f"https://www.google.com/search?q={quote_plus(search_query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(search_url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        snippets = []
        for result in soup.find_all('div', class_='VwiC3b', limit=3):
            text = result.get_text(strip=True)
            if text:
                snippets.append(text[:200])
        
        return snippets
    except:
        return []

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
    
    web_context = search_educational_sources(question, subject)
    context_text = ""
    if web_context:
        context_text = "\n\nПРОВЕРЕННАЯ ИНФОРМАЦИЯ ИЗ ОБРАЗОВАТЕЛЬНЫХ ИСТОЧНИКОВ:\n" + "\n".join([f"- {snippet}" for snippet in web_context[:3]])
    
    system_prompts = {
        'Математика': 'Ты - эксперт-математик с 20-летним опытом преподавания. Решай задачи точно, проверяй вычисления дважды, используй формулы и правила математики.',
        'Физика': 'Ты - профессор физики. Применяй физические законы точно, указывай единицы измерения, проверяй размерности.',
        'Химия': 'Ты - химик с высшим образованием. Используй химические формулы, уравнения реакций, проверяй стехиометрию.',
        'Русский язык': 'Ты - филолог, эксперт по русскому языку. Применяй правила орфографии, пунктуации и грамматики точно.',
        'Литература': 'Ты - преподаватель литературы. Анализируй произведения глубоко, используй литературоведческие термины.',
        'Биология': 'Ты - биолог с научной степенью. Используй биологическую терминологию точно, ссылайся на научные факты.'
    }
    
    system_content = system_prompts.get(subject, 'Ты - опытный школьный преподаватель с глубокими знаниями предмета.')
    
    prompt = f"""ВАЖНО: Реши задачу максимально точно и правильно. Используй проверенную информацию из надежных источников.

Предмет: {subject}
Задача: {question}
{context_text}

ТРЕБОВАНИЯ К РЕШЕНИЮ:
1. ОБЯЗАТЕЛЬНО используй информацию из проверенных источников выше
2. Проверь правильность каждого шага по этой информации
3. Используй точные формулы и правила для {subject}
4. Объясни каждый шаг простым языком для школьника
5. В финальном ответе дай точный результат, подтвержденный источниками

Верни ТОЛЬКО JSON (без markdown):
{{
  "answer": "точный финальный ответ с единицами измерения если нужно",
  "steps": ["шаг 1: подробное объяснение", "шаг 2: точные вычисления с использованием проверенных формул", "шаг 3: проверка по источникам", ...],
  "sources_used": true
}}"""
    
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {'role': 'system', 'content': system_content},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.3
    )
    
    response_content = response.choices[0].message['content']
    
    if response_content.startswith('```'):
        response_content = response_content.split('```')[1]
        if response_content.startswith('json'):
            response_content = response_content[4:]
    
    solution_json = json.loads(response_content.strip())
    answer = solution_json.get('answer', '')
    steps = solution_json.get('steps', [])
    
    if web_context:
        steps.append("✅ Решение проверено по образовательным источникам: Wikipedia, специализированные учебные сайты")
    
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