import { db, collection, addDoc } from "./firebase.js";


const EDGES = [
    { name: "Sem borda", price: 0 },
    { name: "Requeijão", price: 0 },
    { name: "Cheddar", price: 0 },
    { name: "Chocolate", price: 8 },
    { name: "Chocolate branco", price: 8 },
    { name: "Doce de leite", price: 8 },
    { name: "Cheddar com bacon", price: 10 },
];

const menu = [
    {
        category: "Para encher o bucho",
        items: [
            { name: "Filé Cabocos", desc: "300g de filé mignon, batata frita e arroz.", options: [{ label: "Unidade", price: 55 }] },
            { name: "Filé Sertanejo", desc: "300g de filé mignon, queijo qualho e batata frita.", options: [{ label: "Unidade", price: 55 }] },
            { name: "Carne de sol nata", desc: "Carne de sol desfiada na nata, macaxeira frita e arroz de leite.", options: [{ label: "Unidade", price: 40 }] },
            { name: "Tripa", desc: "300g de tripa, feijão, batata doce, vinagrete e farofa.", options: [{ label: "Unidade", price: 40 }] },
            { name: "Calabresa acebolada", desc: "300g de calabresa acebolada, vinagrete e farofa.", options: [{ label: "Unidade", price: 30 }] },
            { name: "Quarteto arretado", desc: "150g de filé mignon, 150g de calabresa, 150g de frango empanado e batata frita.", options: [{ label: "Unidade", price: 55 }] },
        ],
    },
    {
        category: "Para beliscar",
        items: [
            { name: "Batata frita", desc: "300g de batata frita.", options: [{ label: "Unidade", price: 15 }] },
            { name: "Batata cheddar bacon", desc: "300g de batata frita com cheddar cremoso e bacon.", options: [{ label: "Unidade", price: 20 }] },
            { name: "Batata Cabocos", desc: "300g de batata frita e carne de sol desfiada na nata.", options: [{ label: "Unidade", price: 25 }] },
            { name: "Macaxeira frita", desc: "300g de macaxeira frita na manteiga da terra.", options: [{ label: "Unidade", price: 18 }] },
            { name: "Caldo", desc: "500ml de caldo.", options: [{ label: "Unidade", price: 10 }] },
            { name: "Porreta", desc: "300g de macaxeira frita na manteiga da terra e costela bovina desfiada.", options: [{ label: "Unidade", price: 25 }] },
            { name: "Batata suína", desc: "300g de batata frita e carne suína desfiada no barbecue.", options: [{ label: "Unidade", price: 25 }] },
        ],
    },
    {
        category: "Pizzas tradicionais",
        items: [
            { name: "Seridó", desc: "Molho de tomate, queijo muçarela, calabresa, cebolas e orégano.", options: pizzaTradicional() },
            { name: "Sertaneja", desc: "Molho de tomate, queijo muçarela, carne de sol, requeijão, cebolas e orégano.", options: pizzaTradicional() },
            { name: "Soledade", desc: "Molho de tomate, queijo muçarela, frango, requeijão, cebolas e orégano.", options: pizzaTradicional() },
            { name: "Cabugi", desc: "Molho de tomate, queijo muçarela, presunto, ovo, tomate, cebolas e orégano.", options: pizzaTradicional() },
            { name: "Potengi", desc: "Molho de tomate, queijo muçarela, manjericão, tomate e orégano.", options: pizzaTradicional() },
        ],
    },
    {
        category: "Pizzas especiais",
        items: [
            { name: "Cariri", desc: "Molho de tomate, queijo muçarela, calabresa, bacon, cebolas e orégano.", options: pizzaEspecial() },
            { name: "Nordestina", desc: "Molho de tomate, queijo muçarela, carne de sol, bacon, pimentão, tomate, cebolas e orégano.", options: pizzaEspecial() },
            { name: "Caipira", desc: "Molho de tomate, queijo muçarela, frango, bacon, cebolas e orégano.", options: pizzaEspecial() },
            { name: "Cabôco's", desc: "Molho de tomate, queijo qualho, carne de sol na nata, tomate, cebolas e orégano.", options: pizzaEspecial() },
            { name: "Arretada", desc: "Molho de tomate, queijo muçarela, filé mignon, cebolas e orégano.", options: pizzaEspecial() },
            { name: "Agreste", desc: "Molho de tomate, queijo muçarela, lombo canadense, cebolas e orégano.", options: pizzaEspecial() },
            { name: "Arerê", desc: "Molho de tomate, queijo muçarela, carne suína desfiada no barbecue, cebolas, tomate e orégano.", options: pizzaEspecial() },
            { name: "Mandacaru", desc: "Molho de tomate, queijo qualho, costela bovina desfiada, cebolas, tomate e orégano.", options: pizzaEspecial() },
        ],
    },
    {
        category: "Pizzas doces",
        items: [
            { name: "Xique-Xique", desc: "Chocolate e morango.", options: pizzaEspecial() },
            { name: "Romeu & Julieta", desc: "Queijo muçarela e goiabada.", options: pizzaEspecial() },
            { name: "M&M", desc: "Chocolate e M&M.", options: pizzaEspecial() },
            { name: "Banana Nervada", desc: "Banana cortada em rodelas, chocolate branco gratinado e canela em pó.", options: pizzaEspecial() },
            { name: "Dois Amores", desc: "Chocolate e chocolate branco.", options: pizzaEspecial() },
            { name: "Trio Nordestino", desc: "Queijo qualho, doce de leite e goiabada.", options: pizzaEspecial() },
        ],
    },
    {
        category: "Pastéis salgados",
        items: [
            { name: "Cabocos", desc: "Carne de sol, queijo muçarela, presunto, cebola, tomate e requeijão.", options: pastelCabocos() },
            { name: "Arretado", desc: "Carne de sol, cebola, tomate e requeijão.", options: pastelPadrao() },
            { name: "Magão", desc: "Frango, cebola, tomate e requeijão.", options: pastelPadrao() },
            { name: "Pizza", desc: "Queijo muçarela, presunto, requeijão, molho de tomate, cebola, tomate e orégano.", options: pastelPadrao() },
            { name: "Sertanejo", desc: "Carne de sol e queijo qualho.", options: pastelPadrao() },
            { name: "Calabresa à moda da casa", desc: "Calabresa acebolada e requeijão.", options: pastelPadrao() },
            { name: "Curisco", desc: "Carne de sol na nata, queijo qualho, cebola e tomate.", options: pastelPadrao() },
            { name: "Matuto", desc: "Costela bovina desfiada, queijo qualho, cebola e tomate.", options: pastelPadrao() },
            { name: "Candieiro", desc: "Carne suína desfiada no barbecue, requeijão, cebola e tomate.", options: pastelPadrao() },
        ],
    },
    {
        category: "Pastéis doces",
        items: [
            { name: "Lampião & Maria Bonita", desc: "Doce de leite e goiabada.", options: pastelPadrao() },
            { name: "Cuó", desc: "Chocolate e morango.", options: pastelPadrao() },
            { name: "Trairi", desc: "Chocolate e Kit Kat.", options: pastelPadrao() },
            { name: "Caiçara", desc: "Queijo qualho, doce de leite e goiabada.", options: pastelPadrao() },
            { name: "Marmeleiro", desc: "Queijo muçarela e goiabada.", options: pastelPadrao() },
            { name: "Mulungu", desc: "Chocolate branco, banana e canela em pó.", options: pastelPadrao() },
            { name: "Macambira", desc: "Chocolate e M&M.", options: pastelPadrao() },
        ],
    },
];

