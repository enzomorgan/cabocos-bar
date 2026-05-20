import { db, collection, addDoc, onSnapshot } from "./firebase.js";

const WHATSAPP_NUMBER = "5584999316294";

let unavailableIngredients = [];

const EDGES = [
    { name: "Sem borda", price: 0, ingredients: [] },
    { name: "Requeijão", price: 0, ingredients: ["Requeijão"] },
    { name: "Cheddar", price: 0, ingredients: ["Cheddar"] },
    { name: "Chocolate", price: 8, ingredients: ["Chocolate"] },
    { name: "Chocolate branco", price: 8, ingredients: ["Chocolate branco"] },
    { name: "Doce de leite", price: 8, ingredients: ["Doce de leite"] },
    { name: "Cheddar com bacon", price: 10, ingredients: ["Cheddar", "Bacon"] },
];

const menu = [
    {
        category: "Para encher o bucho",
        items: [
            {
                name: "Filé Cabocos",
                desc: "300g de filé mignon, batata frita e arroz.",
                ingredients: ["Filé mignon", "Batata", "Arroz"],
                options: [{ label: "Unidade", price: 55 }]
            },
            {
                name: "Filé Sertanejo",
                desc: "300g de filé mignon, queijo qualho e batata frita.",
                ingredients: ["Filé mignon", "Queijo qualho", "Batata"],
                options: [{ label: "Unidade", price: 55 }]
            },
            {
                name: "Carne de sol nata",
                desc: "Carne de sol desfiada na nata, macaxeira frita e arroz de leite.",
                ingredients: ["Carne de sol", "Nata", "Macaxeira", "Arroz"],
                options: [{ label: "Unidade", price: 40 }]
            },
            {
                name: "Tripa",
                desc: "300g de tripa, feijão, batata doce, vinagrete e farofa.",
                ingredients: ["Tripa", "Feijão", "Batata", "Vinagrete", "Farofa"],
                options: [{ label: "Unidade", price: 40 }]
            },
            {
                name: "Calabresa acebolada",
                desc: "300g de calabresa acebolada, vinagrete e farofa.",
                ingredients: ["Calabresa", "Cebola", "Vinagrete", "Farofa"],
                options: [{ label: "Unidade", price: 30 }]
            },
            {
                name: "Quarteto arretado",
                desc: "150g de filé mignon, 150g de calabresa, 150g de frango empanado e batata frita.",
                ingredients: ["Filé mignon", "Calabresa", "Frango", "Batata"],
                options: [{ label: "Unidade", price: 55 }]
            },
        ],
    },
    {
        category: "Refrigerantes Lata",
        items: [
            {
                name: "Coca-Cola Tradicional",
                desc: "Refrigerante Coca-Cola.",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Coca-Cola Zero",
                desc: "Refrigerante Coca-Cola Zero",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Pepsi",
                desc: "Refrigerante Pepsi",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Guaraná",
                desc: "Refrigerante Guaraná",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Cajuína",
                desc: "Refrigerante Cajuína",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Fanta Laranja",
                desc: "Regrigerante de Laranja",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Fanta Uva",
                desc: "Refrigetante de Uva",
                options: [{ label: "350ml", price: 6 }]
            },
            {
                name: "Fys Limão",
                desc: "Refrigerante de Limão",
                options: [{ label: "350ml", price: 6 }]
            },
        ],
    },
    {
        category: "Refrigerantes 1L",
        items: [
            {
                name: "Coca-Cola Tradicional",
                desc: "Refrigerante Coca-Cola Tradicional",
                options: [{ label: "1L", price: 10 }]
            },
            {
                name: "Coca-Cola Zero",
                desc: "Refrigerante Coca-Cola Zero",
                options: [{ label: "1L", price: 10 }]
            },
            {
                name: "Guaraná",
                desc: "Refrigerante Guaraná",
                options: [{ label: "1L", price: 10 }]
            },
            {
                name: "Pepsi",
                desc: "Refrigerante Pepsi",
                options: [{ label: "1L", price: 10 }]
            },
            {
                name: "Cajuína",
                desc: "Refrigerante Cajuína",
                options: [{ label: "1L", price: 10 }]
            },
        ],
    },
    {
        category: "Bebidas sem álcool",
        items: [
            {
                name: "Água sem gás",
                desc: "Água mineral sem gás",
                options: [{ label: "250ml", price: 3 }]
            },
            {
                name: "Água com gás",
                desc: "Água mineral com gás",
                options: [{ label: "250ml", price: 4 }]
            },
            {
                name: "H2O",
                desc: "H2O Limoneto",
                options: [{ label: "500ml", price: 8 }]
            },
            {
                name: "Red Bull",
                desc: "Energético",
                options: [{ label: "250ml", price: 12 }]
            },
        ],
    },
    {
        category: "Cachaça",
        items: [
            {
                name: "Ypioca",
                desc: "Cachaça ypioca lata",
                options: [{ label: "350ml", price: 12 }]
            },
            {
                name: "Pitú",
                desc: "Cachaça pitú lata",
                options: [{ label: "350ml", price: 12 }]
            },
            {
                name: "Carangueijo Prata",
                desc: "Cachaça carangueijo prata lata",
                options: [{ label: "350ml", price: 12 }]
            },
            {
                name: "Carangueijo Ouro",
                desc: "Cachaça carangueijo ouro lata",
                options: [{ label: "350ml", price: 12 }]
            },
            {
                name: "Matuta Prata",
                desc: "Cachaça matuta prata",
                options: [{ label: "275ml", price: 18 }]
            },
            {
                name: "Matuta Umburana",
                desc: "Cachaça matuta umburana",
                options: [{ label: "275ml", price: 20 }]
            },
            {
                name: "Samanaú Prata",
                desc: "Cachaça samanaú prata",
                options: [{ label: "500ml", price: 22 }]
            },
            {
                name: "Samanaú Ouro",
                desc: "Cachaça samanaú ouro",
                options: [{ label: "500ml", price: 22 }]
            },
            {
                name: "Mipibu Ouro",
                desc: "Cachaça mipibu ouro",
                options: [{ label: "500ml", price: 22 }]
            },
            {
                name: "Do Vale Carvalho",
                desc: "Cachaça do vale carvalho",
                options: [{ label: "1L", price: 20 }]
            },
            {
                name: "Extrema",
                desc: "Cachaça extrema",
                options: [{ label: "500ml", price: 20 }]
            },
        ],
    },
    {
        category: "Vinhos",
        items: [
            {
                name: "Del Grano Tinto Suave",
                desc: "Vinho tinto suave",
                options: [{ label: "1L", price: 55 }]
            },
            {
                name: "Pergola Tinto Suave",
                desc: "Vinho tinto suave",
                options: [{ label: "1L", price: 50 }]
            },
            {
                name: "Canciller Rosé",
                desc: "Vinho rosé",
                options: [{ label: "1L", price: 60 }]
            },
            {
                name: "Del Grano Tinto Seco",
                desc: "Vinho tinto seco",
                options: [{ label: "1L", price: 55 }]
            },
        ],
    },
    {
        category: "Cervejas 600ml",
        items: [
            {
                name: "Baden Baden",
                desc: "Cerveja Baden Baden",
                options: [{ label: "600ml", price: 15 }]
            },
        ],
    },
    {
        category: "Cervejas Long Neck",
        items: [
            {
                name: "Lagunitas Ipa",
                desc: "Long Neck lagunitas ipa",
                options: [{ label: "330ml", price: 15 }]
            },
            {
                name: "Heineken",
                desc: "Long Neck heineken",
                options: [{ label: "330ml", price: 10 }]
            },
            {
                name: "Heineken Zero",
                desc: "Long Neck heineken zero",
                options: [{ label: "330ml", price: 10 }]
            },
            {
                name: "Blue Moon",
                desc: "Long Neck bluee moon",
                options: [{ label: "330ml", price: 15 }]
            },
        ],
    },
    {
        category: "Para beliscar",
        items: [
            {
                name: "Batata frita",
                desc: "300g de batata frita.",
                ingredients: ["Batata"],
                options: [{ label: "Unidade", price: 15 }]
            },
            {
                name: "Batata cheddar bacon",
                desc: "300g de batata frita com cheddar cremoso e bacon.",
                ingredients: ["Batata", "Cheddar", "Bacon"],
                options: [{ label: "Unidade", price: 20 }]
            },
            {
                name: "Batata Cabocos",
                desc: "300g de batata frita e carne de sol desfiada na nata.",
                ingredients: ["Batata", "Carne de sol", "Nata"],
                options: [{ label: "Unidade", price: 25 }]
            },
            {
                name: "Macaxeira frita",
                desc: "300g de macaxeira frita na manteiga da terra.",
                ingredients: ["Macaxeira"],
                options: [{ label: "Unidade", price: 18 }]
            },
            {
                name: "Caldo",
                desc: "500ml de caldo.",
                ingredients: ["Caldo"],
                options: [{ label: "Unidade", price: 10 }]
            },
            {
                name: "Porreta",
                desc: "300g de macaxeira frita na manteiga da terra e costela bovina desfiada.",
                ingredients: ["Macaxeira", "Costela bovina"],
                options: [{ label: "Unidade", price: 25 }]
            },
            {
                name: "Batata suína",
                desc: "300g de batata frita e carne suína desfiada no barbecue.",
                ingredients: ["Batata", "Carne suína"],
                options: [{ label: "Unidade", price: 25 }]
            },
        ],
    },
    {
        category: "Pizzas tradicionais",
        items: [
            {
                name: "Seridó",
                desc: "Molho de tomate, queijo muçarela, calabresa, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Calabresa", "Cebola", "Orégano"],
                options: pizzaTradicional()
            },
            {
                name: "Sertaneja",
                desc: "Molho de tomate, queijo muçarela, carne de sol, requeijão, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Carne de sol", "Requeijão", "Cebola", "Orégano"],
                options: pizzaTradicional()
            },
            {
                name: "Soledade",
                desc: "Molho de tomate, queijo muçarela, frango, requeijão, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Frango", "Requeijão", "Cebola", "Orégano"],
                options: pizzaTradicional()
            },
            {
                name: "Cabugi",
                desc: "Molho de tomate, queijo muçarela, presunto, ovo, tomate, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Presunto", "Ovo", "Tomate", "Cebola", "Orégano"],
                options: pizzaTradicional()
            },
            {
                name: "Potengi",
                desc: "Molho de tomate, queijo muçarela, manjericão, tomate e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Manjericão", "Tomate", "Orégano"],
                options: pizzaTradicional()
            },
        ],
    },
    {
        category: "Pizzas especiais",
        items: [
            {
                name: "Cariri",
                desc: "Molho de tomate, queijo muçarela, calabresa, bacon, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Calabresa", "Bacon", "Cebola", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Nordestina",
                desc: "Molho de tomate, queijo muçarela, carne de sol, bacon, pimentão, tomate, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Carne de sol", "Bacon", "Pimentão", "Tomate", "Cebola", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Caipira",
                desc: "Molho de tomate, queijo muçarela, frango, bacon, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Frango", "Bacon", "Cebola", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Cabôco's",
                desc: "Molho de tomate, queijo qualho, carne de sol na nata, tomate, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo qualho", "Carne de sol", "Nata", "Tomate", "Cebola", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Arretada",
                desc: "Molho de tomate, queijo muçarela, filé mignon, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Filé mignon", "Cebola", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Agreste",
                desc: "Molho de tomate, queijo muçarela, lombo canadense, cebolas e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Lombo canadense", "Cebola", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Arerê",
                desc: "Molho de tomate, queijo muçarela, carne suína desfiada no barbecue, cebolas, tomate e orégano.",
                ingredients: ["Molho de tomate", "Queijo muçarela", "Carne suína", "Cebola", "Tomate", "Orégano"],
                options: pizzaEspecial()
            },
            {
                name: "Mandacaru",
                desc: "Molho de tomate, queijo qualho, costela bovina desfiada, cebolas, tomate e orégano.",
                ingredients: ["Molho de tomate", "Queijo qualho", "Costela bovina", "Cebola", "Tomate", "Orégano"],
                options: pizzaEspecial()
            },
        ],
    },
    {
        category: "Pizzas doces",
        items: [
            {
                name: "Xique-Xique",
                desc: "Chocolate e morango.",
                ingredients: ["Chocolate", "Morango"],
                options: pizzaEspecial()
            },
            {
                name: "Romeu & Julieta",
                desc: "Queijo muçarela e goiabada.",
                ingredients: ["Queijo muçarela", "Goiabada"],
                options: pizzaEspecial()
            },
            {
                name: "M&M",
                desc: "Chocolate e M&M.",
                ingredients: ["Chocolate", "M&M"],
                options: pizzaEspecial()
            },
            {
                name: "Banana Nervada",
                desc: "Banana cortada em rodelas, chocolate branco gratinado e canela em pó.",
                ingredients: ["Banana", "Chocolate branco", "Canela"],
                options: pizzaEspecial()
            },
            {
                name: "Dois Amores",
                desc: "Chocolate e chocolate branco.",
                ingredients: ["Chocolate", "Chocolate branco"],
                options: pizzaEspecial()
            },
            {
                name: "Trio Nordestino",
                desc: "Queijo qualho, doce de leite e goiabada.",
                ingredients: ["Queijo qualho", "Doce de leite", "Goiabada"],
                options: pizzaEspecial()
            },
        ],
    },
    {
        category: "Pastéis salgados",
        items: [
            {
                name: "Cabocos",
                desc: "Carne de sol, queijo muçarela, presunto, cebola, tomate e requeijão.",
                ingredients: ["Carne de sol", "Queijo muçarela", "Presunto", "Cebola", "Tomate", "Requeijão"],
                options: pastelCabocos()
            },
            {
                name: "Arretado",
                desc: "Carne de sol, cebola, tomate e requeijão.",
                ingredients: ["Carne de sol", "Cebola", "Tomate", "Requeijão"],
                options: pastelPadrao()
            },
            {
                name: "Magão",
                desc: "Frango, cebola, tomate e requeijão.",
                ingredients: ["Frango", "Cebola", "Tomate", "Requeijão"],
                options: pastelPadrao()
            },
            {
                name: "Pizza",
                desc: "Queijo muçarela, presunto, requeijão, molho de tomate, cebola, tomate e orégano.",
                ingredients: ["Queijo muçarela", "Presunto", "Requeijão", "Molho de tomate", "Cebola", "Tomate", "Orégano"],
                options: pastelPadrao()
            },
            {
                name: "Sertanejo",
                desc: "Carne de sol e queijo qualho.",
                ingredients: ["Carne de sol", "Queijo qualho"],
                options: pastelPadrao()
            },
            {
                name: "Calabresa à moda da casa",
                desc: "Calabresa acebolada e requeijão.",
                ingredients: ["Calabresa", "Cebola", "Requeijão"],
                options: pastelPadrao()
            },
            {
                name: "Curisco",
                desc: "Carne de sol na nata, queijo qualho, cebola e tomate.",
                ingredients: ["Carne de sol", "Nata", "Queijo qualho", "Cebola", "Tomate"],
                options: pastelPadrao()
            },
            {
                name: "Matuto",
                desc: "Costela bovina desfiada, queijo qualho, cebola e tomate.",
                ingredients: ["Costela bovina", "Queijo qualho", "Cebola", "Tomate"],
                options: pastelPadrao()
            },
            {
                name: "Candieiro",
                desc: "Carne suína desfiada no barbecue, requeijão, cebola e tomate.",
                ingredients: ["Carne suína", "Requeijão", "Cebola", "Tomate"],
                options: pastelPadrao()
            },
        ],
    },
    {
        category: "Pastéis doces",
        items: [
            {
                name: "Lampião & Maria Bonita",
                desc: "Doce de leite e goiabada.",
                ingredients: ["Doce de leite", "Goiabada"],
                options: pastelPadrao()
            },
            {
                name: "Cuó",
                desc: "Chocolate e morango.",
                ingredients: ["Chocolate", "Morango"],
                options: pastelPadrao()
            },
            {
                name: "Trairi",
                desc: "Chocolate e Kit Kat.",
                ingredients: ["Chocolate", "Kit Kat"],
                options: pastelPadrao()
            },
            {
                name: "Caiçara",
                desc: "Queijo qualho, doce de leite e goiabada.",
                ingredients: ["Queijo qualho", "Doce de leite", "Goiabada"],
                options: pastelPadrao()
            },
            {
                name: "Marmeleiro",
                desc: "Queijo muçarela e goiabada.",
                ingredients: ["Queijo muçarela", "Goiabada"],
                options: pastelPadrao()
            },
            {
                name: "Mulungu",
                desc: "Chocolate branco, banana e canela em pó.",
                ingredients: ["Chocolate branco", "Banana", "Canela"],
                options: pastelPadrao()
            },
            {
                name: "Macambira",
                desc: "Chocolate e M&M.",
                ingredients: ["Chocolate", "M&M"],
                options: pastelPadrao()
            },
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

    {
        name: "Bebidas",
        description: "Refrigerantes, águas e outras bebidas.",
        sections: [
            "Refrigerantes Lata",
            "Refrigerantes 1L",
            "Bebidas sem álcool",
            "Cachaça",
            "Vinhos",
            "Cervejas 600ml",
            "Cervejas Long Neck"
        ],
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
    return Number(value || 0).toFixed(2).replace(".", ",");
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getUnavailableIngredientNames() {
    return unavailableIngredients.map(item => item.nome);
}

function getUnavailableIngredientsForProduct(product) {
    const unavailableNames = getUnavailableIngredientNames();

    return (product.ingredients || []).filter(ingredient =>
        unavailableNames.includes(ingredient)
    );
}

function isProductAvailable(product) {
    return getUnavailableIngredientsForProduct(product).length === 0;
}

function getUnavailableIngredientsForEdge(edgeName) {
    const edge = EDGES.find(item => item.name === edgeName);

    if (!edge) {
        return [];
    }

    const unavailableNames = getUnavailableIngredientNames();

    return edge.ingredients.filter(ingredient =>
        unavailableNames.includes(ingredient)
    );
}

function isEdgeAvailable(edgeName) {
    return getUnavailableIngredientsForEdge(edgeName).length === 0;
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
                ingredients: item.ingredients || [],
                options: item.options,
            }))
        );
}

