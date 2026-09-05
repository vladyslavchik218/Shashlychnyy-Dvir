// Cart functionality
let cart = [];
let currentProduct = null;
let currentSauce = null;
let currentDrink = null;

// Sticky categories functionality
let categoriesSection = null;
let categoriesOriginalPosition = null;
let isSticky = false;
let selectedMessenger = null;

function initStickyCategories() {
    categoriesSection = document.querySelector('.categories-section');
    if (!categoriesSection) return;
    
    categoriesOriginalPosition = categoriesSection.getBoundingClientRect().top + window.pageYOffset;
    
    window.addEventListener('scroll', handleStickyCategories, { passive: true });
    window.addEventListener('resize', handleStickyCategories, { passive: true });
}

function handleStickyCategories() {
    if (!categoriesSection) return;
    
    const headerHeight = window.innerWidth <= 768 ? 70 : 80;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > categoriesOriginalPosition - headerHeight && !isSticky) {
        categoriesSection.style.position = 'fixed';
        categoriesSection.style.top = headerHeight + 'px';
        categoriesSection.style.left = '0';
        categoriesSection.style.right = '0';
        categoriesSection.style.width = '100%';
        categoriesSection.style.zIndex = '999';
        categoriesSection.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        isSticky = true;
    } else if (scrollTop <= categoriesOriginalPosition - headerHeight && isSticky) {
        categoriesSection.style.position = '';
        categoriesSection.style.top = '';
        categoriesSection.style.left = '';
        categoriesSection.style.right = '';
        categoriesSection.style.width = '';
        categoriesSection.style.zIndex = '';
        categoriesSection.style.boxShadow = '';
        isSticky = false;
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initStickyCategories();
    loadCart();
});

// Store selected sauce weights and prices
let selectedSauceWeights = {};
let selectedSaucePrices = {};

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
        updateCardQuantities();
    }
}

// Listen for localStorage changes from other tabs/windows
window.addEventListener('storage', function(e) {
    if (e.key === 'cart' && e.newValue) {
        cart = JSON.parse(e.newValue);
        updateCartUI();
        updateCardQuantities();
    }
});

// Sync cart with localStorage (called periodically)
function syncCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (JSON.stringify(cart) !== JSON.stringify(parsedCart)) {
            cart = parsedCart;
            updateCartUI();
            updateCardQuantities();
        }
    }
}

// Select sauce weight on card

// Drink functions
function openDrinkModal(drinkId) {
    const drink = products[drinkId];
    if (!drink) return;
    
    const modalImage = document.getElementById('modal-product-image');
    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    modalImage.src = drink.image;
    modalImage.style.display = 'block';
    modalPlaceholder.style.display = 'none';
    
    modalImage.onerror = function() {
        this.style.display = 'none';
        modalPlaceholder.style.display = 'flex';
        const drinkEmojis = {
            'cherry-juice-1l': '🍒',
            'multifruit-juice-1l': '🍎',
            'tomato-juice-1l': '🍅',
            'cherry-juice-05l': '🍒',
            'multifruit-juice-05l': '🍎',
            'tomato-juice-05l': '🍅',
            'kvass-05l': '🍺',
            'kvass-1l': '🍺',
            'mojito-05l': '🍹',
            'mojito-1l': '🍹',
            'cola-zero-05l': '🥤',
            'cola-05l': '🥤',
            'cola-125l': '🥤',
            'pepsi-05l': '🥤',
            'pepsi-07l': '🥤',
            'pepsi-125l': '🥤',
            'pepsi-03l-glass': '🥤',
            'lipton-peach': '🍑',
            'lipton-lemon': '🍋',
            'lipton-green': '🍵',
            'kvass': '🍺',
            'mojito': '🍹'
        };
        modalPlaceholder.textContent = drinkEmojis[drinkId] || '🥤';
    };
    
    document.getElementById('modal-product-title').textContent = drink.name;
    document.getElementById('modal-product-description').textContent = drink.description;
    document.getElementById('modal-product-price').textContent = drink.price + ' грн';
    
    // Set badges
    const badgesContainer = document.getElementById('modal-badges');
    badgesContainer.innerHTML = '';
    drink.badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.className = `badge ${badge}`;
        badgeElement.textContent = getBadgeText(badge);
        badgesContainer.appendChild(badgeElement);
    });
    
    // Remove weight and sauce selectors for drinks
    const modalOptions = document.querySelector('.modal-options');
    modalOptions.innerHTML = '';
    
    // Add to cart button for drinks
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart-btn';
    addToCartBtn.textContent = 'Додати в кошик';
    addToCartBtn.onclick = addToCartFromModal;
    modalOptions.appendChild(addToCartBtn);
    
    document.getElementById('product-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Store current drink
    currentProduct = null;
    currentSauce = null;
    currentDrink = drink;
}

function increaseDrinkQuantity(drinkId) {
    const drink = products[drinkId];
    if (!drink) return;

    const quantityElement = document.getElementById(`quantity-${drinkId}`);
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent) || 1;
        currentQuantity += 1;
        quantityElement.textContent = currentQuantity;
    }

    const existingItem = cart.find(item => item.id === drinkId);
    if (existingItem) {
        existingItem.quantity = parseInt(quantityElement.textContent);
    } else {
        const cartItem = {
            ...drink,
            quantity: parseInt(quantityElement.textContent),
            cartId: Date.now()
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartUI();
    updateCardQuantities();
    updateCardPrice(drinkId);
}

function decreaseDrinkQuantity(drinkId) {
    const drink = products[drinkId];
    if (!drink) return;

    const quantityElement = document.getElementById(`quantity-${drinkId}`);
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent) || 1;
        if (currentQuantity > 1) {
            currentQuantity -= 1;
            quantityElement.textContent = currentQuantity;
        } else {
            // Don't go below 1 on the display
            currentQuantity = 1;
        }
    }

    const existingItem = cart.find(item => item.id === drinkId);
    if (existingItem) {
        const displayedQuantity = parseInt(quantityElement.textContent);
        if (displayedQuantity > 0) {
            existingItem.quantity = displayedQuantity;
        } else {
            cart = cart.filter(i => i.cartId !== existingItem.cartId);
        }
    }

    saveCart();
    updateCartUI();
    updateCardQuantities();
    updateCardPrice(drinkId);
}

// Subcategory filtering for drinks
document.addEventListener('DOMContentLoaded', function() {
    const subcategoryButtons = document.querySelectorAll('.subcategory-item');
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subcategory = this.dataset.subcategory;
            
            // Update active state
            subcategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter drink cards
            const drinkCards = document.querySelectorAll('.product-card[data-category="drinks"]');
            drinkCards.forEach(card => {
                if (subcategory === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardSubcategory = card.dataset.subcategory;
                    card.style.display = cardSubcategory === subcategory ? 'block' : 'none';
                }
            });
        });
    });
});
function selectSauceWeight(sauceId, weight, price) {
    selectedSauceWeights[sauceId] = weight;
    selectedSaucePrices[sauceId] = price;
    
    // Update UI
    const buttons = document.querySelectorAll(`.sauce-weight-btn[data-sauce="${sauceId}"]`);
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.weight) === weight) {
            btn.classList.add('active');
        }
    });
    
    // Update price display
    const priceElement = document.getElementById(`price-sauce-${sauceId}`);
    if (priceElement) {
        priceElement.textContent = price + ' грн';
    }
    
    // Update quantity display for the selected weight
    updateCardQuantities();
}

