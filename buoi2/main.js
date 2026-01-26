const URL_REQUEST = "http://localhost:3000/posts";
const URL_COMMENTS = "http://localhost:3000/comments";

async function GetData() {
  try {
    let res = await fetch(URL_REQUEST);
    let posts = await res.json();

    let body_of_table = document.getElementById("table-body");
    body_of_table.innerHTML = "";
    for (const post of posts) {
      // Áp dụng kiểu gạch ngang cho các bài xoá mềm
      let rowStyle = post.isDeleted
        ? 'style="text-decoration: line-through; color: #999;"'
        : "";
      let deleteButtonText = post.isDeleted ? "Khôi phục" : "Xóa";

      body_of_table.innerHTML += `<tr ${rowStyle}>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td><input type='submit' onclick='Delete(${post.id})' value='${deleteButtonText}'/></td>
                <td><input type='submit' onclick='ShowComments(${post.id})' value='Bình luận'/></td>
            </tr>`;
    }
  } catch (error) {
    console.log(error);
  }
}
// Nếu id không tồn tại -> tạo mới
// ID tồn tại thì sử dụng PUT
async function Save() {
  let id = document.getElementById("id_txt").value;
  let title = document.getElementById("title_txt").value;
  let views = document.getElementById("views_txt").value;
  let res;

  if (id.trim() === "") {
    // Tạo mới - ID tự tăng
    let maxId = await GetMaxId();
    id = String(maxId + 1);
  }

  let resAnItem = await fetch(URL_REQUEST + "/" + id);
  if (resAnItem.ok) {
    // Tồn tại rồi - PUT
    res = await fetch(URL_REQUEST + "/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        views: views,
      }),
    });
  } else {
    res = await fetch(URL_REQUEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        title: title,
        views: views,
        isDeleted: false,
      }),
    });
  }
  if (!res.ok) {
    console.log("Có lỗi");
  }
  // Xóa các trường nhập
  document.getElementById("id_txt").value = "";
  document.getElementById("title_txt").value = "";
  document.getElementById("views_txt").value = "";
  GetData();
  return false;
}

// Lấy ID lớn nhất từ tất cả bài (bao gồm các bài xoá mềm)
async function GetMaxId() {
  try {
    let res = await fetch(URL_REQUEST);
    let posts = await res.json();
    let maxId = 0;
    for (const post of posts) {
      let postId = parseInt(post.id);
      if (postId > maxId) {
        maxId = postId;
      }
    }
    return maxId;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

// Xóa mềm - chuyển đổi cờ isDeleted
async function Delete(id) {
  try {
    // Lấy bài hiện tại để chuyển đổi isDeleted
    let res = await fetch(URL_REQUEST + "/" + id);
    let post = await res.json();

    // Chuyển đổi isDeleted
    let updateRes = await fetch(URL_REQUEST + "/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...post,
        isDeleted: !post.isDeleted,
      }),
    });

    if (updateRes.ok) {
      console.log(
        post.isDeleted ? "Khôi phục thành công" : "Xóa mềm thành công",
      );
    }
    GetData();
  } catch (error) {
    console.log(error);
  }
}

// Lấy tất cả bình luận cho một bài
async function ShowComments(postId) {
  try {
    let res = await fetch(URL_COMMENTS + "?postId=" + postId);
    let comments = await res.json();

    let commentsList = comments
      .map(
        (c) => `
      <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
        <p><strong>ID:</strong> ${c.id} | <strong>Nội dung:</strong> ${c.text}</p>
        <input type='submit' onclick='EditComment(${postId}, ${c.id})' value='Sửa'/>
        <input type='submit' onclick='DeleteComment(${c.id})' value='Xóa'/>
      </div>
    `,
      )
      .join("");

    let html = `
      <div style="margin-top: 20px; padding: 15px; border: 2px solid blue;">
        <h3>Bình luận cho bài ${postId}</h3>
        ${commentsList}
        <hr/>
        <h4>Thêm bình luận mới:</h4>
        <textarea id="comment_text" placeholder="Nhập nội dung bình luận" style="width: 100%; height: 60px;"></textarea><br/>
        <input type='submit' onclick='AddComment(${postId})' value='Thêm bình luận'/>
        <input type='submit' onclick='CloseComments()' value='Đóng'/>
      </div>
    `;

    // Thêm phần bình luận vào trang
    let commentsDiv = document.getElementById("comments-section");
    if (!commentsDiv) {
      commentsDiv = document.createElement("div");
      commentsDiv.id = "comments-section";
      document.body.appendChild(commentsDiv);
    }
    commentsDiv.innerHTML = html;
  } catch (error) {
    console.log(error);
  }
}

// Tạo bình luận mới
async function AddComment(postId) {
  try {
    let text = document.getElementById("comment_text").value;
    if (text.trim() === "") {
      alert("Vui lòng nhập nội dung bình luận");
      return;
    }

    let maxId = await GetMaxCommentId();

    let res = await fetch(URL_COMMENTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: String(maxId + 1),
        text: text,
        postId: String(postId),
      }),
    });

    if (res.ok) {
      console.log("Thêm bình luận thành công");
      document.getElementById("comment_text").value = "";
      ShowComments(postId);
    }
  } catch (error) {
    console.log(error);
  }
}

// Lấy ID bình luận lớn nhất
async function GetMaxCommentId() {
  try {
    let res = await fetch(URL_COMMENTS);
    let comments = await res.json();
    let maxId = 0;
    for (const comment of comments) {
      let commentId = parseInt(comment.id);
      if (commentId > maxId) {
        maxId = commentId;
      }
    }
    return maxId;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

// Sửa bình luận
async function EditComment(postId, commentId) {
  try {
    let res = await fetch(URL_COMMENTS + "/" + commentId);
    let comment = await res.json();

    let newText = prompt("Sửa bình luận:", comment.text);
    if (newText === null) return;

    let updateRes = await fetch(URL_COMMENTS + "/" + commentId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: comment.id,
        text: newText,
        postId: comment.postId,
      }),
    });

    if (updateRes.ok) {
      console.log("Cập nhật bình luận thành công");
      ShowComments(postId);
    }
  } catch (error) {
    console.log(error);
  }
}

// Xóa bình luận
async function DeleteComment(commentId) {
  try {
    let postIdRes = await fetch(URL_COMMENTS + "/" + commentId);
    let comment = await postIdRes.json();
    let postId = comment.postId;

    let deleteRes = await fetch(URL_COMMENTS + "/" + commentId, {
      method: "DELETE",
    });

    if (deleteRes.ok) {
      console.log("Xóa bình luận thành công");
      ShowComments(postId);
    }
  } catch (error) {
    console.log(error);
  }
}

// Đóng phần bình luận
function CloseComments() {
  let commentsDiv = document.getElementById("comments-section");
  if (commentsDiv) {
    commentsDiv.innerHTML = "";
  }
}

GetData();
