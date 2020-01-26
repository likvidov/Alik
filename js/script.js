'use strict';
document.addEventListener('DOMContentLoaded', () =>{
    const search = document.querySelector('.search'),
    cardBtn = document.getElementById('cart'),
    wishListBtn = document.getElementById('wishlist'),
    goodsWrapper = document.querySelector('.goods-wrapper'),
    card = document.querySelector('.cart'),
    cartCloseBtn = document.querySelector('.cart-close'),
    category = document.querySelector('.category'),
    cardCounter = cardBtn.querySelector('.counter'),
    cartWrapper = document.querySelector('.cart-wrapper'),
    wishlistCounter = wishListBtn.querySelector('.counter')
    
    const wishlist = [];

    let goodsBasket = {};

    const loading = (nameFunction) => {
        const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
        </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>`;
        if (nameFunction === 'renderCard'){
            goodsWrapper.innerHTML = spinner;
        }
        if (nameFunction === 'renderBasket'){
            cartWrapper.innerHTML = spinner;
        }
    };

    const createCardGoods = (id, title, price, img) =>{
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `<div class="card">
                            <div class="card-img-wrapper">
                                <img class="card-img-top" src="${img}" alt="">
                                <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" data-goods-id="${id}"></button>
                            </div>
                            <div class="card-body justify-content-between">
                                <a href="#" class="card-title">${title}</a>
                                <div class="card-price">${price}</div>
                                <div>
                                    <button class="card-add-cart" data-goods-id=${id} >Добавить в корзину</button>
                                </div>
                            </div>
                        </div>`;
        return card;
    };

    const renderCard = items => { 
        goodsWrapper.textContent = '';
        if(items.length){
            items.forEach(({id, title, price, imgMin}) => {
                goodsWrapper.append(createCardGoods(id, title, price, imgMin));
                //console.log(item);
            });
        }
       else{
           goodsWrapper.textContent = 'Извините, мы не нашли товаров по вашему запросу!';
       }
    };    

    const createCardGoodsBasket = (id, title, price, img) =>{
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `<div class="goods">
                            <div class="goods-img-wrapper">
                                <img class="goods-img" src="${img}" alt="">
                            </div>
                            <div class="goods-description">
                                <h2 class="goods-title">${title}</h2>
                                <p class="goods-price">${price}</p>
                            </div>
                            <div class="goods-price-count">
                                <div class="goods-trigger">
                                    <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" 
                                        data-goods-id="${id}"></button>
                                    <button class="goods-delete" data-goods-id="${id}"></button>
                                </div>
                                <div class="goods-count">${goodsBasket[id]}</div>
                            </div>
                        </div>`;
        return card;
    };

    const renderBasket = items => { 
        cartWrapper.textContent = '';
        if(items.length){
            items.forEach(({id, title, price, imgMin}) => {
                cartWrapper.append(createCardGoodsBasket(id, title, price, imgMin));
                //console.log(item);
            });
        }
       else{
            cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div>';
       }
    };    

    // goodsWrapper.appendChild(createCardGoods(1,'Дартс', 2000, 'img/temp/Archer.jpg'));
    // goodsWrapper.appendChild(createCardGoods(2,'Фламинго', 3000, 'img/temp/Flamingo.jpg'));
    // goodsWrapper.appendChild(createCardGoods(3,'Носки', 333, 'img/temp/Socks.jpg'));

    const calcTotalPrice = goods => {
        let summa = goods.reduce((accum, item)=>{
            return accum + item.price * goodsBasket[item.id];
        }, 0);

        // for(const item of goods){
        //     summa += item.price * goodsBasket[item.id];
        // }
        card.querySelector('.cart-total>span').textContent = summa.toFixed(2);
    };

    const showCardBasket = goods =>{
        const basketGoods = goods.filter(item => goodsBasket.hasOwnProperty(item.id));
        calcTotalPrice(basketGoods);
        return basketGoods;
    };

    const openCard = (event) =>{
        event.preventDefault();
        card.style.display = 'flex';
        document.addEventListener('keyup', closeCard);
        getGoods(renderBasket, showCardBasket);
    };

    const closeCard = event =>{
        const target = event.target; 
        if(target === card || target === cartCloseBtn || event.keyCode === 27){
            card.style.display = '';
            document.removeEventListener('keyup', closeCard);
        };
    };    

    // document.addEventListener('keydown', function(event) {
    //     if (event.key == 'Escape' && card.style.display == 'flex') {
    //         card.style.display = '';
    //     }
    //   });

    const getGoods = (handler, filter) =>{
        loading(handler.name);
        fetch('db/db.json')
            .then(response => response.json())
            .then(filter)
            .then(handler);
    };

    const randomSort = (item) => {
        return item.sort(() => Math.random() - 0.5);
    };

    const choiceCategory = event => {
        event.preventDefault();
        const target = event.target;

        if(target.classList.contains('category-item')){
            const category = target.dataset.category;
            getGoods(renderCard, goods => goods.filter(item => item.category.includes(category)));
        };
    };

    const searchGoods = event => {
        event.preventDefault();
        const input = event.target.elements.searchGoods;
        const inputValue = input.value.trim();
        if (inputValue !== ''){
            getGoods(renderCard, goods => goods.forEach(item => {
                const searchString = new RegExp(inputValue, 'i');
                getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
            }));
        }
        else{
            search.classList.add('error');
            setTimeout(() => {
                search.classList.remove('error');
            }, 2000);
        }

        input.value = '';
    };

    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const cookieQuery = (get) => {
        if (get){
            if(getCookie('goodsBasket')){
                Object.assign(goodsBasket, JSON.parse(getCookie('goodsBasket')));
                //goodsBasket = JSON.parse(getCookie('goodsBasket')); 
            }
            checkCount();
        } else{
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age=86400e3`;
        }
    };

    const checkCount = () =>{
        wishlistCounter.textContent = wishlist.length;
        cardCounter.textContent = Object.keys(goodsBasket).length;
    };

    const storageQuery = (get) => {
        if(get){
            if(localStorage.getItem('whishlist'))
            {
                wishlist.splice(Infinity, 0, ...JSON.parse(localStorage.getItem('whishlist')));
                // const whishlistStorage = JSON.parse(localStorage.getItem('whishlist'));
                // whishlistStorage.forEach(id => wishlist.push(id));
            }
            checkCount();
        } else{
            localStorage.setItem('whishlist', JSON.stringify(wishlist));
        }

        checkCount();
    };
    
    const toggleWishlist = (id, elem) =>{
        if(wishlist.includes(id)){
            wishlist.splice(wishlist.indexOf(id), 1);
            elem.classList.remove('active');
            showWishlist();
        }else{
            wishlist.push(id);
            elem.classList.add('active');
        }  
        storageQuery();
        checkCount();
    };

    const addBasket = id =>{
        if(goodsBasket[id]){
            goodsBasket[id]+= 1;
        } else{
            goodsBasket[id] = 1;
        }
        checkCount();
        cookieQuery();
    };

    const handlerGoods = event => {
        const target = event.target;
        if (target.classList.contains('card-add-wishlist')){
            toggleWishlist(target.dataset.goodsId,target);
        }

        if (target.classList.contains('card-add-cart')){
            addBasket(target.dataset.goodsId);
        }
    };
    
    const showWishlist = () =>{
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)));
    };

    const removeGoods = (id) =>{
        delete goodsBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showCardBasket);
    };

    const handlerBasket = event => {
        const target = event.target;
        if (target.classList.contains('goods-add-wishlist')){
            toggleWishlist(target.dataset.goodsId,target);
        }

        if (target.classList.contains('goods-delete')){
            removeGoods(target.dataset.goodsId);
        }
    };


    {
        getGoods(renderCard, randomSort);
        storageQuery(true);
        cookieQuery(true);

        cardBtn.addEventListener('click', openCard);
        card.addEventListener('click',closeCard);
        cartCloseBtn.addEventListener('click', closeCard);
        category.addEventListener('click', choiceCategory);
        search.addEventListener('submit', searchGoods);
        goodsWrapper.addEventListener('click', handlerGoods);
        cartWrapper.addEventListener('click', handlerBasket);
        wishListBtn.addEventListener('click', showWishlist);
    }
});