// Product data (in real app, this would come from backend)
const products = {
    'set-2-persons': {
        id: 'set-2-persons',
        name: 'Сет на 2 особи',
        description: 'Шашлик свинний 400г, Ковбаски 300г, Картопля печена 500г, Лаваш 1 шт, Соус 50г',
        price: 690,
        originalPrice: 1250,
        image: '/static/images/2-set.jpg',
        badges: ['hit'],
        category: 'sets'
    },
    'set-4-persons': {
        id: 'set-4-persons',
        name: 'Сет на 4 особи',
        description: 'Шашлик 600г, Ребра 500г, Овочі печені 500г, Картопля печена 600г, Лаваш 2 шт, Соус 100г',
        price: 1420,
        originalPrice: 1250,
        image: '/static/images/4-set.jpg',
        badges: ['hit'],
        category: 'sets'
    },
    'set-6-persons': {
        id: 'set-6-persons',
        name: 'Сет на 6 осіб',
        description: 'Шашлик 1кг, Ребра 600г, Ковбаски 600г, Овочі печені 700г, Картопля печена 1кг, Лаваш 3 шт, Соус 200г',
        price: 2290,
        originalPrice: 4100,
        image: '/static/images/6-set.jpg',
        badges: ['popular'],
        category: 'sets'
    },
    'set-10-persons': {
        id: 'set-10-persons',
        name: 'Сет на 10 осіб',
        description: 'Шашлик з свинного ошийка 2кг, Шашлик курячий 1кг, Ковбаски 1кг, Реберця 500г, Картопля по-селянськи 1.5кг, Овочі печені 1кг, Лаваш 5 шт, Соус',
        price: 4685,
        originalPrice: 7300,
        image: '/static/images/10-set.jpg',
        badges: ['new'],
        category: 'sets'
    },
    'pork-neck': {
        id: 'pork-neck',
        name: 'Шашлик зі свинного ошийка',
        description: 'Соковитий свинний ошийок на мангалі',
        pricePer100g: 85,
        image: '/static/images/chicken-fillet.jpg',
        badges: ['hit'],
        category: 'shashlik'
    },
    'chicken-fillet': {
        id: 'chicken-fillet',
        name: 'Шашлик з філе курячого',
        description: 'Ніжне куряче філе з прянощами',
        pricePer100g: 80,
        image: '/static/images/chicken-fillet.jpg',
        badges: [],
        category: 'shashlik'
    },
    'chicken-thigh': {
        id: 'chicken-thigh',
        name: 'Шашлик з стегна курячого',
        description: 'Соковите куряче стегно на мангалі',
        pricePer100g: 80,
        image: '/static/images/chicken-thigh.jpg',
        badges: [],
        category: 'shashlik'
    },
    'pork-sausages': {
        id: 'pork-sausages',
        name: 'Ковбаски свинні',
        description: 'Домашні ковбаски з власного м\'ясного цеху',
        pricePer100g: 55,
        image: '/static/images/pork-sausages.jpg',
        badges: [],
        category: 'shashlik'
    },
    'pork-ribs': {
        id: 'pork-ribs',
        name: 'Ребра свинні',
        description: 'М\'ясні ребра в соусі BBQ з копченням',
        pricePer100g: 60,
        image: '/static/images/pork-ribs.jpg',
        badges: ['popular', 'smoker'],
        category: 'shashlik'
    },
    'chicken-wings': {
        id: 'chicken-wings',
        name: 'Крильця курячі',
        description: 'Хрусткі крильця в соусі BBQ з копченням',
        pricePer100g: 50,
        image: '/static/images/chicken-wings.jpg',
        badges: ['new', 'smoker'],
        category: 'shashlik'
    },
    'chicken-legs': {
        id: 'chicken-legs',
        name: 'Гомілки курячі',
        description: 'Соковиті гомілки на мангалі',
        pricePer100g: 50,
        image: '/static/images/chicken-legs.jpg',
        badges: [],
        category: 'shashlik'
    },
    'chicken-thigh-grill': {
        id: 'chicken-thigh-grill',
        name: 'Стегно куряче',
        description: 'Ціле куряче стегно на кістці',
        pricePer100g: 50,
        image: '/static/images/chicken-thigh-grill.jpg',
        badges: ['smoker'],
        category: 'shashlik'
    },
    'grilled-vegetables': {
        id: 'grilled-vegetables',
        name: 'Овочі печені',
        description: 'Перець, кабачок, печериці на мангалі',
        pricePer100g: 60,
        image: '/static/images/grilled-vegetables.jpg',
        badges: ['veg'],
        category: 'sides'
    },
    'baked-potatoes': {
        id: 'baked-potatoes',
        name: 'Картопля печена',
        description: 'Молода картопля в фользі з травами',
        pricePer100g: 25,
        image: '/static/images/baked-potatoes.jpg',
        badges: [],
        category: 'sides'
    },
    'marinated-onions': {
        id: 'marinated-onions',
        name: 'Цибуля маринована',
        description: 'Хрустка маринована цибуля з травами',
        pricePer100g: 15,
        image: '/static/images/marinated-onions.jpg',
        badges: [],
        category: 'sides'
    },
    'lavash-uwu': {
        id: 'lavash-uwu',
        name: 'Вірменський лаваш',
        description: 'Смачний лаваш для шашлику',
        pricePerUnit: 25,
        unitWeight: 125,
        isPerPiece: true,
        image: '/static/images/lavash-uwu.jpg',
        badges: [],
        category: 'sides'
    },
    'bell-pepper': {
        id: 'bell-pepper',
        name: 'Болгарський перець',
        description: 'Солодкий соковитий перець, запечений на грилі',
        pricePer100g: 60,
        image: '/static/images/bell-pepper.jpg',
        badges: ['veg'],
        category: 'grill'
    },
    'mushrooms': {
        id: 'mushrooms',
        name: 'Шампіньйони',
        description: 'Соковиті гриби, смажені на грилі з часником',
        pricePer100g: 60,
        image: '/static/images/mushrooms.jpg',
        badges: ['veg'],
        category: 'grill'
    },
    'zucchini': {
        id: 'zucchini',
        name: 'Кабачок',
        description: 'Ніжний кабачок, запечений на грилі з часником',
        pricePer100g: 60,
        image: '/static/images/zucchini.jpg',
        badges: ['veg'],
        category: 'grill'
    },
    'bean-pepper': {
        id: 'bean-pepper',
        name: 'Стручковий перець',
        description: 'Хрусткий перець, смажений на грилі',
        pricePer100g: 60,
        image: '/static/images/bean-pepper.jpg',
        badges: ['veg'],
        category: 'grill'
    },
    'cherry-tomatoes': {
        id: 'cherry-tomatoes',
        name: 'Чері помідори',
        description: 'Солодкі чері, запечені на грилі з базиліком',
        pricePer100g: 60,
        image: '/static/images/cherry-tomatoes.jpg',
        badges: ['veg'],
        category: 'grill'
    },
    'corn': {
        id: 'corn',
        name: 'Кукурудза',
        description: 'Солодка кукурудза, запечена на грилі з маслом',
        pricePer100g: 60,
        image: '/static/images/corn.jpg',
        badges: ['veg'],
        category: 'grill'
    },
    'pork-chop': {
        id: 'pork-chop',
        name: 'Костиця',
        description: 'Соковита свиняча костиця на кістці',
        pricePer100g: 70,
        image: '/static/images/pork-chop.jpg',
        badges: ['smoker'],
        category: 'shashlik'
    },
    'pork-liver': {
        id: 'pork-liver',
        name: 'Пічеревина',
        description: 'Ніжна свиняча печінка на мангалі',
        pricePer100g: 55,
        image: '/static/images/pork-liver.jpg',
        badges: ['smoker'],
        category: 'shashlik'
    },
    'pork-tenderloin': {
        id: 'pork-tenderloin',
        name: 'Полядвиця',
        description: 'Найніжніша частина свинини на грилі',
        pricePer100g: 60,
        image: '/static/images/pork-tenderloin.jpg',
        badges: ['smoker'],
        category: 'shashlik'
    },
    'rib-strip': {
        id: 'rib-strip',
        name: 'Ребро полоска',
        description: 'Смажені ребра-полоски з копченням',
        pricePer100g: 48,
        image: '/static/images/rib-strip.jpg',
        badges: ['smoker'],
        category: 'shashlik'
    },
    'grill-sausages': {
        id: 'grill-sausages',
        name: 'Ковбаски гриль',
        description: 'Домашні ковбаски гриль з власного м\'ясного цеху',
        pricePer100g: 55,
        image: '/static/images/grill-sausages.jpg',
        badges: ['smoker'],
        category: 'shashlik'
    },
    // Drinks
    'cherry-juice-1l': {
        id: 'cherry-juice-1l',
        name: 'Вишневий сік',
        description: 'Натуральний вишневий сік 1 л',
        price: 108,
        volume: '1 л',
        image: '/static/images/cherry-1L.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'juices'
    },
    'multifruit-juice-1l': {
        id: 'multifruit-juice-1l',
        name: 'Мульти фрукт сік',
        description: 'Натуральний мульти-фруктовий сік 1 л',
        price: 108,
        volume: '1 л',
        image: '/static/images/multi-1L.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'juices'
    },
    'tomato-juice-1l': {
        id: 'tomato-juice-1l',
        name: 'Томатний сік',
        description: 'Натуральний томатний сік 1 л',
        price: 108,
        volume: '1 л',
        image: '/static/images/tomato-1L.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'juices'
    },
    'cherry-juice-05l': {
        id: 'cherry-juice-05l',
        name: 'Вишневий сік',
        description: 'Натуральний вишневий сік 0.5 л',
        price: 59,
        volume: '0.5 л',
        image: '/static/images/cherry-0.5.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'juices'
    },
    'multifruit-juice-05l': {
        id: 'multifruit-juice-05l',
        name: 'Мульти фрукт сік',
        description: 'Натуральний мульти-фруктовий сік 0.5 л',
        price: 59,
        volume: '0.5 л',
        image: '/static/images/multi-0.5.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'juices'
    },
    'tomato-juice-05l': {
        id: 'tomato-juice-05l',
        name: 'Томатний сік',
        description: 'Натуральний томатний сік 0.5 л',
        price: 59,
        volume: '0.5 л',
        image: '/static/images/tomato-0.5.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'juices'
    },
    'kvass-05l': {
        id: 'kvass-05l',
        name: 'Квас',
        description: 'Традиційний український квас 0,5 л',
        price: 30,
        volume: '0.5 л',
        image: '/static/images/kvas.jpg',
        badges: ['popular'],
        category: 'drinks',
        subcategory: 'draft'
    },
    'kvass-1l': {
        id: 'kvass-1l',
        name: 'Квас',
        description: 'Традиційний український квас 1 л',
        price: 60,
        volume: '1 л',
        image: '/static/images/kvas.jpg',
        badges: ['popular'],
        category: 'drinks',
        subcategory: 'draft'
    },
    'mojito-05l': {
        id: 'mojito-05l',
        name: 'Мохіто',
        description: 'Освіжаючий мохіто 0,5 л',
        price: 30,
        volume: '0.5 л',
        image: '/static/images/moxito.jpg',
        badges: ['hit'],
        category: 'drinks',
        subcategory: 'draft'
    },
    'mojito-1l': {
        id: 'mojito-1l',
        name: 'Мохіто',
        description: 'Освіжаючий мохіто 1 л',
        price: 69,
        volume: '1 л',
        image: '/static/images/moxito.jpg',
        badges: ['hit'],
        category: 'drinks',
        subcategory: 'draft'
    },
    // Backward compatibility aliases
    'kvass': {
        id: 'kvas',
        name: 'Квас',
        description: 'Традиційний український квас',
        price: 30,
        volume: '0.5 л',
        image: '/static/images/kvas.jpg',
        badges: ['popular'],
        category: 'drinks',
        subcategory: 'draft'
    },
    'mojito': {
        id: 'mojito',
        name: 'Мохіто',
        description: 'Освіжаючий мохіто',
        price: 30,
        volume: '0.5 л',
        image: '/static/images/moxito.jpg',
        badges: ['hit'],
        category: 'drinks',
        subcategory: 'draft'
    },
    // Coca-Cola products
    'cola-zero-05l': {
        id: 'cola-zero-05l',
        name: 'Кола Zero',
        description: 'Coca-Cola Zero 0,5 л',
        price: 37,
        volume: '0.5 л',
        image: '/static/images/cola-zero.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    'cola-05l': {
        id: 'cola-05l',
        name: 'Кола',
        description: 'Coca-Cola 0,5 л',
        price: 37,
        volume: '0.5 л',
        image: '/static/images/cola-0.5.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    'cola-125l': {
        id: 'cola-125l',
        name: 'Кола',
        description: 'Coca-Cola 1,25 л',
        price: 62,
        volume: '1.25 л',
        image: '/static/images/cola-1.25.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    // Pepsi products
    'pepsi-05l': {
        id: 'pepsi-05l',
        name: 'Пепсі',
        description: 'Pepsi 0,5 л',
        price: 35,
        volume: '0.5 л',
        image: '/static/images/pepsi-0.5.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    'pepsi-07l': {
        id: 'pepsi-07l',
        name: 'Пепсі',
        description: 'Pepsi 0,7 л',
        price: 41,
        volume: '0.7 л',
        image: '/static/images/pepsi-0.75.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    'pepsi-125l': {
        id: 'pepsi-125l',
        name: 'Пепсі',
        description: 'Pepsi 1,25 л',
        price: 59,
        volume: '1.25 л',
        image: '/static/images/pepsi-1.25L.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    'pepsi-03l-glass': {
        id: 'pepsi-03l-glass',
        name: 'Пепсі',
        description: 'Pepsi 0,3 л скло',
        price: 43,
        volume: '0.3 л',
        image: '/static/images/pepsi-glass.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'carbonated'
    },
    // Lipton Tea products
    'lipton-peach': {
        id: 'lipton-peach',
        name: 'Чай Lipton',
        description: 'Lipton Персик 0,5 л',
        price: 35,
        volume: '0.5 л',
        image: '/static/images/lipton-peach.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'tea'
    },
    'lipton-lemon': {
        id: 'lipton-lemon',
        name: 'Чай Lipton',
        description: 'Lipton Лимон 0,5 л',
        price: 35,
        volume: '0.5 л',
        image: '/static/images/lipton-lemon.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'tea'
    },
    'lipton-green': {
        id: 'lipton-green',
        name: 'Чай Lipton',
        description: 'Lipton Зелений 0,5 л',
        price: 35,
        volume: '0.5 л',
        image: '/static/images/lipton-green-tea.jpg',
        badges: [],
        category: 'drinks',
        subcategory: 'tea'
    }
};

// Sauces data
const sauces = [
    { id: 'garlic', name: 'Часниковий', price50g: 35, price100g: 60, image: '/static/images/sauce-ketchup.jpg' },
    { id: 'spicy', name: 'Гострий', price50g: 35, price100g: 60, image: '/static/images/sauce-spicy.jpg' },
    { id: 'curry', name: 'Карі', price50g: 35, price100g: 60, image: '/static/images/sauce-curry.jpg' },
    { id: 'lingonberry', name: 'Брусничний', price50g: 35, price100g: 60, image: '/static/images/sauce-lingonberry.jpg' },
    { id: 'tartar', name: 'Тартар', price50g: 35, price100g: 60, image: '/static/images/sauce-tartar.jpg' },
    { id: 'signature', name: 'Фірмовий', price50g: 35, price100g: 60, image: '/static/images/sauce-signature.jpg' },
    { id: 'cheese', name: 'Сирний', price50g: 35, price100g: 60, image: '/static/images/sauce-cheese.jpg' },
    { id: 'mustard', name: 'Французька гірчиця', price50g: 35, price100g: 60, image: '/static/images/sauce-mustard.jpg' },
    { id: 'sweet-chili', name: 'Солодкий чилі', price50g: 35, price100g: 60, image: '/static/images/sauce-mustard-correct.jpg' }
];

// Add quantity property to cart items
function addToCart(product, weight, selectedSauces) {
    const existingItem = cart.find(item =>
        item.id === product.id &&
        item.weight === weight &&
        JSON.stringify(item.sauces) === JSON.stringify(selectedSauces)
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Calculate price based on weight or fixed price for sets
        let calculatedPrice = 0;
        if (product.category === 'sets') {
            calculatedPrice = product.price;
        } else if (product.pricePer100g && weight) {
            calculatedPrice = (product.pricePer100g * weight) / 100;
        } else if (product.price) {
            calculatedPrice = product.price;
        } else if (product.pricePer100g) {
            calculatedPrice = product.pricePer100g;
        }

        const cartItem = {
            ...product,
            weight,
            sauces: selectedSauces,
            quantity: 1,
            price: Math.round(calculatedPrice), // Store calculated price
            cartId: Date.now()
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartUI();
}

// Scroll to menu or open cart
function scrollToMenu() {
    if (cart.length > 0) {
        openCart();
    } else {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle order button click
function handleOrderButton() {
    if (cart.length > 0) {
        openCart();
    } else {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }
}

// Open cart drawer - redirect to basket page
function openCart() {
    window.location.href = '/basket';
}

// Close cart drawer
function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    // Restore body scroll only on desktop
    if (window.innerWidth > 768) {
        document.body.style.overflow = '';
    }
    
    // Скрываем форму оплаты при закрытии корзины
    document.getElementById('checkout-form').classList.remove('active');
}

// Open product modal
function openProductModal(productId) {
    return;

    const product = products[productId];
    if (!product) return;
    
    currentProduct = product;
    
    const modalImage = document.getElementById('modal-product-image');
    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    modalImage.src = product.image;
    modalImage.style.display = 'block';
    modalPlaceholder.style.display = 'none';
    
    // Set placeholder emoji based on product
    const productEmojis = {
        'set-4-persons': '🍖',
        'set-6-persons': '🍖',
        'set-10-persons': '🍖',
        'pork-neck': '🍖',
        'chicken-fillet': '🍗',
        'chicken-thigh': '🍗',
        'pork-sausages': '🥓',
        'pork-ribs': '🍖',
        'chicken-wings': '🍗',
        'chicken-legs': '🍗',
        'chicken-thigh-grill': '🍗',
        'grilled-vegetables': '🥗',
        'baked-potatoes': '🥔',
        'marinated-onions': '🧅',
        'bell-pepper': '🫑',
        'mushrooms': '🍄',
        'zucchini': '🥒',
        'bean-pepper': '🫛',
        'cherry-tomatoes': '🍅',
        'corn': '🌽',
        'pork-chop': '🍖',
        'pork-liver': '🍖',
        'pork-tenderloin': '🍖',
        'rib-strip': '🍖',
        'grill-sausages': '🥓',
        'cherry-juice-1l': '🍒',
        'multifruit-juice-1l': '🍎',
        'tomato-juice-1l': '🍅',
        'cherry-juice-05l': '🍒',
        'multifruit-juice-05l': '🍎',
        'tomato-juice-05l': '🍅',
        'kvass-05l': '🍺',
        'kvass-1l': '🍺',
        'mojito-05l': '🍹',
        'mojito-1l': '🍹',
        'cola-zero-05l': '🥤',
        'cola-05l': '🥤',
        'cola-125l': '🥤',
        'pepsi-05l': '🥤',
        'pepsi-07l': '🥤',
        'pepsi-125l': '🥤',
        'pepsi-03l-glass': '🥤',
        'lipton-peach': '🍑',
        'lipton-lemon': '🍋',
        'lipton-green': '🍵',
        'kvass': '🍺',
        'mojito': '🍹'
    };
    modalPlaceholder.textContent = productEmojis[productId] || '🍖';
    
    document.getElementById('modal-product-title').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;

    // Set price based on product type
    if (product.category === 'sets') {
        document.getElementById('modal-product-price').textContent = product.price + ' грн';
        if (product.originalPrice) {
            document.getElementById('modal-product-price').textContent += ` (замість ${product.originalPrice} грн)`;
        }
    } else {
        document.getElementById('modal-product-price').textContent = product.pricePer100g + ' грн/100г';
    }

    // Set badges
    const badgesContainer = document.getElementById('modal-badges');
    badgesContainer.innerHTML = '';
    product.badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.className = `badge ${badge}`;
        badgeElement.textContent = getBadgeText(badge);
        badgesContainer.appendChild(badgeElement);
    });

    // For sets, hide weight and sauce selectors
    if (product.category === 'sets') {
        const modalOptions = document.querySelector('.modal-options');
        modalOptions.innerHTML = '';
    } else {
        // Populate sauces dynamically
        const saucesOptions = document.querySelector('.sauces-options');
        if (saucesOptions) {
            saucesOptions.innerHTML = sauces.map(sauce => `
                <div class="sauce-item">
                    <div class="sauce-name">${sauce.name}</div>
                    <div class="sauce-weights">
                        <label class="sauce-option">
                            <input type="checkbox" value="${sauce.id}" data-sauce='${JSON.stringify(sauce)}' data-weight="50">
                            <span>50г - ${sauce.price50g} грн</span>
                        </label>
                        <label class="sauce-option">
                            <input type="checkbox" value="${sauce.id}" data-sauce='${JSON.stringify(sauce)}' data-weight="100">
                            <span>100г - ${sauce.price100g} грн</span>
                        </label>
                    </div>
                </div>
            `).join('');
        }

        // Set active weight button
        document.querySelectorAll('.weight-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.weight-btn[data-weight="100"]').classList.add('active');

        // Clear all sauce checkboxes
        document.querySelectorAll('.sauce-option input').forEach(input => {
            input.checked = false;
        });
    }

    // Add event listeners for weight buttons (only for non-sets)
    if (product.category !== 'sets') {
        // Add event listeners for weight buttons
        document.querySelectorAll('.weight-btn').forEach(btn => {
            btn.onclick = function() {
                document.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateModalPrice();
            };
        });

        // Add event listeners for sauce checkboxes
        document.querySelectorAll('.sauce-option input').forEach(input => {
            input.onchange = updateModalPrice;
        });

        // Initial price update
        updateModalPrice();
    }

    document.getElementById('product-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Update modal price based on weight and sauces
function updateModalPrice() {
    if (!currentProduct) return;
    
    const selectedWeight = parseInt(document.querySelector('.weight-btn.active').dataset.weight);
    const selectedSauces = [];
    
    document.querySelectorAll('.sauce-option input:checked').forEach(input => {
        const sauce = JSON.parse(input.dataset.sauce);
        const sauceWeight = parseInt(input.dataset.weight);
        const saucePrice = sauceWeight === 50 ? sauce.price50g : sauce.price100g;
        selectedSauces.push({
            ...sauce,
            selectedWeight: sauceWeight,
            selectedPrice: saucePrice
        });
    });
    
    let totalPrice = (currentProduct.pricePer100g * selectedWeight / 100);
    
    selectedSauces.forEach(sauce => {
        totalPrice += sauce.selectedPrice;
    });
    
    document.getElementById('modal-product-price').textContent = Math.round(totalPrice) + ' грн';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').classList.remove('open');
    document.body.style.overflow = '';
    currentProduct = null;
    currentSauce = null;
    currentDrink = null;
}

// Get badge text
function getBadgeText(badge) {
    const badgeTexts = {
        'hit': 'Хіт вогню 🔥',
        'spicy': 'О гострота 🌶️',
        'new': 'Новинка',
        'veg': 'Веган 🌱',
        'popular': 'Популярний ⭐',
        'smoker': 'Смокер 🔥'
    };
    return badgeTexts[badge] || badge;
}

// Quick add to cart
function quickAdd(productId) {
    const product = products[productId];
    if (!product) return;

    // Calculate price based on product type
    let calculatedPrice = 0;
    if (product.category === 'sets') {
        calculatedPrice = product.price;
    } else if (product.isPerPiece) {
        calculatedPrice = product.pricePerUnit;
    } else if (product.pricePer100g) {
        calculatedPrice = product.pricePer100g;
    } else if (product.price) {
        calculatedPrice = product.price;
    }

    // For sets and per-piece items, use simplified logic
    if (product.category === 'sets' || product.isPerPiece) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.price = calculatedPrice;
        } else {
            const cartItem = {
                ...product,
                weight: product.isPerPiece ? product.unitWeight : undefined,
                quantity: 1,
                price: calculatedPrice,
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
    } else {
        const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.price = Math.round(calculatedPrice);
        } else {
            const cartItem = {
                ...product,
                weight: 100,
                sauces: [],
                quantity: 1,
                price: Math.round(calculatedPrice),
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
    }

    saveCart();
    updateCartUI();
    updateCardQuantities();
}

// Increase card quantity
function increaseCardQuantity(productId) {
    const product = products[productId];
    if (!product) return;

    const quantityElement = document.getElementById(`quantity-${productId}`);
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent) || 1;
        currentQuantity += 1;
        quantityElement.textContent = currentQuantity;
    }

    // Calculate price based on product type
    let calculatedPrice = 0;
    if (product.category === 'sets') {
        calculatedPrice = product.price;
    } else if (product.isPerPiece) {
        calculatedPrice = product.pricePerUnit;
    } else if (product.pricePer100g) {
        calculatedPrice = product.pricePer100g;
    } else if (product.price) {
        calculatedPrice = product.price;
    }

    // Update cart immediately
    if (product.category === 'sets' || product.isPerPiece) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = parseInt(quantityElement.textContent);
            existingItem.price = calculatedPrice;
        } else {
            const cartItem = {
                ...product,
                weight: product.isPerPiece ? product.unitWeight : undefined,
                quantity: parseInt(quantityElement.textContent),
                price: calculatedPrice,
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
    } else {
        const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
        if (existingItem) {
            existingItem.quantity = parseInt(quantityElement.textContent);
            existingItem.price = Math.round(calculatedPrice);
        } else {
            const cartItem = {
                ...product,
                weight: 100,
                sauces: [],
                quantity: parseInt(quantityElement.textContent),
                price: Math.round(calculatedPrice),
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
    }

    saveCart();
    updateCardPrice(productId);
    updateCartUI();
}

// Decrease card quantity
function decreaseCardQuantity(productId) {
    const product = products[productId];
    if (!product) return;

    const quantityElement = document.getElementById(`quantity-${productId}`);
    const currentDisplayedQuantity = parseInt(quantityElement.textContent) || 1;

    // Update cart immediately
    if (product.category === 'sets' || product.isPerPiece) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity > 1) {
                existingItem.quantity -= 1;
                quantityElement.textContent = existingItem.quantity;
            } else {
                // Remove item from cart
                cart = cart.filter(i => i.cartId !== existingItem.cartId);
                quantityElement.textContent = 1; // Reset display to 1
            }
        }
    } else {
        const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
        if (existingItem) {
            if (existingItem.quantity > 1) {
                existingItem.quantity -= 1;
                quantityElement.textContent = existingItem.quantity;
            } else {
                // Remove item from cart
                cart = cart.filter(i => i.cartId !== existingItem.cartId);
                quantityElement.textContent = 1; // Reset display to 1
            }
        }
    }

    saveCart();
    updateCardPrice(productId);
    updateCartUI();
}

// Update card quantities display
function updateCardQuantities() {
    Object.keys(products).forEach(productId => {
        const product = products[productId];
        const quantityElement = document.getElementById(`quantity-${productId}`);
        if (quantityElement) {
            let totalQuantity = 0;

            if (product.category === 'sets' || product.category === 'drinks' || product.isPerPiece) {
                // For sets, drinks, and per-piece items, just sum all quantities
                totalQuantity = cart
                    .filter(item => item.id === productId)
                    .reduce((sum, item) => sum + item.quantity, 0);
            } else {
                // For regular products, filter by weight and no sauces
                totalQuantity = cart
                    .filter(item => item.id === productId && item.weight === 100 && item.sauces.length === 0)
                    .reduce((sum, item) => sum + item.quantity, 0);
            }

            // Update to cart quantity, or reset to 1 if not in cart
            quantityElement.textContent = totalQuantity > 0 ? totalQuantity : 1;
        }
    });

    // Update sauce quantities
    sauces.forEach(sauce => {
        const quantityElement = document.getElementById(`quantity-sauce-${sauce.id}`);
        if (quantityElement) {
            const selectedWeight = selectedSauceWeights[sauce.id] || 50;
            const totalQuantity = cart
                .filter(item => item.type === 'sauce' && item.sauceId === sauce.id && item.weight === selectedWeight)
                .reduce((sum, item) => sum + item.quantity, 0);
            quantityElement.textContent = totalQuantity > 0 ? totalQuantity : 1;
        }
    });

    // Update per-piece weight labels (e.g. lavash) to match current quantity
    Object.keys(products).forEach(productId => {
        const product = products[productId];
        if (product.isPerPiece) {
            updateCardPrice(productId);
        }
    });
}

// Update card price based on displayed quantity
function updateCardPrice(productId) {
    const product = products[productId];
    if (!product) return;

    const priceElement = document.getElementById(`price-${productId}`);
    const quantityElement = document.getElementById(`quantity-${productId}`);

    if (priceElement && quantityElement) {
        const displayedQuantity = parseInt(quantityElement.textContent) || 1;

        if (product.category === 'sets') {
            // Fixed price for sets
            const totalPrice = product.price * displayedQuantity;
            priceElement.textContent = `${totalPrice} грн`;
        } else if (product.isPerPiece) {
            // Price per unit (e.g. lavash), multiplied by quantity
            const totalPrice = Math.round(product.pricePerUnit * displayedQuantity);
            priceElement.textContent = `${totalPrice} грн`;

            // Update the weight label on the card (125г -> 250г -> ...)
            const card = priceElement.closest('.product-card');
            const unitLabel = card ? card.querySelector('.product-unit') : null;
            if (unitLabel) {
                unitLabel.textContent = `За ${product.unitWeight * displayedQuantity}гр`;
            }
        } else if (product.pricePer100g) {
            // Price is per 100g, so multiply by quantity (each unit is 100g)
            const totalPrice = Math.round(product.pricePer100g * displayedQuantity);
            priceElement.textContent = `${totalPrice} грн`;
        } else if (product.price) {
            // Price is per item (drinks), so multiply by quantity
            priceElement.textContent = `${product.price * displayedQuantity} грн`;
        }
    }
    
    updateCartBadge();
}

// Update sauce card price based on displayed quantity
function updateSauceCardPrice(sauceId) {
    const priceElement = document.getElementById(`price-sauce-${sauceId}`);
    const quantityElement = document.getElementById(`quantity-sauce-${sauceId}`);
    
    if (!priceElement || !quantityElement) return;
    
    const displayedQuantity = parseInt(quantityElement.textContent) || 1;
    const selectedPrice = selectedSaucePrices[sauceId] || 40;
    
    const totalPrice = selectedPrice * displayedQuantity;
    priceElement.textContent = `${totalPrice} грн`;
    
    updateCartBadge();
}

// Add product directly to cart with selected quantity
function addToCartDirect(productId) {
    // Check if this is a sauce (starts with 'sauce-')
    if (productId.startsWith('sauce-')) {
        const sauceId = productId.replace('sauce-', '');
        addSauceToCartDirect(sauceId);
        return;
    }

    const product = products[productId];
    if (!product) return;

    // Get current quantity from the display
    const quantityElement = document.getElementById(`quantity-${productId}`);
    const currentQuantity = quantityElement ? parseInt(quantityElement.textContent) : 1;

    // Calculate price based on product type
    let calculatedPrice = 0;
    if (product.category === 'sets') {
        calculatedPrice = product.price;
    } else if (product.isPerPiece) {
        calculatedPrice = product.pricePerUnit;
    } else if (product.pricePer100g) {
        calculatedPrice = product.pricePer100g;
    } else if (product.price) {
        calculatedPrice = product.price;
    }

    // For sets and per-piece items, use simplified logic
    if (product.category === 'sets' || product.isPerPiece) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = currentQuantity;
            existingItem.price = calculatedPrice;
        } else {
            const cartItem = {
                ...product,
                weight: product.isPerPiece ? product.unitWeight : undefined,
                quantity: currentQuantity,
                price: calculatedPrice,
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
    } else {
        const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
        if (existingItem) {
            existingItem.quantity = currentQuantity;
            existingItem.price = Math.round(calculatedPrice);
        } else {
            const cartItem = {
                ...product,
                weight: 100,
                sauces: [],
                quantity: currentQuantity,
                price: Math.round(calculatedPrice),
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
    }

    saveCart();
    updateCartUI();
    updateCardQuantities();
    updateCardPrice(productId);
    showNotification('Додано в кошик!');
}

// Add sauce directly to cart (for Хочу button)
function addSauceToCartDirect(sauceId) {
    const sauce = sauces.find(s => s.id === sauceId);
    if (!sauce) return;

    const selectedWeight = selectedSauceWeights[sauceId] || 50;
    const selectedPrice = selectedSaucePrices[sauceId] || sauce.price50g;

    const existingItem = cart.find(item => item.type === 'sauce' && item.sauceId === sauceId && item.weight === selectedWeight);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const cartItem = {
            type: 'sauce',
            sauceId: sauce.id,
            name: sauce.name,
            weight: selectedWeight,
            price: selectedPrice,
            quantity: 1,
            cartId: Date.now()
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartUI();
    updateCardQuantities();
    updateSauceCardPrice(sauceId);
    showNotification('Додано в кошик!');
}

// Open sauce modal
function openSauceModal(sauceId) {
    const sauce = sauces.find(s => s.id === sauceId);
    if (!sauce) return;
    
    const modalImage = document.getElementById('modal-product-image');
    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    modalImage.src = sauce.image;
    modalImage.style.display = 'block';
    modalPlaceholder.style.display = 'none';
    
    modalImage.onerror = function() {
        this.style.display = 'none';
        modalPlaceholder.style.display = 'flex';
        const sauceEmojis = {
            'garlic': '🧄',
            'spicy': '🌶️',
            'curry': '🍛',
            'lingonberry': '🫐',
            'tartar': '🥄',
            'signature': '⭐',
            'cheese': '🧀',
            'mustard': '🌾',
            'sweet-chili': '🌶️'
        };
        modalPlaceholder.textContent = sauceEmojis[sauceId] || '🥫';
    };
    
    document.getElementById('modal-product-title').textContent = sauce.name;
    document.getElementById('modal-product-description').textContent = 'Оберіть вагу соусу';
    document.getElementById('modal-product-price').textContent = sauce.price50g + ' грн/50г';
    
    // Clear badges
    const badgesContainer = document.getElementById('modal-badges');
    badgesContainer.innerHTML = '';
    
    // Add weight selector
    const weightSelector = document.createElement('div');
    weightSelector.className = 'weight-selector';
    weightSelector.innerHTML = `
        <h3>Вага</h3>
        <div class="weight-options">
            <button class="weight-btn active" data-weight="50">50г</button>
            <button class="weight-btn" data-weight="100">100г</button>
        </div>
    `;
    
    // Replace options
    const modalOptions = document.querySelector('.modal-options');
    modalOptions.innerHTML = '';
    modalOptions.appendChild(weightSelector);
    
    // Store current sauce
    currentSauce = sauce;
    
    // Add event listeners for weight buttons
    weightSelector.querySelectorAll('.weight-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            weightSelector.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateSauceModalPrice();
        });
    });
    
    document.getElementById('product-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Update sauce modal price
function updateSauceModalPrice() {
    if (!currentSauce) return;
    
    const selectedWeight = parseInt(document.querySelector('.weight-btn.active').dataset.weight);
    const price = selectedWeight === 50 ? currentSauce.price50g : currentSauce.price100g;
    
    document.getElementById('modal-product-price').textContent = price + ' грн';
}

// Increase sauce quantity
function increaseSauceQuantity(sauceId) {
    const sauce = sauces.find(s => s.id === sauceId);
    if (!sauce) return;
    
    const selectedWeight = selectedSauceWeights[sauceId] || 50;
    const selectedPrice = selectedSaucePrices[sauceId] || sauce.price50g;
    
    const quantityElement = document.getElementById(`quantity-sauce-${sauceId}`);
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent) || 1;
        currentQuantity += 1;
        quantityElement.textContent = currentQuantity;
    }
    
    const existingItem = cart.find(item => item.type === 'sauce' && item.sauceId === sauceId && item.weight === selectedWeight);
    if (existingItem) {
        existingItem.quantity = parseInt(quantityElement.textContent);
    } else {
        const cartItem = {
            type: 'sauce',
            sauceId: sauce.id,
            name: sauce.name,
            weight: selectedWeight,
            price: selectedPrice,
            quantity: parseInt(quantityElement.textContent),
            cartId: Date.now()
        };
        cart.push(cartItem);
    }
    
    saveCart();
    updateCartUI();
    updateCardQuantities();
    updateSauceCardPrice(sauceId);
}

// Decrease sauce quantity
function decreaseSauceQuantity(sauceId) {
    const sauce = sauces.find(s => s.id === sauceId);
    if (!sauce) return;

    const selectedWeight = selectedSauceWeights[sauceId] || 50;
    const selectedPrice = selectedSaucePrices[sauceId] || sauce.price50g;

    const quantityElement = document.getElementById(`quantity-sauce-${sauceId}`);
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent) || 1;
        if (currentQuantity > 1) {
            currentQuantity -= 1;
            quantityElement.textContent = currentQuantity;
        } else {
            // Don't go below 1 on the display
            currentQuantity = 1;
        }
    }

    const existingItem = cart.find(item => item.type === 'sauce' && item.sauceId === sauceId && item.weight === selectedWeight);
    if (existingItem) {
        const displayedQuantity = parseInt(quantityElement.textContent);
        if (displayedQuantity > 0) {
            existingItem.quantity = displayedQuantity;
        } else {
            cart = cart.filter(i => i.cartId !== existingItem.cartId);
        }
    }

    saveCart();
    updateCardQuantities();
    updateSauceCardPrice(sauceId);
}

