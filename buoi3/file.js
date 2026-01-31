// Dashboard API Class
class Dashboard {
  constructor() {
    this.apiUrl = "https://api.escuelajs.co/api/v1/products";
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.itemsPerPage = 5;
    this.sortColumn = null;
    this.sortOrder = "asc"; // asc or desc
  }

  // Get all products from API
  async getAll() {
    try {
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.allProducts = await response.json();
      this.filteredProducts = [...this.allProducts];
      this.currentPage = 1;
      console.log("Products loaded:", this.allProducts.length);
      console.log("Sample product:", this.allProducts[0]);
      return this.allProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  // Filter products by title
  filterByTitle(searchTerm) {
    const term = searchTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter((product) =>
      product.title.toLowerCase().includes(term),
    );
    this.currentPage = 1;
    this.render();
  }

  // Sort products
  sortBy(column, order = null) {
    if (this.sortColumn === column && order === null) {
      // Toggle sort order if clicking same column
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      // New column selected
      this.sortColumn = column;
      this.sortOrder = order || "asc";
    }

    this.filteredProducts.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      if (column === "price") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (column === "title") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return this.sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    this.currentPage = 1;
    this.updateSortIcons();
    this.render();
  }

  // Update sort icons in table headers
  updateSortIcons() {
    document.querySelectorAll(".sortable .sort-icon").forEach((icon) => {
      icon.textContent = "⬍";
    });

    const activeHeader = document.querySelector(
      `.sortable[data-column="${this.sortColumn}"] .sort-icon`,
    );
    if (activeHeader) {
      activeHeader.textContent = this.sortOrder === "asc" ? "▲" : "▼";
    }
  }

  // Get paginated products for current page
  getPaginatedProducts() {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    return this.filteredProducts.slice(startIdx, endIdx);
  }

  // Get total pages
  getTotalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  // Render table with products
  render() {
    const tbody = document.getElementById("productsBody");
    const products = this.getPaginatedProducts();

    if (products.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="loading">No products found.</td></tr>';
      this.updatePaginationControls();
      return;
    }

    tbody.innerHTML = products
      .map((product, index) => {
        const rowClass = (this.currentPage - 1) * this.itemsPerPage + index;
        const isEvenRow = rowClass % 2 === 0;
        const imageUrl = product.images?.[0] || "";
        const productId = product.id;

        // Render row immediately with loading state
        setTimeout(() => {
          if (imageUrl && document.getElementById(`img-${productId}`)) {
            this.convertJpegToPng(imageUrl).then((pngUrl) => {
              const imgElement = document.getElementById(`img-${productId}`);
              if (imgElement) {
                imgElement.src = pngUrl;
              }
            });
          }
        }, 0);

        return `
        <tr class="product-row ${isEvenRow ? "even" : "odd"}">
          <td class="image-cell">
            ${
              imageUrl
                ? `<div class="image-container">
              <img class="image-placeholder" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Crect fill='%23f0f0f0' width='140' height='140'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E" alt="${product.title}" id="img-${productId}" crossorigin="anonymous" />
            </div>`
                : `<div class="placeholder-image">${product.title.substring(0, 20)}</div>`
            }
          </td>
          <td class="title-cell">${this.truncate(product.title, 50)}</td>
          <td class="price-cell">$${parseFloat(product.price || 0).toFixed(2)}</td>
          <td class="description-cell">
            <div class="description-content">${this.truncate(product.description || "N/A", 100)}</div>
          </td>
          <td class="category-cell">${product.category?.name || "N/A"}</td>
        </tr>
        `;
      })
      .join("");

    this.updatePaginationControls();
  }

  // Truncate text to specified length
  truncate(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  }

  // Update pagination controls
  updatePaginationControls() {
    const totalPages = this.getTotalPages();
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage === totalPages;
  }

  // Go to next page
  nextPage() {
    const totalPages = this.getTotalPages();
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.render();
    }
  }

  // Go to previous page
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }

  // Convert JPEG to PNG data URL
  async convertJpegToPng(jpegUrl) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL("image/png");
          resolve(pngDataUrl);
        };

        img.onerror = () => {
          console.log("Direct load failed, trying with proxy...");
          // Thử với proxy nếu trực tiếp thất bại
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(jpegUrl)}`;
          img.src = proxyUrl;
        };

        img.src = jpegUrl;
      } catch (error) {
        console.error("Error converting image:", error);
        resolve(jpegUrl);
      }
    });
  }

  // Convert and download image as PNG
  downloadAsPNG(imgId, productTitle) {
    const img = document.getElementById(imgId);
    if (!img) {
      alert("Ảnh không tìm thấy!");
      return;
    }

    // Chờ ảnh load xong
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Convert canvas sang blob PNG
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${productTitle.replace(/\s+/g, "-")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    // Nếu ảnh đã load
    if (img.complete) {
      img.onload();
    }
  }
}

// Initialize dashboard when DOM is loaded
let dashboard;

document.addEventListener("DOMContentLoaded", async () => {
  dashboard = new Dashboard();

  // Load products on page load
  await dashboard.getAll();
  dashboard.render();

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    dashboard.filterByTitle(e.target.value);
  });

  // Items per page selection
  const itemsPerPageSelect = document.getElementById("itemsPerPage");
  itemsPerPageSelect.addEventListener("change", (e) => {
    dashboard.setItemsPerPage(e.target.value);
  });

  // Pagination buttons
  document.getElementById("prevBtn").addEventListener("click", () => {
    dashboard.prevPage();
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    dashboard.nextPage();
  });

  // Sort by column headers
  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.getAttribute("data-column");
      dashboard.sortBy(column);
    });
  });
});
