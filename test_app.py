import app  # 네 app.py 모듈
import pytest

@pytest.fixture
def client():
    app.app.config['TESTING'] = True
    client = app.app.test_client()
    yield client

def test_add_post(client):
    response = client.post('/add_post', json={
        'name': 'TestUser',
        'category': '테스트',
        'title': '테스트 제목',
        'content': '테스트 내용'
    })
    assert response.status_code == 200
    assert response.get_json()['result'] == 'success'

def test_get_posts(client):
    response = client.get('/get_posts')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)  # 글 목록이 리스트 형태인지 확인