// Add to cart from modal
function addToCartFromModal() {
    if (currentSauce) {
        // Add sauce
        const selectedWeight = parseInt(document.querySelector('.weight-btn.active').dataset.weight);

        const existingItem = cart.find(item =>
            item.type === 'sauce' &&
            item.sauceId === currentSauce.id &&
            item.weight === selectedWeight
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const cartItem = {
                type: 'sauce',
                sauceId: currentSauce.id,
                name: currentSauce.name,
                weight: selectedWeight,
                price: selectedWeight === 50 ? currentSauce.price50g : currentSauce.price100g,
                quantity: 1,
                cartId: Date.now()
            };
            cart.push(cartItem);
        }

        saveCart();
        closeProductModal();
        updateCartUI();
        updateCardQuantities();
        showNotification('Соус додано в кошик!');
    } else if (currentProduct && currentProduct.category === 'sets') {
        // Add set
        const existingItem = cart.find(item => item.id === currentProduct.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const cartItem = {
                ...currentProduct,
                quantity: 1,
                price: currentProduct.price,
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
        saveCart();
        closeProductModal();
        updateCartUI();
        updateCardQuantities();
        showNotification('Сет додано в кошик!');
    } else if (currentProduct) {
        // Add regular product
        const selectedWeight = parseInt(document.querySelector('.weight-btn.active').dataset.weight);
        const selectedSauces = [];

        document.querySelectorAll('.sauce-option input:checked').forEach(input => {
            const sauce = JSON.parse(input.dataset.sauce);
            const sauceWeight = parseInt(input.dataset.weight);
            const saucePrice = sauceWeight === 50 ? sauce.price50g : sauce.price100g;
            selectedSauces.push({
                ...sauce,
                selectedWeight: sauceWeight,
                selectedPrice: saucePrice
            });
        });

        addToCart(currentProduct, selectedWeight, selectedSauces);
        closeProductModal();
        showNotification('Додано в кошик!');
    } else if (currentDrink) {
        // Add drink
        const existingItem = cart.find(item => item.id === currentDrink.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const cartItem = {
                ...currentDrink,
                quantity: 1,
                cartId: Date.now()
            };
            cart.push(cartItem);
        }
        saveCart();
        closeProductModal();
        updateCartUI();
        updateCardQuantities();
        showNotification('Напій додано в кошик!');
    }
}

// Update cart badge
function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalQuantity;
    }
}

