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
let allReservations = [];
let currentFilter = "TODOS";
let currentFinanceFilter = "HOJE";
let unsubscribeOrders = null;
let unsubscribeStock = null;
let unsubscribeReservations = null;
let unavailableIngredients = [];
let firstOrderLoad = true;
let knownOrderIds = new Set();

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
    "Cheddar",
    "Coca-Cola Lata",
    "Coca-Cola Zero Lata",
    "Guaraná Lata",
    "Pepsi Lata",
    "Cajuína",
    "Cajuína 1L",
    "Guaraná 1L",
    "Pepsi 1L",
    "Coca-Cola 1L",
    "Coca-Cola Zero 1L",
    "Água mineral",
    "Água com gás",
    "H2O",
    "RED BULL",
    "Ypioca",
    "Pitú",
    "Carangueijo Prata",
    "Carangueijo Ouro",
    "Matuta Prata",
    "Matura Umburana",
    "Samanaú Prata",
    "Samanaú Ouro",
    "Mipibu Ouro",
    "Do Vale Carvalho",
    "Extrema",
    "Del Grano Tinto Suave",
    "Pergola Tinto Suave",
    "Canciller Rosé",
    "Del Grano Tinto Seco",
    "Baden Baden",
    "Laguintas Ipa",
    "Heineken",
    "Heineken Zero",
    "Blue Moon"
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

    if (unsubscribeReservations) {
        unsubscribeReservations();
        unsubscribeReservations = null;
    }
}

