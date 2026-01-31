class Dashboard {
  constructor() {
    this.apiUrl = "https://api.escuelajs.co/api/v1/products";
    this.allProducts = [];
    this.filteredProducts = [];

    this.currentPage = 1;
    this.itemsPerPage = 5;

    this.sortColumn = null;
    this.sortOrder = "asc";
  }

  // ================= FETCH =================
  async loadProducts() {
    try {
      const res = await fetch(this.apiUrl);
      if (!res.ok) throw new Error("API error");

      this.allProducts = await res.json();
      this.filteredProducts = [...this.allProducts];

      this.render();
    } catch (err) {
      document.getElementById("productsBody").innerHTML =
        `<tr><td colspan="6">Không tải được dữ liệu</td></tr>`;
      console.error(err);
    }
  }

  // ================= SEARCH =================
  search(keyword) {
    const k = keyword.toLowerCase();
    this.filteredProducts = this.allProducts.filter((p) =>
      p.title.toLowerCase().includes(k),
    );
    this.currentPage = 1;
    this.render();
  }

  // ================= SORT =================
  sort(column) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortOrder = "asc";
    }

    this.filteredProducts.sort((a, b) => {
      let x = a[column];
      let y = b[column];

      if (column === "price" || column === "id") {
        x = Number(x);
        y = Number(y);
      } else {
        x = (x || "").toLowerCase();
        y = (y || "").toLowerCase();
      }

      if (x < y) return this.sortOrder === "asc" ? -1 : 1;
      if (x > y) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    this.currentPage = 1;
    this.render();
  }

  // ================= PAGINATION =================
  setItemsPerPage(n) {
    this.itemsPerPage = Number(n);
    this.currentPage = 1;
    this.render();
  }

  getTotalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
  }

  getCurrentData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  next() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.render();
    }
  }

  prev() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }

  // ================= RENDER =================
  render() {
    const tbody = document.getElementById("productsBody");
    const data = this.getCurrentData();

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Không có sản phẩm</td></tr>`;
      this.updatePageInfo();
      return;
    }

    tbody.innerHTML = data
      .map((p, i) => {
        const rowClass = i % 2 === 0 ? "even" : "odd";

        // render toàn bộ ảnh của product
        const imagesHtml =
          p.images && p.images.length
            ? p.images
                .map(
                  (url) => `
            <img src="${url}"
                 class="thumb"
                 loading="lazy"
                 referrerpolicy="no-referrer"
                 onerror="this.style.display='none'">
          `,
                )
                .join("")
            : `<div class="placeholder-image">No image</div>`;

        return `
        <tr class="${rowClass}">
          <td>${p.id}</td>

          <td class="image-cell">
            <div class="image-multi">
              ${imagesHtml}
            </div>
          </td>

          <td class="title-cell">${this.cut(p.title, 40)}</td>
          <td class="price-cell">$${p.price}</td>

          <td class="description-cell">
            <div class="description-content">
              ${this.cut(p.description || "", 120)}
            </div>
          </td>

          <td class="category-cell">
            ${p.category?.name || ""}
          </td>
        </tr>
      `;
      })
      .join("");

    this.updatePageInfo();
  }

  cut(text, n) {
    if (!text) return "";
    return text.length > n ? text.slice(0, n) + "..." : text;
  }

  updatePageInfo() {
    document.getElementById("pageInfo").textContent =
      `Trang ${this.currentPage} / ${this.getTotalPages()}`;

    document.getElementById("prevBtn").disabled = this.currentPage === 1;

    document.getElementById("nextBtn").disabled =
      this.currentPage === this.getTotalPages();
  }
}

// ================= INIT =================
const app = new Dashboard();

document.addEventListener("DOMContentLoaded", () => {
  app.loadProducts();

  document
    .getElementById("searchInput")
    .addEventListener("input", (e) => app.search(e.target.value));

  document
    .getElementById("itemsPerPage")
    .addEventListener("change", (e) => app.setItemsPerPage(e.target.value));

  document
    .getElementById("prevBtn")
    .addEventListener("click", () => app.prev());

  document
    .getElementById("nextBtn")
    .addEventListener("click", () => app.next());

  document.querySelectorAll(".sortable").forEach((th) => {
    th.addEventListener("click", () => app.sort(th.dataset.column));
  });
});