// Update cart UI
function updateCartUI() {
    const cartBadge = document.getElementById('cart-badge');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');

    // Update badge
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalQuantity;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p>Ваш кошик порожній</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => {
            let itemPrice, itemText;

            if (item.type === 'sauce') {
                itemPrice = item.price;
                itemText = `${item.weight}г`;
            } else if (item.category === 'sets') {
                // Handle sets
                itemPrice = item.price;
                itemText = '';
            } else if (item.category === 'drinks') {
                // Handle drinks
                itemPrice = item.price;
                itemText = item.volume || '';
            } else if (item.isPerPiece) {
                // Handle per-piece items (e.g. lavash)
                itemPrice = item.price;
                itemText = item.weight ? `${item.weight}г` : '';
            } else {
                // Handle regular products
                itemPrice = Math.round((item.pricePer100g * item.weight / 100) + (item.sauces ? item.sauces.reduce((sum, sauce) => sum + sauce.price50g, 0) : 0));
                const saucesText = item.sauces && item.sauces.length > 0 ? item.sauces.map(s => s.name).join(', ') : '';
                itemText = `${item.weight}г${saucesText ? ', ' + saucesText : ''}`;
            }

            const itemTotal = itemPrice * item.quantity;

            return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-details">${itemText}</p>
                </div>
                <div class="cart-item-right">
                    <div class="cart-item-price">${itemTotal} грн</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" onclick="event.stopPropagation(); decreaseQuantity(${item.cartId})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="event.stopPropagation(); increaseQuantity(${item.cartId})">+</button>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    // Update total price
    const total = cart.reduce((sum, item) => {
        let itemPrice;
        if (item.type === 'sauce') {
            itemPrice = item.price;
        } else if (item.category === 'sets') {
            // Handle sets
            itemPrice = item.price;
        } else if (item.category === 'drinks') {
            // Handle drinks
            itemPrice = item.price;
        } else if (item.isPerPiece) {
            // Handle per-piece items (e.g. lavash)
            itemPrice = item.price;
        } else {
            // Handle regular products
            itemPrice = Math.round((item.pricePer100g * item.weight / 100) + (item.sauces ? item.sauces.reduce((sum, sauce) => sum + sauce.price50g, 0) : 0));
        }
        return sum + (itemPrice * item.quantity);
    }, 0);
    totalPrice.textContent = total + ' грн';

    // Save cart to localStorage
    saveCart();
}

// Increase quantity
function increaseQuantity(cartId) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
        updateCardQuantities();
    }
}

