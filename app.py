from flask import Flask, render_template, request, jsonify
import sqlite3
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

app = Flask(__name__)

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# 🔹 메인 페이지
@app.route('/')
def index():
    return render_template('index.html')

# 🔹 게시글 저장
@app.route('/add_post', methods=['POST'])
def add_post():
    try:
        data = request.json
        conn = get_conn()
        conn.execute(
            'INSERT INTO posts (name, category, title, content) VALUES (?, ?, ?, ?)',
            (data['name'], data['category'], data['title'], data['content'])
        )
        conn.commit()
        conn.close()
        return jsonify({'result': 'success'})
    except Exception as e:
        print("Error in /add_post:", e)
        return jsonify({'result': 'error', 'message': str(e)}), 500


# 🔹 게시글 전체 조회 
@app.route('/get_posts')
def get_posts():
    conn = get_conn()
    posts = conn.execute('SELECT * FROM posts ORDER BY id ASC').fetchall()
    conn.close()
    return jsonify([dict(p) for p in posts])


# 🔹 댓글 저장
@app.route('/add_comment', methods=['POST'])
def add_comment():
    data = request.json
    conn = get_conn()
    conn.execute('INSERT INTO comments (post_id, name, content) VALUES (?, ?, ?)',
                 (data['post_id'], data['name'], data['content']))
    conn.commit()
    conn.close()
    return jsonify({'result': 'success'})

# 🔹 댓글 불러오기
@app.route('/get_comments/<int:post_id>')
def get_comments(post_id):
    conn = get_conn()
    comments = conn.execute('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC', (post_id,)).fetchall()
    conn.close()
    return jsonify([dict(c) for c in comments])

# 해당하는 카테고리 게시글 가져오기
@app.route('/get_posts/<category>')
def get_posts_by_category(category):
    try:
        conn = get_conn()
        posts = conn.execute('SELECT * FROM posts WHERE category = ? ORDER BY id DESC', (category,)).fetchall()
        conn.close()
        return jsonify([dict(p) for p in posts])
    except Exception as e:
        print(f"Error in /get_posts/{category}:", e)
        return jsonify([])

# 제목 또는 내용을 가진 게시글 검색
@app.route('/search_posts')
def search_posts():
    keyword = request.args.get('keyword', '')
    conn = get_conn()
    posts = conn.execute('''
        SELECT * FROM posts 
        WHERE title LIKE ? OR content LIKE ?    
        ORDER BY id ASC
    ''', (f'%{keyword}%', f'%{keyword}%')).fetchall()
    conn.close()
    return jsonify([dict(p) for p in posts])

#게시글 삭제
@app.route('/delete_post/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    try:
        conn = get_conn()
        conn.execute('DELETE FROM posts WHERE id = ?', (post_id,))
        conn.commit()
        conn.close()
        return jsonify({'result': 'success'})
    except Exception as e:
        print("Error in /delete_post:", e)
        return jsonify({'result': 'error', 'message': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