const mainCategories = [
    {
        name: "Pizzas",
        description: "Tradicionais, especiais e doces.",
        sections: ["Pizzas tradicionais", "Pizzas especiais", "Pizzas doces"],
    },
    {
        name: "Pastéis",
        description: "Pastéis salgados e doces.",
        sections: ["Pastéis salgados", "Pastéis doces"],
    },
    {
        name: "Para beliscar",
        description: "Petiscos e porções.",
        sections: ["Para beliscar"],
    },
    {
        name: "Para encher o bucho",
        description: "Pratos maiores da casa.",
        sections: ["Para encher o bucho"],
    },
];

let cart = [];
let currentPizza = null;
let selectedMainCategory = null;
let selectedSubCategory = null;

function pizzaTradicional() {
    return [
        { label: "P", price: 27 },
        { label: "M", price: 32 },
        { label: "G", price: 40 },
    ];
}

function pizzaEspecial() {
    return [
        { label: "P", price: 28 },
        { label: "M", price: 33 },
        { label: "G", price: 42 },
    ];
}

function pastelPadrao() {
    return [
        { label: "M", price: 15 },
        { label: "G", price: 20 },
    ];
}

function pastelCabocos() {
    return [
        { label: "M", price: 18 },
        { label: "G", price: 23 },
    ];
}