// Decrease quantity
function decreaseQuantity(cartId) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart = cart.filter(i => i.cartId !== cartId);
        }
        saveCart();
        updateCartUI();
        updateCardQuantities();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #E76F51;
        color: #FFFFFF;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 4000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Category selection
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Filter products
            const category = this.dataset.category;
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const cardCategory = card.dataset.category;

                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            // Scroll to appropriate section
            if (category === 'sauces') {
                document.getElementById('sauces').scrollIntoView({ behavior: 'smooth' });
            } else {
                document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Toggle checkout form
function toggleCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;
    
    checkoutForm.classList.toggle('active');
    
    // Show payment and messenger sections when form opens
    try {
        const paymentSection = document.querySelector('.payment-section');
        const messengerSection = document.querySelector('.messenger-section');
        
        if (checkoutForm.classList.contains('active')) {
            if (paymentSection) paymentSection.style.display = 'block';
            if (messengerSection) messengerSection.style.display = 'block';
        } else {
            if (paymentSection) paymentSection.style.display = 'none';
            if (messengerSection) messengerSection.style.display = 'none';
        }
    } catch (e) {
        console.log('Error toggling sections:', e);
    }
    
    // Scroll to the form on mobile when it opens
    if (checkoutForm.classList.contains('active') && window.innerWidth <= 768) {
        setTimeout(() => {
            checkoutForm.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }
}

// Close modals on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCart();
        closeProductModal();
    }
});

