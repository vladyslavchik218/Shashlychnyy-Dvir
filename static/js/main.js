// Cart functionality
let cart = [];
let currentProduct = null;
let currentSauce = null;

// Product data (in real app, this would come from backend)
const products = {
    'pork-neck': {
        id: 'pork-neck',
        name: 'Шашлик зі свинного ошийка',
        description: 'Соковита свинина на кістці, маринована за авторським рецептом',
        pricePer100g: 85,
        image: '/static/images/pork-neck.jpg',
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
        category: 'chicken'
    },
    'chicken-thigh': {
        id: 'chicken-thigh',
        name: 'Шашлик з стегна курячого',
        description: 'Соковите куряче стегно на мангалі',
        pricePer100g: 80,
        image: '/static/images/chicken-thigh.jpg',
        badges: [],
        category: 'chicken'
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
        pricePer100g: 70,
        image: '/static/images/pork-ribs.jpg',
        badges: ['popular'],
        category: 'shashlik'
    },
    'chicken-wings': {
        id: 'chicken-wings',
        name: 'Крильця курячі',
        description: 'Хрусткі крильця в соусі BBQ з копченням',
        pricePer100g: 50,
        image: '/static/images/chicken-wings.jpg',
        badges: ['new'],
        category: 'chicken'
    },
    'chicken-legs': {
        id: 'chicken-legs',
        name: 'Гомілки курячі',
        description: 'Соковиті гомілки на мангалі',
        pricePer100g: 50,
        image: '/static/images/chicken-legs.jpg',
        badges: [],
        category: 'chicken'
    },
    'chicken-thigh-grill': {
        id: 'chicken-thigh-grill',
        name: 'Стегно куряче',
        description: 'Ціле куряче стегно на кістці',
        pricePer100g: 50,
        image: '/static/images/chicken-thigh-grill.jpg',
        badges: [],
        category: 'chicken'
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
    }
};

// Sauces data
const sauces = [
    { id: 'garlic', name: 'Часниковий', price50g: 40, price100g: 70 },
    { id: 'spicy', name: 'Гострий', price50g: 40, price100g: 70 },
    { id: 'curry', name: 'Карі', price50g: 40, price100g: 70 },
    { id: 'lingonberry', name: 'Брусничний', price50g: 40, price100g: 70 },
    { id: 'tartar', name: 'Тартар', price50g: 40, price100g: 70 },
    { id: 'signature', name: 'Фірмовий', price50g: 40, price100g: 70 },
    { id: 'cheese', name: 'Сирний', price50g: 40, price100g: 70 },
    { id: 'mustard', name: 'Французька гірчиця', price50g: 40, price100g: 70 },
    { id: 'sweet-chili', name: 'Солодкий чилі', price50g: 40, price100g: 70 }
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
        const cartItem = {
            ...product,
            weight,
            sauces: selectedSauces,
            quantity: 1,
            cartId: Date.now()
        };
        cart.push(cartItem);
    }
    
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

// Open cart drawer
function openCart() {
    document.getElementById('cart-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close cart drawer
function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.body.style.overflow = '';
}

// Open product modal
function openProductModal(productId) {
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
        'pork-neck': '🍖',
        'chicken-fillet': '🍗',
        'chicken-thigh': '�',
        'pork-sausages': '�',
        'pork-ribs': '🍖',
        'chicken-wings': '🍗',
        'chicken-legs': '🍗',
        'chicken-thigh-grill': '🍗',
        'grilled-vegetables': '🥗',
        'baked-potatoes': '🥔',
        'marinated-onions': '🧅'
    };
    modalPlaceholder.textContent = productEmojis[productId] || '🍖';
    
    document.getElementById('modal-product-title').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-product-price').textContent = product.pricePer100g + ' грн/100г';
    
    // Set badges
    const badgesContainer = document.getElementById('modal-badges');
    badgesContainer.innerHTML = '';
    product.badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.className = `badge ${badge}`;
        badgeElement.textContent = getBadgeText(badge);
        badgesContainer.appendChild(badgeElement);
    });
    
    // Add weight selector
    const weightSelector = document.createElement('div');
    weightSelector.className = 'weight-selector';
    weightSelector.innerHTML = `
        <h3>Вага</h3>
        <div class="weight-options">
            <button class="weight-btn active" data-weight="100">100г</button>
            <button class="weight-btn" data-weight="200">200г</button>
            <button class="weight-btn" data-weight="300">300г</button>
            <button class="weight-btn" data-weight="500">500г</button>
        </div>
    `;
    
    // Add sauces selector
    const saucesSelector = document.createElement('div');
    saucesSelector.className = 'sauces-selector';
    saucesSelector.innerHTML = `
        <h3>Соуси (додатково)</h3>
        <div class="sauces-options">
            ${sauces.map(sauce => `
                <label class="sauce-option">
                    <input type="checkbox" value="${sauce.id}" data-sauce='${JSON.stringify(sauce)}'>
                    <span>${sauce.name} - ${sauce.price50g} грн/50г, ${sauce.price100g} грн/100г</span>
                </label>
            `).join('')}
        </div>
    `;
    
    // Replace options with new ones
    const modalOptions = document.querySelector('.modal-options');
    modalOptions.innerHTML = '';
    modalOptions.appendChild(weightSelector);
    modalOptions.appendChild(saucesSelector);
    
    // Add event listeners for weight buttons
    weightSelector.querySelectorAll('.weight-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            weightSelector.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateModalPrice();
        });
    });
    
    // Add event listeners for sauce checkboxes
    saucesSelector.querySelectorAll('.sauce-option input').forEach(input => {
        input.addEventListener('change', updateModalPrice);
    });
    
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
        selectedSauces.push(sauce);
    });
    
    let totalPrice = (currentProduct.pricePer100g * selectedWeight / 100);
    
    selectedSauces.forEach(sauce => {
        totalPrice += sauce.price50g; // Default to 50g
    });
    
    document.getElementById('modal-product-price').textContent = Math.round(totalPrice) + ' грн';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').classList.remove('open');
    document.body.style.overflow = '';
    currentProduct = null;
    currentSauce = null;
}