function formatPrice(value) {
    return value.toFixed(2).replace(".", ",");
}

function isPizzaCategory(category) {
    return category.toLowerCase().includes("pizza");
}

function getAllPizzaFlavors() {
    return menu
        .filter(section => isPizzaCategory(section.category))
        .flatMap(section =>
            section.items.map(item => ({
                name: item.name,
                category: section.category,
                options: item.options,
            }))
        );
}

function getPizzaPriceBySize(flavorName, size) {
    const flavor = getAllPizzaFlavors().find(item => item.name === flavorName);
    if (!flavor) return 0;

    const option = flavor.options.find(opt => opt.label === size);
    return option ? option.price : 0;
}

function getEdgePrice(edgeName) {
    const edge = EDGES.find(item => item.name === edgeName);
    return edge ? edge.price : 0;
}

function isThursday() {
    return new Date().getDay() === 4;
}

function getPromotionPizzaGCount() {
    if (!isThursday()) return 0;

    return cart.reduce((total, item) => {
        if (item.type === "pizza" && item.size === "G") {
            return total + item.qty;
        }

        return total;
    }, 0);
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCategories() {
    const container = document.getElementById("categories");

    container.innerHTML = mainCategories.map(category => `
    <button 
      onclick="selectMainCategory('${category.name}')"
      class="${selectedMainCategory === category.name ? "active" : ""}"
    >
      ${category.name}
    </button>
  `).join("");
}

function renderMenu() {
    const container = document.getElementById("menu");

    if (!selectedMainCategory) {
        container.innerHTML = `
      <h2 class="category-title">Escolha uma opção</h2>

      ${mainCategories.map(category => `
        <article class="card">
          <h3>${category.name}</h3>
          <p>${category.description}</p>

          <div class="options">
            <button onclick="selectMainCategory('${category.name}')">
              Ver ${category.name}
            </button>
          </div>
        </article>
      `).join("")}
    `;
        return;
    }

    const main = mainCategories.find(category => category.name === selectedMainCategory);

    if (!main) return;

    if (!selectedSubCategory && main.sections.length > 1) {
        container.innerHTML = `
      <button class="back-btn" onclick="goBackMenu()">← Voltar</button>
      <h2 class="category-title">${selectedMainCategory}</h2>

      ${main.sections.map(sectionName => `
        <article class="card">
          <h3>${sectionName}</h3>
          <p>Clique para ver os produtos.</p>

          <div class="options">
            <button onclick="selectSubCategory('${sectionName}')">
              Ver opções
            </button>
          </div>
        </article>
      `).join("")}
    `;
        return;
    }

    const sectionName = selectedSubCategory || main.sections[0];
    const section = menu.find(item => item.category === sectionName);

    if (!section) {
        container.innerHTML = `
      <button class="back-btn" onclick="goBackMenu()">← Voltar</button>
      <h2 class="category-title">Categoria não encontrada</h2>
    `;
        return;
    }

    container.innerHTML = `
    <button class="back-btn" onclick="goBackMenu()">← Voltar</button>
    <h2 class="category-title">${section.category}</h2>

    ${section.items.map(item => `
      <article class="card">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>

        <div class="options">
          ${isPizzaCategory(section.category)
            ? `<button onclick="openPizzaModal('${item.name}')">
                  Escolher ${item.name}
                </button>`
            : item.options.map(option => `
                  <button onclick="addToCart({
                    type: 'normal',
                    category: '${section.category}',
                    name: '${item.name}',
                    size: '${option.label}',
                    price: ${option.price}
                  })">
                    ${option.label} - R$ ${formatPrice(option.price)}
                  </button>
                `).join("")
        }
        </div>
      </article>
    `).join("")}
  `;
}

function selectMainCategory(name) {
    selectedMainCategory = name;
    selectedSubCategory = null;
    renderCategories();
    renderMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectSubCategory(name) {
    selectedSubCategory = name;
    renderMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBackMenu() {
    if (selectedSubCategory) {
        selectedSubCategory = null;
    } else {
        selectedMainCategory = null;
    }

    renderCategories();
    renderMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function addToCart(product) {
    const key = product.key || `${product.type}-${product.name}-${product.size}-${product.price}`;
    const existing = cart.find(item => item.key === key);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, key, qty: 1 });
    }

    updateCart();
    openCart();
}

function updateCart() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");
    const promoBox = document.getElementById("promoBox");

    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Seu carrinho está vazio.</p>";
        cartTotal.textContent = "0,00";

        if (promoBox) {
            promoBox.classList.add("hidden");
            promoBox.innerHTML = "";
        }

        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <strong>${item.name}</strong>
      <p>${getItemDetails(item)}</p>
      <p>R$ ${formatPrice(item.price)} x ${item.qty}</p>
      <p>Subtotal: R$ ${formatPrice(item.price * item.qty)}</p>

      <div class="cart-actions">
        <button type="button" onclick="changeQty(${index}, -1)">-</button>
        <button type="button" onclick="changeQty(${index}, 1)">+</button>
        <button type="button" onclick="removeItem(${index})">Remover</button>
      </div>
    </div>
  `).join("");

    const promoQty = getPromotionPizzaGCount();

    if (promoBox) {
        if (promoQty > 0) {
            promoBox.classList.remove("hidden");
            promoBox.innerHTML = `
        <strong>Promoção de quinta-feira</strong>
        <p>Você ganhou ${promoQty} refrigerante(s) de 1L.</p>
        <label>Escolha o refrigerante:</label>
        <select id="promoDrink">
          <option value="Guaraná 1L">Guaraná 1L</option>
          <option value="Pepsi 1L">Pepsi 1L</option>
        </select>
      `;
        } else {
            promoBox.classList.add("hidden");
            promoBox.innerHTML = "";
        }
    }

    cartTotal.textContent = formatPrice(calculateTotal());
}

function getItemDetails(item) {
    if (item.type === "pizza") {
        let details = `Tamanho ${item.size}`;

        if (item.flavor2) {
            details += ` | Meia ${item.flavor1} / Meia ${item.flavor2}`;
        } else {
            details += ` | Sabor ${item.flavor1}`;
        }

        details += ` | Borda: ${item.edge}`;

        if (item.edgePrice > 0) {
            details += ` (+R$ ${formatPrice(item.edgePrice)})`;
        }

        return details;
    }

    return `${item.category} | ${item.size}`;
}

function changeQty(index, amount) {
    cart[index].qty += amount;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function openCart() {
    document.getElementById("cartModal").classList.add("show");
}

function closeCart() {
    document.getElementById("cartModal").classList.remove("show");
}

function openPizzaModal(selectedFlavor) {
    currentPizza = { selectedFlavor };

    const pizzaSize = document.getElementById("pizzaSize");
    const pizzaFlavor1 = document.getElementById("pizzaFlavor1");
    const pizzaFlavor2 = document.getElementById("pizzaFlavor2");
    const pizzaEdge = document.getElementById("pizzaEdge");

    const allFlavors = getAllPizzaFlavors();

    pizzaSize.innerHTML = `
    <option value="P">P</option>
    <option value="M">M</option>
    <option value="G">G</option>
  `;

    pizzaFlavor1.innerHTML = allFlavors.map(flavor => `
    <option value="${flavor.name}" ${flavor.name === selectedFlavor ? "selected" : ""}>
      ${flavor.name}
    </option>
  `).join("");

    pizzaFlavor2.innerHTML = `
    <option value="">Somente esse sabor</option>
    ${allFlavors.map(flavor => `
      <option value="${flavor.name}">
        Adicionar metade ${flavor.name}
      </option>
    `).join("")}
  `;

    pizzaEdge.innerHTML = EDGES.map(edge => `
    <option value="${edge.name}">
      ${edge.name}${edge.price > 0 ? ` + R$ ${formatPrice(edge.price)}` : ""}
    </option>
  `).join("");

    pizzaSize.onchange = updatePizzaPreview;
    pizzaFlavor1.onchange = updatePizzaPreview;
    pizzaFlavor2.onchange = updatePizzaPreview;
    pizzaEdge.onchange = updatePizzaPreview;

    updatePizzaPreview();
    document.getElementById("pizzaModal").classList.add("show");
}

function closePizzaModal() {
    document.getElementById("pizzaModal").classList.remove("show");
}

function updatePizzaPreview() {
    const size = document.getElementById("pizzaSize").value;
    const flavor1 = document.getElementById("pizzaFlavor1").value;
    const flavor2 = document.getElementById("pizzaFlavor2").value;
    const edge = document.getElementById("pizzaEdge").value;

    const price1 = getPizzaPriceBySize(flavor1, size);
    const price2 = flavor2 ? getPizzaPriceBySize(flavor2, size) : 0;
    const basePrice = Math.max(price1, price2);
    const edgePrice = getEdgePrice(edge);
    const total = basePrice + edgePrice;

    let text = `Tamanho: ${size}<br>`;

    text += flavor2
        ? `Sabores: metade ${flavor1} / metade ${flavor2}<br>`
        : `Sabor: ${flavor1}<br>`;

    text += `Borda: ${edge}<br>`;
    text += `Preço da pizza: R$ ${formatPrice(basePrice)}<br>`;

    if (edgePrice > 0) {
        text += `Adicional da borda: R$ ${formatPrice(edgePrice)}<br>`;
    }

    text += `<strong>Total: R$ ${formatPrice(total)}</strong>`;

    document.getElementById("pizzaPreview").innerHTML = text;
}

function confirmPizza() {
    const size = document.getElementById("pizzaSize").value;
    const flavor1 = document.getElementById("pizzaFlavor1").value;
    const flavor2 = document.getElementById("pizzaFlavor2").value;
    const edge = document.getElementById("pizzaEdge").value;

    if (flavor2 && flavor1 === flavor2) {
        alert("Escolha sabores diferentes ou deixe como somente um sabor.");
        return;
    }

    const price1 = getPizzaPriceBySize(flavor1, size);
    const price2 = flavor2 ? getPizzaPriceBySize(flavor2, size) : 0;
    const basePrice = Math.max(price1, price2);
    const edgePrice = getEdgePrice(edge);
    const finalPrice = basePrice + edgePrice;

    const pizzaName = flavor2
        ? `Pizza metade ${flavor1} / metade ${flavor2}`
        : `Pizza ${flavor1}`;

    addToCart({
        type: "pizza",
        category: "Pizza",
        name: pizzaName,
        size,
        flavor1,
        flavor2,
        edge,
        edgePrice,
        price: finalPrice,
        key: `pizza-${size}-${flavor1}-${flavor2 || "inteira"}-${edge}`,
    });

    closePizzaModal();
}

document.getElementById("paymentMethod").addEventListener("change", function () {
    const pixBox = document.getElementById("pixBox");

    if (this.value === "Pix") {
        pixBox.classList.remove("hidden");
        document.getElementById("pixProof").setAttribute("required", "required");
    } else {
        pixBox.classList.add("hidden");
        document.getElementById("pixProof").removeAttribute("required");
    }
});

document.getElementById("orderForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Adicione pelo menos um item ao carrinho.");
        return;
    }

    const name = document.getElementById("clientName").value.trim();
    const address = document.getElementById("clientAddress").value.trim();
    const obs = document.getElementById("clientObs").value.trim();
    const payment = document.getElementById("paymentMethod").value;
    const pixProof = document.getElementById("pixProof").files[0];

    if (payment === "Pix" && !pixProof) {
        alert("Para pagamento via Pix, selecione o comprovante antes de continuar.");
        return;
    }

    const total = calculateTotal();
    const promoQty = getPromotionPizzaGCount();
    const promoDrink = document.getElementById("promoDrink")?.value || "";

    const orderData = {
        cliente: name,
        endereco: address,
        observacoes: obs,
        pagamento: payment,
        itens: cart.map(item => ({ ...item })),
        total,
        promocao: promoQty > 0
            ? {
                quantidade: promoQty,
                bebida: promoDrink,
            }
            : null,
        status: "NOVO",
        criadoEm: new Date().toISOString(),
    };

    try {
    await addDoc(collection(db, "pedidos"), orderData);

    alert("Pedido enviado com sucesso!");

    cart = [];
    updateCart();
    closeCart();

    document.getElementById("orderForm").reset();
    document.getElementById("pixBox").classList.add("hidden");

} catch (error) {
    console.error("Erro ao salvar pedido:", error);
    alert("Erro ao enviar pedido.");
}

    console.log("Pedido finalizado:", orderData);

    alert("Pedido finalizado com sucesso!");

    cart = [];
    updateCart();
    closeCart();

    document.getElementById("orderForm").reset();
    document.getElementById("pixBox").classList.add("hidden");
});

renderCategories();
renderMenu();
updateCart();