function getPizzaFlavorByName(flavorName) {
    return getAllPizzaFlavors().find(item => item.name === flavorName);
}

function getPizzaPriceBySize(flavorName, size) {
    const flavor = getPizzaFlavorByName(flavorName);

    if (!flavor) {
        return 0;
    }

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

function isRestaurantOpen() {
    const now = new Date();

    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    const isAllowedDay = day === 0 || day === 4 || day === 5 || day === 6;

    const currentMinutes = hour * 60 + minutes;
    const openingMinutes = 18 * 60;
    const closingMinutes = 23 * 60;

    return isAllowedDay && currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
}

function getClosedMessage() {
    return "No momento estamos fechados. Funcionamos de quinta a domingo, das 18h às 23h."
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

function listenUnavailableIngredients() {
    onSnapshot(collection(db, "ingredientesIndisponiveis"), snapshot => {
        unavailableIngredients = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data(),
        }));

        renderMenu();
    }, error => {
        console.error("Erro ao carregar ingredientes indisponíveis:", error);
    });
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

        ${section.items.map(item => renderProductCard(section, item)).join("")}
    `;
}

function renderProductCard(section, item) {
    const available = isProductAvailable(item);
    const unavailableItems = getUnavailableIngredientsForProduct(item);

    return `
        <article class="card ${available ? "" : "unavailable-card"}">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>

            ${available
            ? ""
            : `<p class="unavailable-message">
                        Indisponível no momento.
                        <br>
                        Ingrediente indisponível: ${unavailableItems.join(", ")}
                    </p>`
        }

            <div class="options">
                ${isPizzaCategory(section.category)
            ? renderPizzaButton(item, available)
            : renderNormalProductButtons(section, item, available)
        }
            </div>
        </article>
    `;
}

function renderPizzaButton(item, available) {
    if (!available) {
        return `
            <button type="button" disabled class="disabled-btn">
                Indisponível
            </button>
        `;
    }

    return item.options.map(option => `
        <button type="button" onclick="openPizzaModal('${item.name}', '${option.label}')">
            ${option.label} - R$ ${formatPrice(option.price)}
        </button>
    `).join("");
}

function renderNormalProductButtons(section, item, available) {
    if (!available) {
        return `
            <button type="button" disabled class="disabled-btn">
                Indisponível
            </button>
        `;
    }

    return item.options.map(option => `
        <button onclick="addToCart({
            type: 'normal',
            category: '${section.category}',
            name: '${item.name}',
            size: '${option.label}',
            price: ${option.price}
        })">
            ${option.label} - R$ ${formatPrice(option.price)}
        </button>
    `).join("");
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
    if (!isRestaurantOpen()) {
        alert(getClosedMessage());
        return;
    }

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

    const cartButtons = `
        <div class="cart-next-actions">
            <button type="button" class="continue-btn" onClick="continueShopping()">
                Adicionar mais produtos
            </button>

            <button type="button" class="finish-btn" onClick="goToCheckout()">
                Finalizar pedido
            </button>
        </div>
    `;

    cartItems.innerHTML = cartButtons + cart.map((item, index) => `
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

