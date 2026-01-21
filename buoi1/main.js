// câu 1
console.log("Câu 1");

function Product(id, name, price, quantity, category, isAvailable) {
  this.id = id;
  this.name = name;
  this.price = price;
  this.quantity = quantity;
  this.category = category;
  this.isAvailable = isAvailable;
}

console.log(Product);

// câu 2
console.log("Câu 2 (ít nhất 5 sản phẩm, tối thiểu 2 danh mục)");
let products = [
  new Product(0, "Laptop", 1500, 0, "thiết bị", false),
  new Product(1, "Smartphone", 800, 0, "thiết bị", false),
  new Product(2, "Tablet", 600, 5, "thiết bị", true),
  new Product(3, "Áo phông", 50, 25, "quẩn áo", true),
  new Product(4, "Quần jean", 80, 12, "quẩn áo", true),
  new Product(5, "Tai nghe", 200, 10, "phụ kiện", true),
];
console.log(products);

// câu 3
let productInfo = products.map((product) => ({
  name: product.name,
  price: product.price,
}));
console.log("Câu 3 - Mảng (name, price):");
console.log(productInfo);

// câu 4
let availableProducts = products.filter((product) => product.quantity > 0);
console.log("Câu 4 - Sản phẩm có isAvailable là true:", availableProducts);

// câu 5
let hasPriceOver30 = products.some((product) => product.price > 30);
console.log("Câu 5 - Có sản phẩm giá > 30:", hasPriceOver30);

// câu 6
let allphukienAvailable = products
  .filter((product) => product.category === "phụ kiện")
  .every((product) => product.isAvailable);
console.log("Câu 6 - Tất cả phụ kiện đang bán:", allphukienAvailable);

// câu 7
let totalInventoryValue = products.reduce((sum, product) => {
  return sum + product.price * product.quantity;
}, 0);
console.log("Câu 7 - Tổng giá trị kho hàng:", totalInventoryValue);

// câu 8
console.log(
  "Câu 8 - Duyệt với for...of để in ra tên - danh mục- trạng thái(true : còn hàng|| false: hết hàng) của sản phẩm:",
);
for (let product of products) {
  console.log(
    `${product.name} - ${product.category} - ${product.isAvailable ? "true" : "false"}`,
  );
}

// câu 9
console.log(
  "Câu 9 - Duyệt với for...in để in ra tên thuộc tính và các giá trị tương ứng của sản phẩm::",
);
for (let i in products) {
  let product = products[i];
  console.log(
    ` ${product.id} - ${product.name} - ${product.category} - ${product.price} - ${product.quantity} - ${product.isAvailable ? "true" : "false"}`,
  );
}
//cau 10
console.log("Câu 10 - Danh sách sản phẩm đang bán và true:");
let availableProductNames = products
  .filter((product) => product.quantity > 0)
  .map((product) => product.name);

console.log(availableProductNames);
