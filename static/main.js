// 글 작성 폼 토글
function toggleWriteForm() {
  const formArea = document.getElementById('write-form-area');
  const postDetail = document.getElementById('post-detail');
  const postList = document.getElementById('post-list');

  if (formArea.style.display === 'none' || formArea.style.display === '') {
    // 글 작성 폼 보여줄 때 상세내용 숨기기
    formArea.style.display = 'block';
    postDetail.style.display = 'none';
    postList.style.display = 'none';
  } else {
    // 글 작성 폼 숨길 때 상세내용 다시 보이게 할지, 아니면 리스트 보이게 할지 선택
    formArea.style.display = 'none';
    postDetail.style.display = 'none';
    postList.style.display = 'block';  // 👈 다시 목록 보이게
    // postDetail.style.display = 'block';  // 필요하면 활성화
  }
}


// 글 작성 완료 시 처리 (서버에 POST 요청)
function handleSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('write-form');
  const formData = new FormData(form);

  const newPost = {
    name: formData.get('name'),
    category: formData.get('category'),
    title: formData.get('title'),
    content: formData.get('content')
  };

  fetch('/add_post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newPost)
})
.then(res => {
  if (!res.ok) throw new Error('서버 오류: ' + res.status);
  return res.json();
})
.then(data => {
  if (data.result === 'success') {
    alert("작성 완료!");
    form.reset();
    toggleWriteForm();
    loadPosts();
  } else {
    alert('오류: ' + (data.message || '알 수 없는 오류'));
  }
})
.catch(err => {
  console.error(err);
  alert('서버와 통신 중 오류가 발생했습니다.');
});

}

// 게시글 리스트에 게시글 추가
function addPostToList(post) {
  const postList = document.getElementById('post-list');

  const postItem = document.createElement('div');
  postItem.className = 'post-item';

  postItem.innerHTML = `
    <h3 class="post-title">${post.title}</h3>
    <p class="post-meta">카테고리: ${post.category} | 작성자: ${post.name} | 번호: ${post.id}</p>
  `;

  // 제목 클릭 시 상세 보기
  postItem.querySelector('.post-title').addEventListener('click', () => {
    showPostDetail(post);
  });

  postList.append(postItem);
}

// 게시글 상세보기 화면으로 전환 및 댓글 불러오기
function showPostDetail(post) {
  const postList = document.getElementById('post-list');
  const postDetail = document.getElementById('post-detail');

  postList.style.display = 'none';
  postDetail.style.display = 'block';

  postDetail.innerHTML = `
    <h2>${post.title}</h2>
    <p class="detail-meta">작성자: ${post.name} | 카테고리: ${post.category} | 번호: ${post.id}</p>
    <div class="detail-content">${post.content.replace(/\n/g, "<br>")}</div>

    <hr />
    <h4>댓글</h4>

    <div class="comment-form">
      <input type="text" id="comment-name" placeholder="이름" required />
      <textarea id="comment-text" rows="3" placeholder="댓글 내용" required></textarea>
      <button onclick="addComment(${post.id})">댓글 작성</button>
    </div>

    <div id="comment-list" class="comment-list"></div>

    <button class="delete-btn" onclick="deletePost(${post.id})">삭제</button> 
    <button class="back-btn" onclick="goBackToList()">뒤로 가기</button>
  `;

  fetchComments(post.id);
}

// 댓글 추가 함수 (서버에 POST 요청)
function addComment(postId) {
  const name = document.getElementById('comment-name').value.trim();
  const content = document.getElementById('comment-text').value.trim();

  if (!name || !content) {
    alert("이름과 댓글을 입력하세요.");
    return;
  }

  fetch('/add_comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId, name, content })
  })
  .then(res => res.json())
  .then(data => {
    if (data.result === 'success') {
      document.getElementById('comment-name').value = '';
      document.getElementById('comment-text').value = '';
      fetchComments(postId);
    }
  });
}

// 댓글 불러오기 함수
function fetchComments(postId) {
  fetch(`/get_comments/${postId}`)
    .then(res => res.json())
    .then(comments => {
      const list = document.getElementById('comment-list');
      list.innerHTML = '';
      comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `<b>${c.name}</b>: ${c.content}`;
        list.appendChild(div);
      });
    });
}

// 상세보기에서 리스트로 돌아가기
function goBackToList() {
  document.getElementById('post-detail').style.display = 'none';
  document.getElementById('post-list').style.display = 'block';
}

// 페이지 로드 시 게시글 불러오기
window.onload = () => {
  loadPosts();
};

// 게시글 전체 불러오기
function loadPosts() {
  fetch('/get_posts')
    .then(res => res.json())
    .then(posts => {
      const postList = document.getElementById('post-list');
      postList.innerHTML = '';
      posts.forEach(post => addPostToList(post));
    });
}

function cancelWriteForm() {
  const formArea = document.getElementById('write-form-area');
  const postDetail = document.getElementById('post-detail');
  const postList = document.getElementById('post-list');

  // 글 작성 폼 숨기기
  formArea.style.display = 'none';

  // 상세보기 화면이 열려 있었다면 그 화면 다시 보여주기
  if (postDetail.innerHTML.trim() !== '' && postDetail.style.display === 'block') {
    postDetail.style.display = 'block';
    postList.style.display = 'none';
  } else {
    // 아니면 리스트 보여주기
    postDetail.style.display = 'none';
    postList.style.display = 'block';
  }
}

function filterCategory(category) {
  fetch(`/get_posts/${category}`)
    .then(res => res.json())
    .then(posts => {
      const postList = document.getElementById('post-list');
      const postDetail = document.getElementById('post-detail');
      postDetail.style.display = 'none';
      postList.style.display = 'block';
      postList.innerHTML = '';

      posts.forEach(post => addPostToList(post));
    });
}

function handleSearch() {
  const keyword = document.getElementById('search').value.trim();
  if (!keyword) return;

  fetch(`/search_posts?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(posts => {
      const postList = document.getElementById('post-list');
      const postDetail = document.getElementById('post-detail');
      postDetail.style.display = 'none';
      postList.style.display = 'block';
      postList.innerHTML = '';

      posts.forEach(post => addPostToList(post));
    });
}

function deletePost(postId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  fetch(`/delete_post/${postId}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    if (data.result === 'success') {
      alert('삭제되었습니다.');
      loadPosts();  // 게시글 목록 다시 불러오기
      goBackToList(); // 상세화면에서 리스트로 돌아가기
    } else {
      alert('삭제 실패: ' + (data.message || '알 수 없는 오류'));
    }
  })
  .catch(err => {
    console.error(err);
    alert('서버와 통신 중 오류가 발생했습니다.');
  });
}