function showAdmin() {
    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    listenOrders();
    listenStock();
    listenReservations();
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

function isToday(dateValue) {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const today = new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

function getFinanceFilteredOrders(orders) {
    const now = new Date();

    return orders.filter(order => {
        if (order.status === "CANCELADO") {
            return false;
        }

        if (currentFinanceFilter === "TODOS") {
            return true;
        }

        if (!order.criadoEm) {
            return false;
        }

        const orderDate = new Date(order.criadoEm);

        if (currentFinanceFilter === "HOJE") {
            return (
                orderDate.getDate() === now.getDate() &&
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );
        }

        if (currentFinanceFilter === "SEMANA") {
            const startOfWeek = new Date(startOfWeek.getDate() - diff);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            return orderDate >= startOfWeek && orderDate < endOfWeek;
        }

        if (currentFinanceFilter === "MES") {
            return (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );
        }

        return true;
    });
}

function getFinanceFilterLabel() {
    const labels = {
        HOJE: "Resumo financeiro de hoje",
        SEMANA: "Resumo financeiro desta semana",
        MES: "Resumo financeiro deste mês",
        TODOS: "Resumo financeiro geral",
    };

    return labels[currentFinanceFilter] || "Resumo financeiro";
}

function renderDailyDashboard(orders) {
    const filteredOrders = getFinanceFilteredOrders(orders);

    const totalPeriod = filteredOrders.reduce((sum, order) => {
        return sum + Number(order.total || 0);
    }, 0);

    const averageTicket = filteredOrders.length > 0
        ? totalPeriod / filteredOrders.length
        : 0;

    const pixTotal = filteredOrders
        .filter(order => order.pagamento === "PIX")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const cashTotal = filteredOrders
        .filter(order => order.pagamento === "DINHEIRO")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const cardTotal = filteredOrders
        .filter(order => order.pagamento === "CARTÃO")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    document.getElementById("financeTitle").textContent = getFinanceFilterLabel();
    document.getElementById("financeSubtitle").textContent = `${filteredOrders.length} pedido(s) no período selecionado.`;

    document.getElementById("todayOrders").textContent = filteredOrders.length;
    document.getElementById("todayTotal").textContent = `R$ ${formatPrice(totalPeriod)}`;
    document.getElementById("averageTicket").textContent = `R$ ${formatPrice(averageTicket)}`;
    document.getElementById("pixTotal").textContent = `R$ ${formatPrice(pixTotal)}`;
    document.getElementById("cashTotal").textContent = `R$ ${formatPrice(cashTotal)}`;
    document.getElementById("cardTotal").textContent = `R$ ${formatPrice(cardTotal)}`;
}

function getFilteredOrders() {
    if (currentFilter === "TODOS") {
        return allOrders;
    }

    return allOrders.filter(order => order.status === currentFilter);
}

function onlyNumbers(value) {
    return String(value || "").replace(/\D/g, "");
}

function openClientWhatsApp(phone, clientName) {
    const phoneNumbers = onlyNumbers(phone);

    if (!phoneNumbers) {
        alert("Número de telefone do cliente não informado.");
        return;
    }

    const finalPhone = phoneNumbers.startsWith("55")
        ? phoneNumbers
        : `55${phoneNumbers}`;

    const message = encodeURIComponent(
        `Olá ${clientName || "tudo bem"}!, aqui é do Cabocos Bar! Estamos entrando em contato sobre o seu pedido.`
    )

    window.open(`https://wa.me/${finalPhone}?text=${message}`, "_blank");
}

function getStatusTimestampField(status) {
    const fields = {
        PREPARO: "preparouEm",
        ENTREGA: "saiuParaEntregaEm",
        FINALIZADO: "finalizadoEm",
        CANCELADO: "canceladoEm",
    };

    return fields[status] || null;
}

function renderStatusTimes(order) {
    const times = [];

    if (order.preparouEm) {
        times.push(`<p><strong>Em preparo:</strong> ${formatDate(order.preparouEm)}</p>`);
    }

    if (order.saiuParaEntregaEm) {
        times.push(`<p><strong>Saiu para entrega:</strong> ${formatDate(order.saiuParaEntregaEm)}</p>`);
    }

    if (order.finalizadoEm) {
        times.push(`<p><strong>Finalizado:</strong> ${formatDate(order.finalizadoEm)}</p>`);
    }

    if (order.canceladoEm) {
        times.push(`<p><strong>Cancelado:</strong> ${formatDate(order.canceladoEm)}</p>`);
    }

    return times.length
        ? `<div class="status-times">${times.join("")}</div>`
        : "";
}


function renderOrders() {
    const ordersContainer = document.getElementById("orders");
    const ordersInfo = document.getElementById("ordersInfo");

    const filteredOrders = getFilteredOrders();

    renderSummary(allOrders);
    renderDailyDashboard(allOrders);

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
                <p><strong>WhatsApp:</strong> ${order.telefone || "Não informado"}</p>
                <p><strong>Tipo:</strong> ${order.tipoEntrega || "Entrega"}</p>
                <p><strong>Endereço:</strong> ${order.endereco || "Não informado"}</p>
                <p><strong>Pagamento:</strong> ${order.pagamento || "Não informado"}</p>

                ${order.telefone
            ? `<button 
            type="button" 
            class="whatsapp-client-btn" 
            onclick="openClientWhatsApp('${order.telefone}', '${order.cliente || ""}')"
        >
            Chamar cliente no WhatsApp
        </button>`
            : ""
        }
                ${order.observacoes
            ? `<p><strong>Observações:</strong> ${order.observacoes}</p>`
            : ""
        }
                ${order.promocao
            ? `<p><strong>Promoção:</strong> ${order.promocao.quantidade} refrigerante(s) grátis - ${order.promocao.bebida}</p>`
            : ""
        }

        ${renderStatusTimes(order)}
            </div>

            <div class="order-items">
                <h4>Itens do pedido</h4>
                <ul>
                    ${renderOrderItems(order.itens || [])}
                </ul>
            </div>

            <div class="order-price-summary">
                <p>Subtotal: R$ ${formatPrice(order.subtotal || order.total)}</p>
                <p>Taxa Sítio Morcego: R$ ${formatPrice(order.taxaEntrega || 0)}</p>
                <strong>Total: R$ ${formatPrice(order.total)}</strong>
            </div>

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
                    ${item.flavor2
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

function notifyNewOrder(orderId) {
    const alertBox = document.getElementById("newOrderAlert");
    const sound = document.getElementById("newOrderSound");

    if (alertBox) {
        alertBox.classList.remove("hidden");
        alertBox.classList.add("show");

        setTimeout(() => {
            alertBox.classList.add("hidden");
            alertBox.classList.remove("show");
        }, 5000);
    }

    if (sound) {
        sound.currentTime = 0;

        sound.play().catch(() => {
            console.warn("O navegador bloqueou o som até haver interação com a página.");
        });
    }

    const orderCard = document.getElementById(`order-${orderId}`);

    if (orderCard) {
        orderCard.classList.add("new-order-highlight");

        setTimeout(() => {
            orderCard.classList.remove("new-order-highlight");
        }, 7000);
    }
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
        const previousOrderIds = new Set(knownOrderIds);

        allOrders = snapshot.docs.map(document => {
            const data = document.data();

            return {
                id: document.id,
                shortId: document.id.slice(0, 6).toUpperCase(),
                ...data,
            };
        });

        knownOrderIds = new Set(allOrders.map(order => order.id));

        const newOrders = allOrders.filter(order =>
            !previousOrderIds.has(order.id)
        );

        renderOrders();

        if (!firstOrderLoad && newOrders.length > 0) {
            notifyNewOrder(newOrders[0].id);
        }

        firstOrderLoad = false;
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

function reservationStatusLabel(status) {
    const labels = {
        NOVA: "Nova",
        CONFIRMADA: "Confirmada",
        CANCELADA: "Cancelada",
    };

    return labels[status] || status || "Nova";
}

function reservationStatusClass(status) {
    return String(status || "NOVA").toLowerCase();
}

function listenReservations() {
    if (unsubscribeReservations) {
        return;
    }

    const reservationsQuery = query(
        collection(db, "reservas"),
        orderBy("criadoEm", "desc")
    );

    unsubscribeReservations = onSnapshot(reservationsQuery, snapShot => {
        allReservations = snapShot.docs.map(document => {
            const data = document.data();

            return {
                id: document.id,
                shortId: document.id.slice(0, 6).toLowerCase(),
                ...data,
            };
        });

        renderReservations();
    }, error => {
        console.error("Erro ao carregar reservar", error);

        document.getElementById("reservationInfo").textContent = "Erro ao carregar reservas";
        document.getElementById("reservationsList").innerHTML = `
            <p class="empty-message">
                Erro ao carregar reservas. Verifique o console.
            </p>
        `;
    });
}

function renderReservations() {
    const container = document.getElementById("reservationsList");
    const info = document.getElementById("reservationInfo");

    if (!container || !info) {
        return;
    }

    if (allReservations.length === 0) {
        info.textContent = "Nenhuma reserva encontrada";
        container.innerHTML = `
            <p class="empty-message">
                Nenhuma reserva solicitada até o momento.
            </p>
        `;
        return;
    }

    const pendingReservations = allReservations.filter(reservation =>
        reservation.status === "NOVA"
    ).length;

    info.textContent = `${allReservations.length} reserva(s), ${pendingReservations} nova(s).`;

    container.innerHTML = allReservations.map(reservation => `
        <article class="reservation-card ${reservationStatusClass(reservation.status)}">
            <div class="reservation-top">
                <div>
                    <h3>Reserva #${reservation.shortId}</h3>
                    <p>${formatDate(reservation.criadoEm)}</p>
                </div>

                <span class="reservation-badge ${reservationStatusClass(reservation.status)}">
                    ${reservationStatusLabel(reservation.status)}
                </span>
            </div>

            <div class="reservation-info-box">
                <p><strong>Nome:</strong> ${reservation.nome || "Não informado"}</p>
                <p><strong>Telefone:</strong> ${reservation.telefone || "Não informado"}</p>
                <p><strong>Data:</strong> ${reservation.data || "Não informada"}</p>
                <p><strong>Horário:</strong> ${reservation.horario || "Não informado"}</p>
                <p><strong>Pessoas:</strong> ${reservation.pessoas || "Não informado"}</p>
                <p><strong>Tipo:</strong> ${reservation.tipo || "Não informado"}</p>
                ${reservation.observacoes
            ? `<p><strong>Observações:</strong> ${reservation.observacoes}</p>`
            : ""
        }
            </div>

            <div class="reservation-actions">
                <select id="reservation-status-${reservation.id}">
                    <option value="NOVA" ${reservation.status === "NOVA" ? "selected" : ""}>Nova</option>
                    <option value="CONFIRMADA" ${reservation.status === "CONFIRMADA" ? "selected" : ""}>Confirmada</option>
                    <option value="CANCELADA" ${reservation.status === "CANCELADA" ? "selected" : ""}>Cancelada</option>
                </select>

                <button type="button" class="save-btn" onclick="updateReservationStatus('${reservation.id}')">
                    Salvar status
                </button>
            </div>
        </article>
    `).join("");
}

async function updateReservationStatus(reservationId) {
    const select = document.getElementById(`reservation-status-${reservationId}`);

    if (!select) {
        alert("Status da reserva não encontrado.");
        return;
    }

    try {
        await updateDoc(doc(db, "reservas", reservationId), {
            status: select.value,
            atualizadoEm: new Date().toISOString(),
        });

        alert("Status da reserva atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar reserva:", error);
        alert("Erro ao atualizar reserva.");
    }
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

function filterFinance(period) {
    currentFilter = period;

    document.querySelectorAll(".finance-filters button").forEach(button => {
        button.classList.remove("active");
    });

    const clickedButton = Array.from(document.querySelectorAll(".finance-filters button"))
        .find(button => button.getAttribute("onclick") === `filterFinance('${period}')`);

    if (clickedButton) {
        clickedButton.classList.add("active");
    }

    renderDailyDashboard(allOrders);
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
    const timestampField = getStatusTimestampField(newStatus);

    const updateData = {
        status: newStatus,
        atualizadoEm: new Date().toISOString(),
    };

    if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
    }

    try {
        await updateDoc(doc(db, "pedidos", orderId), updateData);

        alert("Status atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar status.");
    }
}

function printOrder(orderId) {
    const order = allOrders.find(item => item.id === orderId);

    if (!order) {
        alert("Pedido não encontrado para impressão");
        return;
    }

    const printArea = document.getElementById("printArea");

    if (!printArea) {
        alert("Área de impressão não encontrada");
        return;
    }

    printArea.innerHTML = buildPrintReceipt(order);

    window.print();

    setTimeout(() => {
        printArea.innerHTML = "";
    }, 500);
}

function buildPrintReceipt(order) {
    return `
        <div class="receipt">
            <div class="receipt-header">
            <h1>Cabocos Bar</h1>
            <p>Pizzaria & Pastelaria</p>
            <strong>COMANDA DE PEDIDO</strong>
        </div>

        <div class="receipt-section">
            <p><strong>Pedido:</strong> #${order.shortId}</p>
            <p><strong>Data:</strong> ${formatDate(order.criadoEm)}</p>
            <p><strong>Status:</strong> ${statusLabel(order.status)}</p>
        </div>

        <div class="receipt-section">
            <p><strong>Cliente:</strong> ${order.cliente || "Não informado"}</p>
            <p><strong>WhatsApp:</strong> ${order.telefone || "Não informado"}</p>
            <p><strong>Tipo:</strong> ${order.tipoEntrega || "Entrega"}</p>
            <p><strong>Endereço:</strong> ${order.endereco || "Não informado"}</p>
            <p><strong>Pagamento:</strong> ${order.pagamento || "Não informado"}</p>
        </div>

        ${order.observacoes
            ? `
                    <div class="receipt-section">
                        <strong>Observações:</strong>
                        <p>${order.observacoes}</p>
                    </div>
                `
            : ""
        }
        ${order.promocao
            ? `
                        <div class="receipt-section">
                            <strong>Promoção:</strong>
                            <p>${order.promocao.quantidade} refrigerante(s) grátis</p>
                            <p>Bebida: ${order.promocao.bebida}</p>
                        </div>
                    `
            : ""
        }

        <div class="receipt-section">
            <h2>Itens</h2>
            ${buildPrintItems(order.itens || [])}
        </div>

        <div class="receipt-section">
            <p><strong>Subtotal:</strong> R$ ${formatPrice(order.subtotal || order.total)}</p>
            <p><strong>Taxa Sítio Morcego:</strong> R$ ${formatPrice(order.taxaEntrega || 0)}</p>
        </div>

        <div class="receipt-total">
            TOTAL: R$ ${formatPrice(order.total)}
        </div>

        <div class="receipt-footer">
            <p>Impresso em ${formatDate(new Date().toISOString())}</p>
        </div>
    </div>
    `;
}

function buildPrintItems(items) {
    if (!items.length) {
        return `<p>Nenhum item informado.</p>`;
    }

    return items.map(item => {
        if (item.type === "pizza") {
            return `
                <div class="receipt-item">
                    <strong>${item.qty || 1}x ${item.name}</strong>
                    <p>Tamanho: ${item.size}</p>
                    ${item.flavor2
                    ? `<p>Sabores: metade ${item.flavor1} / metade ${item.flavor2}</p>`
                    : `<p>Sabor: ${item.flavor1}</p>`
                }
                    <p>Borda: ${item.edge || "Sem borda"}</p>
                    <p>Unitário: R$ ${formatPrice(item.price)}</p>
                    <p>Subtotal: R$ ${formatPrice((item.price || 0) * (item.qty || 1))}</p>
                </div>
            `;
        }

        return `
            <div class="receipt-item">
                <strong>${item.qty || 1}x ${item.name}</strong>
                <p>${item.category || ""} ${item.size ? `| ${item.size}` : ""}</p>
                <p>Unitário: R$ ${formatPrice(item.price)}</p>
                <p>Subtotal: R$ ${formatPrice((item.price || 0) * (item.qty || 1))}</p>
            </div>
        `;
    }).join("");
}

window.filterStatus = filterStatus;
window.updateOrderStatus = updateOrderStatus;
window.printOrder = printOrder;
window.logoutAdmin = logoutAdmin;
window.toggleIngredientAvailability = toggleIngredientAvailability;
window.updateReservationStatus = updateReservationStatus;
window.openClientWhatsApp = openClientWhatsApp;
window.filterFinance = filterFinance;