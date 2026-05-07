import {
    db,
    auth,
    collection,
    onSnapshot,
    orderBy,
    query,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

let allOrders = [];
let currentFilter = "TODOS";
let unsubscribeOrders = null;
let unsubscribeStock = null;
let unavailableIngredients = [];

const ingredientsList = [
    "Molho de tomate",
    "Queijo muçarela",
    "Queijo qualho",
    "Calabresa",
    "Carne de sol",
    "Frango",
    "Presunto",
    "Ovo",
    "Tomate",
    "Cebola",
    "Orégano",
    "Manjericão",
    "Bacon",
    "Pimentão",
    "Filé mignon",
    "Lombo canadense",
    "Carne suína",
    "Costela bovina",
    "Chocolate",
    "Chocolate branco",
    "Morango",
    "Goiabada",
    "Banana",
    "Canela",
    "Doce de leite",
    "M&M",
    "Kit Kat",
    "Batata",
    "Macaxeira",
    "Arroz",
    "Feijão",
    "Farofa",
    "Vinagrete",
    "Nata",
    "Requeijão",
    "Cheddar"
];

const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

function formatPrice(value) {
    const number = Number(value || 0);
    return number.toFixed(2).replace(".", ",");
}

function formatDate(dateValue) {
    if (!dateValue) return "Data não informada";

    const date = new Date(dateValue);

    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function statusLabel(status) {
    const labels = {
        NOVO: "Novo",
        PREPARO: "Em preparo",
        ENTREGA: "Saiu para entrega",
        FINALIZADO: "Finalizado",
        CANCELADO: "Cancelado",
    };

    return labels[status] || status || "Novo";
}

function statusClass(status) {
    return String(status || "NOVO").toLowerCase();
}

function showLogin() {
    loginScreen.classList.remove("hidden");
    adminPanel.classList.add("hidden");

    if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = null;
    }

    if (unsubscribeStock) {
        unsubscribeStock();
        unsubscribeStock = null;
    }
}

function showAdmin() {
    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    listenOrders();
    listenStock();
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    loginError.textContent = "";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginForm.reset();
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        loginError.textContent = "E-mail ou senha inválidos.";
    }
});

async function logoutAdmin() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao sair:", error);
        alert("Erro ao sair do painel.");
    }
}

onAuthStateChanged(auth, user => {
    if (user) {
        showAdmin();
    } else {
        showLogin();
    }
});

function renderSummary(orders) {
    const totalOrders = orders.length;
    const newOrders = orders.filter(order => order.status === "NOVO").length;
    const totalSold = orders
        .filter(order => order.status !== "CANCELADO")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    document.getElementById("totalOrders").textContent = totalOrders;
    document.getElementById("newOrders").textContent = newOrders;
    document.getElementById("totalSold").textContent = `R$ ${formatPrice(totalSold)}`;
}

function getFilteredOrders() {
    if (currentFilter === "TODOS") {
        return allOrders;
    }

    return allOrders.filter(order => order.status === currentFilter);
}

function renderOrders() {
    const ordersContainer = document.getElementById("orders");
    const ordersInfo = document.getElementById("ordersInfo");

    const filteredOrders = getFilteredOrders();

    renderSummary(allOrders);

    if (filteredOrders.length === 0) {
        ordersInfo.textContent = "Nenhum pedido encontrado para este filtro.";
        ordersContainer.innerHTML = `
            <p class="empty-message">
                Nenhum pedido encontrado.
            </p>
        `;
        return;
    }

    ordersInfo.textContent = `${filteredOrders.length} pedido(s) encontrado(s).`;

    ordersContainer.innerHTML = filteredOrders.map(order => `
        <article class="order-card ${statusClass(order.status)}" id="order-${order.id}">
            <div class="order-top">
                <div>
                    <h3>Pedido #${order.shortId}</h3>
                    <p class="order-date">${formatDate(order.criadoEm)}</p>
                </div>

                <span class="status-badge ${statusClass(order.status)}">
                    ${statusLabel(order.status)}
                </span>
            </div>

            <div class="order-info">
                <p><strong>Cliente:</strong> ${order.cliente || "Não informado"}</p>
                <p><strong>Endereço:</strong> ${order.endereco || "Não informado"}</p>
                <p><strong>Pagamento:</strong> ${order.pagamento || "Não informado"}</p>
                ${
                    order.observacoes
                        ? `<p><strong>Observações:</strong> ${order.observacoes}</p>`
                        : ""
                }
                ${
                    order.promocao
                        ? `<p><strong>Promoção:</strong> ${order.promocao.quantidade} refrigerante(s) grátis - ${order.promocao.bebida}</p>`
                        : ""
                }
            </div>

            <div class="order-items">
                <h4>Itens do pedido</h4>
                <ul>
                    ${renderOrderItems(order.itens || [])}
                </ul>
            </div>

            <p class="order-total">
                Total: R$ ${formatPrice(order.total)}
            </p>

            <div class="order-actions">
                <select id="status-${order.id}">
                    <option value="NOVO" ${order.status === "NOVO" ? "selected" : ""}>Novo</option>
                    <option value="PREPARO" ${order.status === "PREPARO" ? "selected" : ""}>Em preparo</option>
                    <option value="ENTREGA" ${order.status === "ENTREGA" ? "selected" : ""}>Saiu para entrega</option>
                    <option value="FINALIZADO" ${order.status === "FINALIZADO" ? "selected" : ""}>Finalizado</option>
                    <option value="CANCELADO" ${order.status === "CANCELADO" ? "selected" : ""}>Cancelado</option>
                </select>

                <button type="button" class="save-btn" onclick="updateOrderStatus('${order.id}')">
                    Salvar status
                </button>

                <button type="button" class="print-btn" onclick="printOrder('${order.id}')">
                    Imprimir
                </button>
            </div>
        </article>
    `).join("");
}