// Get badge text
function getBadgeText(badge) {
    const badgeTexts = {
        'hit': 'Хіт вогню 🔥',
        'spicy': 'О гострота 🌶️',
        'new': 'Новинка',
        'veg': 'Веган 🌱',
        'popular': 'Популярний ⭐'
    };
    return badgeTexts[badge] || badge;
}

// Quick add to cart
function quickAdd(productId) {
    const product = products[productId];
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const cartItem = {
            ...product,
            weight: 100,
            sauces: [],
            quantity: 1,
            cartId: Date.now()
        };
        cart.push(cartItem);
    }
    
    updateCartUI();
    updateCardQuantities();
}

// Increase card quantity
function increaseCardQuantity(productId) {
    const product = products[productId];
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const cartItem = {
            ...product,
            weight: 100,
            sauces: [],
            quantity: 1,
            cartId: Date.now()
        };
        cart.push(cartItem);
    }
    
    updateCartUI();
    updateCardQuantities();
}

// Decrease card quantity
function decreaseCardQuantity(productId) {
    const product = products[productId];
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === product.id && item.weight === 100 && item.sauces.length === 0);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart = cart.filter(i => i.cartId !== existingItem.cartId);
        }
    }
    
    updateCartUI();
    updateCardQuantities();
}

// Update card quantities display
function updateCardQuantities() {
    Object.keys(products).forEach(productId => {
        const quantityElement = document.getElementById(`quantity-${productId}`);
        if (quantityElement) {
            const totalQuantity = cart
                .filter(item => item.id === productId && item.weight === 100 && item.sauces.length === 0)
                .reduce((sum, item) => sum + item.quantity, 0);
            quantityElement.textContent = totalQuantity;
        }
    });
    
    // Update sauce quantities
    sauces.forEach(sauce => {
        const quantityElement = document.getElementById(`quantity-sauce-${sauce.id}`);
        if (quantityElement) {
            const totalQuantity = cart
                .filter(item => item.type === 'sauce' && item.sauceId === sauce.id && item.weight === 50)
                .reduce((sum, item) => sum + item.quantity, 0);
            quantityElement.textContent = totalQuantity;
        }
    });
}

// Open sauce modal
function openSauceModal(sauceId) {
    const sauce = sauces.find(s => s.id === sauceId);
    if (!sauce) return;
    
    const modalImage = document.getElementById('modal-product-image');
    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    modalImage.style.display = 'none';
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

// Open sauce modal
function openSauceModal(sauceId) {
    const sauce = sauces.find(s => s.id === sauceId);
    if (!sauce) return;
    
    const modalImage = document.getElementById('modal-product-image');
    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    modalImage.style.display = 'none';
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
    currentProduct = null;
    
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
    
    const existingItem = cart.find(item => item.type === 'sauce' && item.sauceId === sauceId && item.weight === 50);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const cartItem = {
            type: 'sauce',
            sauceId: sauce.id,
            name: sauce.name,
            weight: 50,
            price: sauce.price50g,
            quantity: 1,
            cartId: Date.now()
        };
        cart.push(cartItem);
    }
    
    updateCartUI();
    updateCardQuantities();
}

// Decrease sauce quantity
function decreaseSauceQuantity(sauceId) {
    const existingItem = cart.find(item => item.type === 'sauce' && item.sauceId === sauceId && item.weight === 50);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart = cart.filter(i => i.cartId !== existingItem.cartId);
        }
    }
    
    updateCartUI();
    updateCardQuantities();
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
        
        closeProductModal();
        updateCartUI();
        updateCardQuantities();
        showNotification('Соус додано в кошик!');
    } else if (currentProduct) {
        // Add regular product
        const selectedWeight = parseInt(document.querySelector('.weight-btn.active').dataset.weight);
        const selectedSauces = [];
        
        document.querySelectorAll('.sauce-option input:checked').forEach(input => {
            const sauce = JSON.parse(input.dataset.sauce);
            selectedSauces.push(sauce);
        });
        
        addToCart(currentProduct, selectedWeight, selectedSauces);
        closeProductModal();
        showNotification('Додано в кошик!');
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
            } else {
                itemPrice = Math.round((item.pricePer100g * item.weight / 100) + item.sauces.reduce((sum, sauce) => sum + sauce.price50g, 0));
                const saucesText = item.sauces.length > 0 ? item.sauces.map(s => s.name).join(', ') : '';
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
        } else {
            itemPrice = Math.round((item.pricePer100g * item.weight / 100) + item.sauces.reduce((sum, sauce) => sum + sauce.price50g, 0));
        }
        return sum + (itemPrice * item.quantity);
    }, 0);
    totalPrice.textContent = total + ' грн';
}

// Increase quantity
function increaseQuantity(cartId) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += 1;
        updateCartUI();
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
        updateCartUI();
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
document.querySelectorAll('.category-item').forEach(item => {
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

// Toggle checkout form
function toggleCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.classList.toggle('active');
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
});

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