function continueShopping() {
    closeCart();

    setTimeout(() => {
        window.scrollTo({
            top: document.getElementById("categories").offsetTop,
            behavior: "smooth"
        });
    }, 200);
}

function goToCheckout() {
    const orderForm = document.getElementById("orderForm");

    if (orderForm) {
        orderForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function openCart() {
    if (!isRestaurantOpen()) {
        alert(getClosedMessage());
        return;
    }

    document.getElementById("cartModal").classList.add("show");
}

function closeCart() {
    document.getElementById("cartModal").classList.remove("show");
}

function openPizzaModal(selectedFlavor, selectedSize = "P") {
    if (!isRestaurantOpen()) {
        alert(getClosedMessage());
        return;
    }

    const selectedPizzaFlavor = getPizzaFlavorByName(selectedFlavor);

    if (!selectedPizzaFlavor || !isProductAvailable(selectedPizzaFlavor)) {
        alert("Esse sabor está indisponível no momento.");
        return;
    }

    currentPizza = { selectedFlavor };

    const pizzaSize = document.getElementById("pizzaSize");
    const pizzaFlavor1 = document.getElementById("pizzaFlavor1");
    const pizzaFlavor2 = document.getElementById("pizzaFlavor2");
    const pizzaEdge = document.getElementById("pizzaEdge");

    const allFlavors = getAllPizzaFlavors().filter(flavor => isProductAvailable(flavor));

    pizzaSize.innerHTML = `
        <option value="P" ${selectedSize === "P" ? "selected" : ""}>P</option>
        <option value="M" ${selectedSize === "M" ? "selected" : ""}>M</option>
        <option value="G" ${selectedSize === "G" ? "selected" : ""}>G</option>
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

    const availableEdges = EDGES.filter(edge => isEdgeAvailable(edge.name));

    pizzaEdge.innerHTML = availableEdges.map(edge => `
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

    const flavorOneData = getPizzaFlavorByName(flavor1);
    const flavorTwoData = flavor2 ? getPizzaFlavorByName(flavor2) : null;

    if (!flavorOneData || !isProductAvailable(flavorOneData)) {
        document.getElementById("pizzaPreview").innerHTML = "Sabor indisponível.";
        return;
    }

    if (flavorTwoData && !isProductAvailable(flavorTwoData)) {
        document.getElementById("pizzaPreview").innerHTML = "Segundo sabor indisponível.";
        return;
    }

    if (!isEdgeAvailable(edge)) {
        document.getElementById("pizzaPreview").innerHTML = "Borda indisponível.";
        return;
    }

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
    if (!isRestaurantOpen()) {
        alert(getClosedMessage());
        return;
    }

    const size = document.getElementById("pizzaSize").value;
    const flavor1 = document.getElementById("pizzaFlavor1").value;
    const flavor2 = document.getElementById("pizzaFlavor2").value;
    const edge = document.getElementById("pizzaEdge").value;

    const flavorOneData = getPizzaFlavorByName(flavor1);
    const flavorTwoData = flavor2 ? getPizzaFlavorByName(flavor2) : null;

    if (!flavorOneData || !isProductAvailable(flavorOneData)) {
        alert("O sabor escolhido está indisponível no momento.");
        return;
    }

    if (flavorTwoData && !isProductAvailable(flavorTwoData)) {
        alert("O segundo sabor escolhido está indisponível no momento.");
        return;
    }

    if (!isEdgeAvailable(edge)) {
        alert("A borda escolhida está indisponível no momento.");
        return;
    }

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

    const pizzaItem = {
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
    };

    closePizzaModal();

    setTimeout(() => {
        addToCart(pizzaItem);
        updateCart();
    }, 150);
}

function showPromotionChoice() {
    const promoBox = document.getElementById("promoBox");

    if (!promoBox) {
        return;
    }

    const promoQty = getPromotionPizzaGCount();

    if (promoQty <= 0) {
        promoBox.classList.add("hidden");
        promoBox.innerHTML = "";
        return;
    }

    promoBox.classList.remove("hidden");
    promoBox.innerHTML = `
        <strong>Promoção de quinta-feira</strong>
        <p>Você ganhou ${promoQty} refrigerante(s) de 1L.</p>
        <label>Escolha o refrigerante grátis:</label>
        <select id="promoDrink">
            <option value="Guaraná 1L">Guaraná 1L</option>
            <option value="Pepsi 1L">Pepsi 1L</option>
        </select>
    `;
}

function openReservationModal() {
    document.getElementById("reservationModal").classList.add("show");
}

function closeReservationModal() {
    document.getElementById("reservationModal").classList.remove("show");
}

function buildReservationWhatsAppMessage(reservationData) {
    let message = `*📅 Nova solicitação de Reserva - Cabocos Bar*\n\n`;
    message += `👤 *Nome:* ${reservationData.nome}\n`;
    message += `📱 *Telefone:* ${reservationData.telefone}\n`;
    message += `📆 *Data:* ${reservationData.data}\n`;
    message += `⏰ *Horário:* ${reservationData.horario}\n`;
    message += `👥 *Pessoas:* ${reservationData.pessoas}\n`;
    message += `🎉 *Tipo:* ${reservationData.tipo}\n`;

    if (reservationData.observacoes) {
        message += `📝 *Observações:* ${reservationData.observacoes}\n`;
    }

    message += `\nAguardando confirmação da reserva.`;

    return message;
}

function buildWhatsAppMessage(orderData) {
    const itemsText = orderData.itens.map(item => {
        if (item.type === "pizza") {
            let text = `- ${item.qty}x ${item.name}\n`;
            text += `  Tamanho: ${item.size}\n`;

            if (item.flavor2) {
                text += `  Sabores: metade ${item.flavor1} / metade ${item.flavor2}\n`;
            } else {
                text += `  Sabor: ${item.flavor1}\n`;
            }

            text += `  Borda: ${item.edge}\n`;
            text += `  Valor unitário: R$ ${formatPrice(item.price)}\n`;
            text += `  Subtotal: R$ ${formatPrice(item.price * item.qty)}`;

            return text;
        }

        return `- ${item.qty}x ${item.name} (${item.size}) - R$ ${formatPrice(item.price * item.qty)}`;
    }).join("\n\n");

    let message = `*🧾 Novo Pedido - Cabocos Bar*\n\n`;
    message += `👤 *Cliente:* ${orderData.cliente}\n`;
    message += `📱 *WhatsApp:* ${orderData.telefone || "Não informado"}\n`;
    message += `🚚 *Tipo:* ${orderData.tipoEntrega || "Entrega"}\n`;
    message += `📍 *Endereço:* ${orderData.endereco}\n\n`;
    message += `🍽️ *Pedido:*\n${itemsText}\n\n`;

    if (orderData.promocao) {
        message += `🎁 *Promoção de quinta-feira:*\n`;
        message += `${orderData.promocao.quantidade} refrigerante(s) de 1L grátis\n`;
        message += `Opção escolhida: ${orderData.promocao.bebida}\n\n`;
    }

    message += `💰 *Total:* R$ ${formatPrice(orderData.total)}\n`;
    message += `💳 *Pagamento:* ${orderData.pagamento}\n`;

    if (orderData.observacoes) {
        message += `📝 *Observações:* ${orderData.observacoes}\n`;
    }

    if (orderData.pagamento === "Pix") {
        message += `\n*Pagamento via Pix.* Cliente deve enviar o comprovante aqui no WhatsApp em seguida.`;
    }

    return message;
}

document.getElementById("paymentMethod").addEventListener("change", function () {
    const pixBox = document.getElementById("pixBox");
    const pixProof = document.getElementById("pixProof");

    if (this.value === "Pix") {
        pixBox.classList.remove("hidden");
        pixProof.setAttribute("required", "required");
    } else {
        pixBox.classList.add("hidden");
        pixProof.removeAttribute("required");
        pixProof.value = "";
    }
});

document.getElementById("deliveryType").addEventListener("change", function () {
    const addressInput = document.getElementById("clientAddress");

    if (this.value === "Retirar no local") {
        addressInput.classList.add("hidden");
        addressInput.removeAttribute("required");
        addressInput.value = "";
    } else {
        addressInput.classList.remove("hidden");
        addressInput.setAttribute("required", "required");
    }
});

document.getElementById("reservationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!isRestaurantOpen()) {
        alert(getClosedMessage());
        return;
    }

    const name = document.getElementById("reservationName").value.trim();
    const phone = document.getElementById("reservationPhone").value.trim();
    const date = document.getElementById("reservationDate").value;
    const time = document.getElementById("reservationTime").value;
    const people = Number(document.getElementById("reservationPeople").value);
    const type = document.getElementById("reservationType").value;
    const obs = document.getElementById("reservationObs").value.trim();

    if (!name || !phone || !date || !time || !people || !type) {
        alert("Preencha todos os campos obrigatórios da reserva.");
        return;
    }

    const reservationData = {
        nome: name,
        telefone: phone,
        data: date,
        horario: time,
        pessoas: people,
        tipo: type,
        observacoes: obs,
        status: "NOVA",
        criadoEm: new Date().toISOString(),
    };

    try {
        await addDoc(collection(db, "reservas"), reservationData);

        const message = buildReservationWhatsAppMessage(reservationData);
        const encodedMessage = encodeURIComponent(message);

        document.getElementById("reservationForm").reset();
        closeReservationModal();

        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    } catch (error) {
        console.error("Erro ao salvar reserva:", error);
        alert("Erro ao solicitar reserva. Tente novamente.");
    }
});