function renderOrderItems(items) {
    if (!items.length) {
        return "<li>Nenhum item informado.</li>";
    }

    return items.map(item => {
        if (item.type === "pizza") {
            return `
                <li>
                    <strong>${item.qty || 1}x ${item.name}</strong><br>
                    Tamanho: ${item.size}<br>
                    ${
                        item.flavor2
                            ? `Sabores: metade ${item.flavor1} / metade ${item.flavor2}<br>`
                            : `Sabor: ${item.flavor1}<br>`
                    }
                    Borda: ${item.edge || "Sem borda"}<br>
                    Valor unitário: R$ ${formatPrice(item.price)}<br>
                    Subtotal: R$ ${formatPrice((item.price || 0) * (item.qty || 1))}
                </li>
            `;
        }

        return `
            <li>
                <strong>${item.qty || 1}x ${item.name}</strong><br>
                ${item.category || ""} ${item.size ? `| ${item.size}` : ""}<br>
                Valor unitário: R$ ${formatPrice(item.price)}<br>
                Subtotal: R$ ${formatPrice((item.price || 0) * (item.qty || 1))}
            </li>
        `;
    }).join("");
}

function listenOrders() {
    if (unsubscribeOrders) {
        return;
    }

    const ordersQuery = query(
        collection(db, "pedidos"),
        orderBy("criadoEm", "desc")
    );

    unsubscribeOrders = onSnapshot(ordersQuery, snapshot => {
        allOrders = snapshot.docs.map(document => {
            const data = document.data();

            return {
                id: document.id,
                shortId: document.id.slice(0, 6).toUpperCase(),
                ...data,
            };
        });

        renderOrders();
    }, error => {
        console.error("Erro ao carregar pedidos:", error);

        document.getElementById("ordersInfo").textContent = "Erro ao carregar pedidos.";
        document.getElementById("orders").innerHTML = `
            <p class="empty-message">
                Erro ao carregar pedidos. Verifique o console.
            </p>
        `;
    });
}

function renderStock() {
    const container = document.getElementById("ingredientsStock");
    const stockInfo = document.getElementById("stockInfo");

    if (!container || !stockInfo) {
        return;
    }

    stockInfo.textContent = `${unavailableIngredients.length} ingrediente(s) indisponível(is).`;

    container.innerHTML = ingredientsList.map(ingredient => {
        const id = normalizeText(ingredient);
        const isUnavailable = unavailableIngredients.some(item => item.id === id);

        return `
            <label class="ingredient-item ${isUnavailable ? "unavailable" : ""}">
                <input
                    type="checkbox"
                    ${isUnavailable ? "checked" : ""}
                    onchange="toggleIngredientAvailability('${id}', '${ingredient}', this.checked)"
                >

                <span>
                    ${ingredient}
                </span>

                <small>
                    ${isUnavailable ? "Indisponível" : "Disponível"}
                </small>
            </label>
        `;
    }).join("");
}

function listenStock() {
    if (unsubscribeStock) {
        return;
    }

    unsubscribeStock = onSnapshot(collection(db, "ingredientesIndisponiveis"), snapshot => {
        unavailableIngredients = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data(),
        }));

        renderStock();
    }, error => {
        console.error("Erro ao carregar estoque:", error);

        document.getElementById("stockInfo").textContent = "Erro ao carregar estoque.";
        document.getElementById("ingredientsStock").innerHTML = `
            <p class="empty-message">
                Erro ao carregar ingredientes.
            </p>
        `;
    });
}

async function toggleIngredientAvailability(id, name, isUnavailable) {
    try {
        if (isUnavailable) {
            await setDoc(doc(db, "ingredientesIndisponiveis", id), {
                nome: name,
                indisponivel: true,
                atualizadoEm: new Date().toISOString(),
            });
        } else {
            await deleteDoc(doc(db, "ingredientesIndisponiveis", id));
        }
    } catch (error) {
        console.error("Erro ao atualizar ingrediente:", error);
        alert("Erro ao atualizar estoque.");
    }
}

function filterStatus(status) {
    currentFilter = status;

    document.querySelectorAll(".filters button").forEach(button => {
        button.classList.remove("active");
    });

    const clickedButton = Array.from(document.querySelectorAll(".filters button"))
        .find(button => button.getAttribute("onclick") === `filterStatus('${status}')`);

    if (clickedButton) {
        clickedButton.classList.add("active");
    }

    renderOrders();
}

async function updateOrderStatus(orderId) {
    const select = document.getElementById(`status-${orderId}`);

    if (!select) {
        alert("Status não encontrado.");
        return;
    }

    const newStatus = select.value;

    try {
        await updateDoc(doc(db, "pedidos", orderId), {
            status: newStatus,
            atualizadoEm: new Date().toISOString(),
        });

        alert("Status atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar status.");
    }
}

function printOrder(orderId) {
    document.querySelectorAll(".order-card").forEach(card => {
        card.classList.remove("printing");
    });

    const orderCard = document.getElementById(`order-${orderId}`);

    if (!orderCard) {
        alert("Pedido não encontrado para impressão.");
        return;
    }

    orderCard.classList.add("printing");
    window.print();

    setTimeout(() => {
        orderCard.classList.remove("printing");
    }, 500);
}

window.filterStatus = filterStatus;
window.updateOrderStatus = updateOrderStatus;
window.printOrder = printOrder;
window.logoutAdmin = logoutAdmin;
window.toggleIngredientAvailability = toggleIngredientAvailability;