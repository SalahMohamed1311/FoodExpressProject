let isLoggedIn = JSON.parse(sessionStorage.getItem('isLoggedIn')) || false;
let isAdmin = JSON.parse(sessionStorage.getItem('isAdmin')) || false;
let cartItems = JSON.parse(localStorage.getItem('myCart')) || [];

function setLoginState(status, userIsAdmin = false) {
    isLoggedIn = status;
    isAdmin = userIsAdmin;
    sessionStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    sessionStorage.setItem('isAdmin', JSON.stringify(isAdmin));
    updateNavbarLinks();
}

function navigateTo(pageUrl) {
    window.location.href = pageUrl;
}

function goToHomePage() {
    navigateTo('/HTML/index.html');
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        setLoginState(false, false);
        goToHomePage();
    }
}

function updateNavbarLinks() {
    const loginRegisterLink = document.querySelector('nav a[href="login.html"], nav a[href="javascript:handleLogout();"]');
    const adminLink = document.querySelector('nav a[href="admin.html"]');

    if (loginRegisterLink) {
        if (isLoggedIn) {
            loginRegisterLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginRegisterLink.href = 'javascript:handleLogout();';
        } else {
            loginRegisterLink.innerHTML = '<i class="fas fa-user"></i> Login / Register';
            loginRegisterLink.href = '/HTML/login.html';
        }
    }

    if (adminLink) {
        if (isAdmin) {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }
}

function handleLogin(event) {
    event.preventDefault(); 
    const usernameInput = document.querySelector('input[type="text"][placeholder="Username"]');
    const passwordInput = document.querySelector('input[type="password"][placeholder="Password"]');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (username === 'admin' && password === 'admin123') {
        setLoginState(true, true);
        navigateTo('/HTML/admin.html');
    } else if (username.length > 0 && password.length > 0) {
        setLoginState(true, false);
        navigateTo('/HTML/restaurants.html'); 
    } else {
        alert('Invalid credentials.');
    }
}

function handleRegister(event) {
    event.preventDefault(); 
    const passwordInput = document.querySelector('input[type="password"][placeholder="Password"]');
    const confirmInput = document.querySelector('input[type="password"][placeholder="Confirm Password"]');

    if (passwordInput.value !== confirmInput.value) {
        alert('Passwords do not match!');
        return;
    }
    alert('Registration Successful!');
    navigateTo('/HTML/login.html');
}

function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cartItems));
}

function addToCart(itemName, itemPrice, itemImageSrc) {
    if (!isLoggedIn) {
        alert("Must be logged in to add items.");
        navigateTo('/HTML/login.html');
        return;
    }
    
    const existingItem = cartItems.find(function(item) {
        return item.name === itemName;
    });
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ 
            name: itemName, 
            price: parseFloat(itemPrice), 
            quantity: 1,
            imageSrc: itemImageSrc 
        });
    }
    
    saveCart();
    alert(itemName + ' added to cart! Redirecting to Cart...'); 
    navigateTo('/HTML/cart.html');
}

function updateQuantity(itemName, change) {
    const item = cartItems.find(function(i) {
        return i.name === itemName;
    });

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(itemName);
        } else {
            saveCart();
            renderCart(); 
        }
    }
}

function removeItem(itemName) {
    cartItems = cartItems.filter(function(item) {
        return item.name !== itemName;
    });
    saveCart();
    renderCart();
}

function proceedToCheckout() {
    sessionStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    localStorage.removeItem('myCart');
    cartItems = [];
    navigateTo('/HTML/checkout.html');
}

function renderCart() {
    const cartContainer = document.querySelector('.cart-container');
    if (!cartContainer) return; 
    
    let total = 0;
    let itemsHtml = ''; 
    
    if (cartItems.length === 0) {
        itemsHtml = '<p style="text-align: center; padding: 20px;">Your cart is empty. Start ordering!</p>';
    } else {
        cartItems.forEach(function(item) {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            itemsHtml += `
            <div class="cart-item">
                <div class="item-info">
                    <img src="${item.imageSrc}" alt="${item.name}" /> 
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>${item.price.toFixed(2)} L.E</p>
                    </div>
                </div>
                
                <div class="quantity">
                    <button onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
                
                <button class="remove-btn" onclick="removeItem('${item.name}')">Remove</button>
            </div>
            `;
        });
    }
    
    const checkoutAreaHtml = `
        <div class="total-box" style="padding: 15px; font-weight: bold; border-top: 1px solid #ccc; margin-top: 15px; width: 100%; text-align: right;">
            Order Total: ${total.toFixed(2)} L.E
        </div>
        <button class="checkout-btn" onclick="proceedToCheckout()" ${cartItems.length === 0 ? 'disabled' : ''}
            style="width: 100%; padding: 10px; background-color: #ff5722; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; font-size: 16px;">
            Proceed to Checkout
        </button>
    `;

    cartContainer.innerHTML = itemsHtml + checkoutAreaHtml;
}