// Initialize card quantities on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCardQuantities();
    addUnitLabelsToProductCards();
    updateAllCardPrices();
    convertToSimpleProductCards();
});

// Add "за 100г" labels to all product cards
function addUnitLabelsToProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productImage = card.querySelector('.product-image');
        if (productImage && !productImage.querySelector('.product-unit')) {
            const category = card.dataset.category;
            // Add unit label only for food products (not drinks)
            if (category !== 'drinks' && category !== 'sauces' && category !== 'sets') {
                // Try to resolve the underlying product to check for per-piece pricing
                const onclick = card.getAttribute('onclick');
                const match = onclick ? onclick.match(/open(?:Product|Drink)Modal\('([^']+)'\)/) : null;
                const productId = match ? match[1] : null;
                const product = productId ? products[productId] : null;

                const unitLabel = document.createElement('div');
                unitLabel.className = 'product-unit';
                unitLabel.textContent = (product && product.isPerPiece)
                    ? `За ${product.unitWeight}гр`
                    : 'За 100гр';
                productImage.appendChild(unitLabel);
            }
        }
    });
}

// Update all card prices to remove "/100g" suffix and add IDs
function updateAllCardPrices() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const priceElement = card.querySelector('.product-price');
        if (priceElement) {
            const currentText = priceElement.textContent;
            if (currentText.includes('/100г')) {
                const newPrice = currentText.replace('/100г', '').trim();
                priceElement.textContent = newPrice;
            }

            // Add ID to price element for dynamic updates
            const onclick = card.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/openProductModal\('([^']+)'\)/);
                if (match) {
                    const productId = match[1];
                    priceElement.id = `price-${productId}`;
                }
            }
        }
    });
}