document.getElementById("orderForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!isRestaurantOpen()) {
        alert(getClosedMessage());
        return;
    }

    if (cart.length === 0) {
        alert("Adicione pelo menos um item ao carrinho.");
        return;
    }

    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const deliveryType = document.getElementById("deliveryType").value;
    const address = document.getElementById("clientAddress").value.trim();
    const obs = document.getElementById("clientObs").value.trim();
    const payment = document.getElementById("paymentMethod").value;
    const pixProof = document.getElementById("pixProof").files[0];

    if (!name || !phone || !deliveryType || !payment) {
        alert("Preencha nome, Whatsapp, tipo de entrega e forma de pagamento.");
        return;
    }

    if (deliveryType === "Entrega" && !address) {
        alert("Informe o endereço para entrega.");
        return;
    }

    if (payment === "Pix" && !pixProof) {
        alert("Para pagamento via Pix, selecione o comprovante antes de continuar.");
        return;
    }

    const total = calculateTotal();
    const promoQty = getPromotionPizzaGCount();
    const promoDrink = document.getElementById("promoDrink")?.value || "";

    const orderData = {
        cliente: name,
        telefone: phone,
        endereco: deliveryType === "Entrega" ? address : "Retirar no local",
        observacoes: obs,
        pagamento: payment,
        itens: cart.map(item => ({ ...item })),
        total,
        promocao: promoQty > 0
            ? {
                quantidade: promoQty,
                bebida: promoDrink || "Guaraná 1L",
            }
            : null,
        status: "NOVO",
        criadoEm: new Date().toISOString(),
    };

    try {
        await addDoc(collection(db, "pedidos"), orderData);

        const message = buildWhatsAppMessage(orderData);
        const encodedMessage = encodeURIComponent(message);

        cart = [];
        updateCart();
        closeCart();

        document.getElementById("orderForm").reset();
        document.getElementById("pixBox").classList.add("hidden");
        document.getElementById("pixProof").removeAttribute("required");

        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    } catch (error) {
        console.error("Erro ao salvar pedido:", error);
        alert("Erro ao enviar pedido. Tente novamente.");
    }
});

window.selectMainCategory = selectMainCategory;
window.selectSubCategory = selectSubCategory;
window.goBackMenu = goBackMenu;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.openCart = openCart;
window.closeCart = closeCart;
window.openPizzaModal = openPizzaModal;
window.closePizzaModal = closePizzaModal;
window.openReservationModal = openReservationModal;
window.closeReservationModal = closeReservationModal;
window.continueShopping = continueShopping;
window.goToCheckout = goToCheckout;
window.confirmPizza = confirmPizza;

renderCategories();
renderMenu();
updateCart();
listenUnavailableIngredients();