function renderCheckout() {
    const summaryBox = document.querySelector('.order-summary-box');
    if (!summaryBox) return;

    const itemsToCheckout = JSON.parse(sessionStorage.getItem('checkoutItems')) || [];

    let total = 0;
    let htmlContent = '';

    if (itemsToCheckout.length === 0) {
        htmlContent = '<p>Your cart is empty.</p>';
    } else {
        itemsToCheckout.forEach(function(item) {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            htmlContent += `<p>${item.name} (x${item.quantity}): <span>${itemTotal.toFixed(2)} L.E</span></p>`;
        });
        
        htmlContent += '<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ccc;">';
        
        htmlContent += `<p style="font-size: 1.2em;"><b>Total: ${total.toFixed(2)} L.E</b></p>`;
    }

    summaryBox.innerHTML = htmlContent;
}

function handleCheckout(event) {
    event.preventDefault(); 
    const fullName = document.querySelector('input[name="fullname"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    
    if (!fullName || !phone) {
        alert('Please complete shipping info.');
        return;
    }
    
    alert('Order Placed Successfully!');
    sessionStorage.removeItem('checkoutItems');
    goToHomePage();
}

document.addEventListener('DOMContentLoaded', function() {
    
    updateNavbarLinks();
    
    if (window.location.pathname.includes('/HTML/login.html')) {
        const form = document.querySelector('body .wrapper form');
        if (form) form.addEventListener('submit', handleLogin);
    }
    
    if (window.location.pathname.includes('/HTML/register.html')) {
        const form = document.querySelector('body .wrapper form');
        if (form) form.addEventListener('submit', handleRegister);
    }

    if (window.location.pathname.includes('/HTML/restaurants.html')) {
        const restaurantCards = document.querySelectorAll('.grid .card');
        
        restaurantCards.forEach(function(card) {
            const button = card.querySelector('.btn');
            const restaurantNameElement = card.querySelector('h3');
            
            if (button && restaurantNameElement) {
                let name = restaurantNameElement.textContent.trim();
                let fileName;

                if (name.includes('حبايب العش')) {
                    fileName = '/HTML/menu(عش الحبايب).html';
                } else if (name.includes('THE BUN House')) {
                    fileName = '/HTML/menu(bunhouse).html';
                } else if (name.includes('Sub way')) {
                    fileName = '/HTML/menu(subway).html';
                } else if (name.includes('White & Blue')) {
                    fileName = '/HTML/menu(white&blue).html';
                } else if (name.includes('Napoletana')) {
                    fileName = '/HTML/menu(napoletana).html'; 
                }

                if (fileName) {
                    button.addEventListener('click', function() {
                        navigateTo(fileName);
                    });
                }
            }
        });
    }

    const menuCards = document.querySelectorAll('.grid .card');
    menuCards.forEach(function(card) {
        const button = card.querySelector('button');
        
        if (button && button.textContent.trim() === 'Add to Cart') {
            const itemName = card.querySelector('h3').textContent.trim();
            const priceText = card.querySelector('p').textContent.replace('L.E', '').trim();
            const itemPrice = parseFloat(priceText) || 0; 
            
            const itemImageTag = card.querySelector('img');
            const itemImageSrc = itemImageTag ? itemImageTag.src : 'https://via.placeholder.com/80'; 
            
            button.addEventListener('click', function() {
                addToCart(itemName, itemPrice, itemImageSrc);
            });
        }
    });

    if (window.location.pathname.includes('/HTML/cart.html')) {
        renderCart();
    }
    
    if (window.location.pathname.includes('/HTML/checkout.html')) {
        renderCheckout();
        const form = document.querySelector('body form');
        if (form) form.addEventListener('submit', handleCheckout);
    }
});