// Convert all product cards to new format with description and quantity selector
function convertToSimpleProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const category = card.dataset.category;
        // Only convert food products, not drinks, sauces, or sets
        if (category !== 'drinks' && category !== 'sauces' && category !== 'sets') {
            const productInfo = card.querySelector('.product-info');
            const productTitle = card.querySelector('.product-title');

            if (productInfo && productTitle) {
                // Add description if not exists
                if (!productInfo.querySelector('.product-description-new')) {
                    const description = document.createElement('p');
                    description.className = 'product-description-new';
                    productInfo.insertBefore(description, productTitle.nextSibling);
                }

                // Update info class
                productInfo.classList.add('product-info-new');

                const productFooter = card.querySelector('.product-footer');
                if (productFooter) {
                    const priceElement = productFooter.querySelector('.product-price');
                    const quantitySelector = productFooter.querySelector('.product-quantity');

                    if (priceElement) {
                        // Remove old structure
                        if (quantitySelector) {
                            quantitySelector.remove();
                        }

                        // Change footer class
                        productFooter.classList.remove('product-footer');
                        productFooter.classList.add('product-footer-new');

                        // Get product ID
                        const onclick = card.getAttribute('onclick');
                        if (onclick) {
                            const match = onclick.match(/openProductModal\('([^']+)'\)/);
                            if (match) {
                                const productId = match[1];

                                // Clear footer
                                productFooter.innerHTML = '';

                                // Create price row
                                const priceRow = document.createElement('div');
                                priceRow.className = 'product-price-row';

                                // Add price element
                                const newPriceElement = document.createElement('div');
                                newPriceElement.className = 'product-price-new';
                                newPriceElement.id = `price-${productId}`;
                                newPriceElement.textContent = priceElement.textContent.replace('/100г', '').trim();
                                priceRow.appendChild(newPriceElement);

                                // Create quantity selector
                                const quantitySelectorNew = document.createElement('div');
                                quantitySelectorNew.className = 'quantity-selector-new';

                                const minusBtn = document.createElement('button');
                                minusBtn.className = 'quantity-btn-new';
                                minusBtn.textContent = '-';
                                minusBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    decreaseCardQuantity(productId);
                                };

                                const quantityValue = document.createElement('span');
                                quantityValue.className = 'quantity-value-new';
                                quantityValue.id = `quantity-${productId}`;
                                quantityValue.textContent = '1';

                                const plusBtn = document.createElement('button');
                                plusBtn.className = 'quantity-btn-new';
                                plusBtn.textContent = '+';
                                plusBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    increaseCardQuantity(productId);
                                };

                                quantitySelectorNew.appendChild(minusBtn);
                                quantitySelectorNew.appendChild(quantityValue);
                                quantitySelectorNew.appendChild(plusBtn);
                                priceRow.appendChild(quantitySelectorNew);

                                productFooter.appendChild(priceRow);

                                // Create "Хочу" button
                                const wantBtn = document.createElement('button');
                                wantBtn.className = 'want-btn-new';
                                wantBtn.textContent = 'Хочу';
                                wantBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    addToCartDirect(productId);
                                };

                                productFooter.appendChild(wantBtn);
                            }
                        }
                    }
                }
            }
        }
    });
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #E8DCC4;
        border-radius: 10px;
        margin-bottom: 10px;
    }
    
    .cart-item-info h4 {
        font-family: 'Syne', sans-serif;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #264653;
    }
    
    .cart-item-details {
        font-size: 12px;
        color: #6B7A80;
    }
    
    .cart-item-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
    }
    
    .cart-item-price {
        font-family: 'Syne', sans-serif;
        font-size: 16px;
        font-weight: 700;
        color: #E76F51;
    }
    
    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .quantity-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: #FDF6EB;
        border: 1px solid #E5D9C7;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        color: #264653;
        transition: all 0.2s ease;
    }
    
    .quantity-btn:hover {
        background: #E76F51;
        color: #FFFFFF;
        border-color: #E76F51;
    }
    
    .quantity-value {
        font-size: 14px;
        font-weight: 600;
        color: #264653;
        min-width: 20px;
        text-align: center;
    }
    
    .weight-selector h3,
    .sauces-selector h3 {
        font-family: 'Syne', sans-serif;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #3D2B1F;
    }
    
    .weight-options {
        display: flex;
        gap: 10px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }
    
    .weight-btn {
        padding: 10px 20px;
        background: #FDF6EB;
        border: 1px solid #E5D9C7;
        border-radius: 10px;
        color: #264653;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .weight-btn:hover {
        border-color: #E76F51;
    }
    
    .weight-btn.active {
        background: #E76F51;
        border-color: #E76F51;
        color: #FFFFFF;
    }
    
    .sauces-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .sauce-option {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }
    
    .sauce-option input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: #E76F51;
    }
    
    .sauce-option span {
        font-size: 14px;
        color: #264653;
    }
`;
document.head.appendChild(style);



function sendOrderToMessenger(messengerType) {
    console.log("SEND ORDER TO MESSENGER:", messengerType);
    console.log("CART:", cart);

    const name = document.getElementById("customer-name").value.trim();
    const surname = document.getElementById("customer-surname").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();

    // Проверяем поля
    if (!name || !surname || !phone) {
        alert("Будь ласка, заповніть усі контактні поля.");
        return;
    }

    // Проверяем корзину
    if (cart.length === 0) {
        alert("Ваш кошик порожній.");
        return;
    }

    // Получаем данные доставки
    const deliveryMethod = document.querySelector('.toggle-group[data-group="delivery-method"] .toggle-btn.active').dataset.value;
    let deliveryInfo = "";
    
    if (deliveryMethod === "courier") {
        const city = document.getElementById("delivery-city").value;
        const street = document.getElementById("delivery-street").value.trim();
        const house = document.getElementById("delivery-house").value.trim();
        const entrance = document.getElementById("delivery-entrance").value.trim();
        const apartment = document.getElementById("delivery-apartment").value.trim();
        const floor = document.getElementById("delivery-floor").value.trim();
        const intercom = document.getElementById("delivery-intercom").value.trim();
        
        if (!street || !house) {
            alert("Будь ласка, заповніть адресу доставки.");
            return;
        }
        
        deliveryInfo = `Доставка кур'єром\n`;
        deliveryInfo += `Адреса: м. ${city}, вул. ${street}, буд. ${house}`;
        if (entrance) deliveryInfo += `, під'їзд ${entrance}`;
        if (apartment) deliveryInfo += `, кв. ${apartment}`;
        if (floor) deliveryInfo += `, ${floor} поверх`;
        if (intercom) deliveryInfo += `, домофон ${intercom}`;
        deliveryInfo += "\n";
    } else {
        deliveryInfo = `Самовивіз\n`;
        deliveryInfo += `Адреса: м. Чернівці, вул. Південно-Кільцева, 45А\n`;
    }

    // Получаем данные времени доставки
    const deliveryTime = document.querySelector('.toggle-group[data-group="delivery-time"] .toggle-btn.active').dataset.value;
    let timeInfo = "";
    
    if (deliveryTime === "asap") {
        timeInfo = "Час: Якомога швидше\n";
    } else {
        const date = document.getElementById("scheduled-date").value;
        const timeValue = document.getElementById("scheduled-time-value").value;
        
        if (!date || !timeValue) {
            alert("Будь ласка, оберіть дату та час доставки.");
            return;
        }
        
        timeInfo = `Час: ${date} о ${timeValue}\n`;
    }

    // Получаем данные оплаты
    const paymentMethod = document.querySelector('.toggle-group[data-group="payment-method"] .toggle-btn.active').dataset.value;
    let paymentInfo = "";
    
    if (paymentMethod === "cash") {
        paymentInfo = "Оплата: Готівка при отриманні\n";
        const cashChange = document.getElementById("cash-change").value.trim();
        const noChange = document.getElementById("no-change").checked;
        
        if (cashChange) {
            paymentInfo += `Решта з: ${cashChange} грн\n`;
        } else if (noChange) {
            paymentInfo += "Без решти\n";
        }
    } else {
        paymentInfo = "Оплата: Через термінал\n";
    }

    // Получаем комментарий
    const comment = document.getElementById("comment-field").value.trim();
    let commentInfo = "";
    if (comment) {
        commentInfo = `Коментар: ${comment}\n`;
    }

    // Создаём список заказа
    let orderText = "";
    let total = 0;

    console.log(cart);

    cart.forEach(item => {

        const itemPrice = getItemPrice(item);
        const itemTotal = itemPrice * item.quantity;

        // Формуємо текст для товару
        let itemText = `• ${item.name}`;

        // Додаємо вагу для звичайних товарів
        if (item.type !== 'sauce' && item.weight) {
            itemText += ` (${item.weight}г)`;
        }

        // Додаємо соуси, якщо є
        if (item.sauces && item.sauces.length > 0) {
            const sauceDetails = item.sauces.map(s => {
                const weight = s.selectedWeight ? s.selectedWeight : '50';
                return `${s.name} (${weight}г)`;
            }).join(', ');
            itemText += ` + ${sauceDetails}`;
        }

        itemText += ` × ${item.quantity} — ${itemTotal} грн\n`;
        orderText += itemText;

        total += itemTotal;
});

    // Формируем сообщение
    const message =
`Нове замовлення

👤 Контактні дані:
Ім'я: ${name}
Прізвище: ${surname}
Телефон: ${phone}

📍 Доставка:
${deliveryInfo}
⏰ ${timeInfo}
💳 ${paymentInfo}
${commentInfo}
🛒 Замовлення:
${orderText}
💰 Разом: ${total} грн`;

    // Telegram
    if (messengerType === "telegram") {
        // Check message length to avoid 400 error
        const maxLength = 3500; // Safe limit for Telegram URLs
        let finalMessage = message;
        
        if (message.length > maxLength) {
            // Truncate the order text if too long
            const headerLength = message.indexOf('🛒 Замовлення:');
            const footer = `\n💰 Разом: ${total} грн`;
            const availableSpace = maxLength - headerLength - footer.length - 50; // 50 for safety
            
            if (availableSpace > 100) {
                finalMessage = message.substring(0, headerLength) + 
                    '🛒 Замовлення:\n' + 
                    orderText.substring(0, availableSpace) + 
                    '...\n(Замовлення скорочено через обмеження)\n' + 
                    footer;
            } else {
                finalMessage = message.substring(0, maxLength - 50) + '...';
            }
        }

        const telegramUrl =
            "https://t.me/shahlk_cv?text=" +
            encodeURIComponent(finalMessage);

        // Use direct location change for mobile devices to avoid popup blocking
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.location.href = telegramUrl;
        } else {
            window.open(telegramUrl, "_blank");
        }

    // WhatsApp
    } else if (messengerType === "whatsapp") {

        const restaurantPhone = "380996615777";

        const whatsappUrl =
            "https://wa.me/" +
            restaurantPhone +
            "?text=" +
            encodeURIComponent(message);

        // Use direct location change for mobile devices to avoid popup blocking
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, "_blank");
        }
    }
}

function confirmOrder() {
    const name = document.getElementById("customer-name").value.trim();
    const surname = document.getElementById("customer-surname").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();

    if (!name || !surname || !phone) {
        alert("Будь ласка, заповніть усі поля.");
        return;
    }

    if (cart.length === 0) {
        alert("Ваш кошик порожній.");
        return;
    }

    const messenger = document.querySelector('input[name="messenger"]:checked');
    if (!messenger) {
        alert("Будь ласка, оберіть спосіб зв'язку (Telegram або WhatsApp).");
        return;
    }

    sendOrderToMessenger(messenger.value);

    // Clear cart after successful order
    cart = [];
    saveCart();
    updateCartUI();
    updateCardQuantities();
}

function getItemPrice(item) {

    // Если это соус
    if (item.type === "sauce") {
        return Number(item.price);
    }

    // Если это сет
    if (item.category === "sets") {
        return Number(item.price);
    }

    // Если это напій (сік, квас, мохіто)
    if (item.category === "drinks" || item.category === "draft") {
        return Number(item.price);
    }

    // Если это товар з фіксованою ціною за штуку (напр. лаваш)
    if (item.isPerPiece) {
        return Number(item.price);
    }

    // Если это обычное блюдо
    let price = (Number(item.pricePer100g) * Number(item.weight)) / 100;

    // Добавляем соусы к блюду
    if (item.sauces && item.sauces.length > 0) {
        price += item.sauces.reduce((sum, sauce) => {
            // Use selectedPrice if available, otherwise fall back to price50g
            const saucePrice = sauce.selectedPrice ? Number(sauce.selectedPrice) : Number(sauce.price50g);
            return sum + saucePrice;
        }, 0);
    }

    return Math.round(price);
}

// мінімальна дата — сьогодні
document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('scheduled-date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
});

// === ВІДОБРАЖЕННЯ ОБРАНОЇ ДАТИ ===
function setupDateSelectDisplay(inputId, displayId, wrapperId, formatFn, placeholder) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    const wrapper = document.getElementById(wrapperId);
    if (!input || !display || !wrapper) return; // защита от отсутствующих элементов

    function update() {
        if (input.value) {
            display.textContent = formatFn(input.value);
            display.classList.remove('placeholder');
        } else {
            display.textContent = placeholder;
            display.classList.add('placeholder');
        }
    }

    input.addEventListener('change', update);
    input.addEventListener('focus', () => wrapper.classList.add('focused'));
    input.addEventListener('blur', () => wrapper.classList.remove('focused'));

    wrapper.addEventListener('click', () => {
        // Mobile-friendly approach
        if (input.type === 'date') {
            // On mobile, just clicking the input should trigger the native picker
            input.click();
            input.focus();
        } else if (input.showPicker) {
            try { input.showPicker(); } catch (e) {
                input.focus();
            }
        } else {
            input.focus();
        }
    });

    update();
}

document.addEventListener('DOMContentLoaded', function () {
    setupDateSelectDisplay(
        'scheduled-date',
        'scheduled-date-display',
        'date-wrapper',
        (val) => {
            const [y, m, d] = val.split('-');
            return `${d}-${m}-${y}`;
        },
        'Виберіть дату'
    );
});

// === КАСТОМНИЙ ВИБІР ЧАСУ (крок 20 хв, графік роботи) ===
const WORKING_HOURS = {
    weekday: { start: 8 * 60, end: 22 * 60 },
    weekend: { start: 10 * 60, end: 22 * 60 }
};
const STEP_MINUTES = 20;

function getWorkingRangeForDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    return (day === 0 || day === 6) ? WORKING_HOURS.weekend : WORKING_HOURS.weekday;
}

function minutesToLabel(mins) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
}

function buildTimeOptions() {
    const dateInput = document.getElementById('scheduled-date');
    const list = document.getElementById('time-dropdown-list');
    const display = document.getElementById('scheduled-time-display');
    const hiddenInput = document.getElementById('scheduled-time-value');
    if (!dateInput || !list || !display || !hiddenInput) return;

    list.innerHTML = '';

    const selectedDate = dateInput.value;
    if (!selectedDate) {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.textContent = 'Спочатку оберіть дату';
        item.style.color = '#999';
        item.style.cursor = 'default';
        list.appendChild(item);
        return;
    }

    const range = getWorkingRangeForDate(selectedDate);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = selectedDate === todayStr;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let start = range.start;
    if (isToday && nowMinutes > start) {
        start = Math.ceil(nowMinutes / STEP_MINUTES) * STEP_MINUTES;
    }

    let hasOptions = false;
    for (let mins = start; mins <= range.end; mins += STEP_MINUTES) {
        hasOptions = true;
        const label = minutesToLabel(mins);
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.textContent = label;
        item.dataset.value = label;
        item.addEventListener('click', () => {
            display.textContent = label;
            display.classList.remove('placeholder');
            hiddenInput.value = label;
            list.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            closeTimeDropdown();
        });
        list.appendChild(item);
    }

    if (!hasOptions) {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.textContent = 'На сьогодні немає вільного часу';
        item.style.color = '#999';
        item.style.cursor = 'default';
        list.appendChild(item);
    }
}

function openTimeDropdown() {
    buildTimeOptions();
    const trigger = document.getElementById('time-trigger');
    const list = document.getElementById('time-dropdown-list');
    if (!trigger || !list) return;
    trigger.classList.add('open');
    list.classList.add('open');
    setTimeout(() => {
        list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
}

function closeTimeDropdown() {
    const trigger = document.getElementById('time-trigger');
    const list = document.getElementById('time-dropdown-list');
    if (trigger) trigger.classList.remove('open');
    if (list) list.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function () {
    const timeTrigger = document.getElementById('time-trigger');
    if (timeTrigger) {
        timeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const list = document.getElementById('time-dropdown-list');
            const isOpen = list && list.classList.contains('open');
            isOpen ? closeTimeDropdown() : openTimeDropdown();
        });
    }

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('time-dropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            closeTimeDropdown();
        }
    });

    const dateInput = document.getElementById('scheduled-date');
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            const display = document.getElementById('scheduled-time-display');
            const hidden = document.getElementById('scheduled-time-value');
            if (display) {
                display.textContent = 'Виберіть час*';
                display.classList.add('placeholder');
            }
            if (hidden) hidden.value = '';
        });
    }

    document.querySelectorAll('#cart-drawer .toggle-group[data-group="payment-method"] .toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.closest('.toggle-group');
            group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const isCash = btn.dataset.value === 'cash';
            const cashRow = document.getElementById('cash-row');
            if (cashRow) cashRow.style.display = isCash ? 'flex' : 'none';
        });
    });
});

function selectMessenger(type, btnEl) {
    selectedMessenger = type;
    document.querySelectorAll('.messenger-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
}