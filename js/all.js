let proData; //產品 data
let cartData; //購物車 data


//初始化
function init(){
    getProList();
    getCartList();
}
init();
//取得產品列表
const productWrap = document.querySelector('.productWrap');
function getProList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        proData = response.data.products;
        selectList(proData);
        //render proList
        let str = '';
        proData.forEach(function(item){
            str += `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="${item.title}">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`
        })
        productWrap.innerHTML = str;
    })
}

//select 篩選列表
const productSelect = document.querySelector('.productSelect');
function selectList(data){
    let categoryAry = data.map(function(item) {
        return item.category;
        //["床架", "床架", "床架", "床架", "窗簾", "收納", "收納", "床架"]
     });
     let filterAry = categoryAry.filter(function(item,i){
         return categoryAry.indexOf(item) === i
         //[ "床架", "窗簾", "收納"]
     })
     filterAry.unshift('全部');
     //["全部", "床架", "窗簾", "收納"]
    //  console.log(filterAry);

     //render select 篩選列表
     let str = '';
     filterAry.forEach(function(item){
        str += `<option value="${item}">${item}</option>`
     })
     productSelect.innerHTML = str;
}
//select 篩選
productSelect.addEventListener('change',function(e){
    console.log(e.target.value);
    if(e.target.value == '全部'){
        init();
        return
    }
    let str = '';
    proData.forEach(function(item){
        if(e.target.value == item.category){
            str += `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="${item.title}">
            <a href="#" class="addCardBtn">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`
        }
        productWrap.innerHTML = str;
    })
})

//取得購物車列表
const cartList = document.querySelector('.cartList');
function getCartList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        cartData = response.data.carts;
        //總金額
        const finalTotal = document.querySelector('.finalTotal');
        finalTotal.textContent = `NT$ ${response.data.finalTotal}`;
        //render 購物車列表
        let str = '';
        cartData.forEach(function(item){
            str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="${item.product.title}">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>
            <a href="#" class="icon-editNum"><i class="fas fa-plus" data-num="${item.quantity + 1}" data-id="${item.id}" ></i></a>
            <span>${item.quantity}</span>
            <a href="#" class="icon-editNum"><i class="fas fa-minus" " data-num="${item.quantity - 1}" data-id="${item.id}"></i></a>
                </td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons js-delBtn" data-id="${item.id}">
                clear</a>
            </td>
        </tr>`;
        })
        cartList.innerHTML = str;
        if(cartData.length == 0){
            cartList.innerHTML = `<tr class="cartContent"><td colspan="5" style="text-align:center">購物車目前沒東西 QQ</td></tr>`;
        }
        //購物車加減數量
        const iconEditNum = document.querySelectorAll('.icon-editNum');
        iconEditNum.forEach(function(item){
            item.addEventListener('click', function(e){
                e.preventDefault();
                cartEditNum(e.target.dataset.id , e.target.dataset.num)
            })
        })
        //刪除購物車 - 單一
        const disSinBtn = document.querySelectorAll('.js-delBtn');
        disSinBtn.forEach(function(item){
            item.addEventListener('click', function(e){
                e.preventDefault();
                delSingleCartList(e.target.dataset.id);
            })
        })
    })
}

//加入購物車
//向外監聽 productWrap
productWrap.addEventListener('click',function(e){
    e.preventDefault();
    //如果點擊購物車按鈕外就不執行
    if(e.target.nodeName !== 'A'){
        return
    }
    let targetId = e.target.getAttribute('data-id');
    let num = 1;
    cartData.forEach(function(item){
        if(item.product.id == targetId){
            num = item.quantity+=1;
        }
    })
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
          "productId": targetId,
          "quantity": num
        }
      })
    .then(function(response){
        alert('已加入購物車');
        getCartList();
    })
})

//購物車加減數量
function cartEditNum(id,num){
    if(num > 0 ){
        axios.patch(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
          "id": id,
          "quantity": parseInt(num)
        }
      })
        .then(function(response){
            alert('修改數量成功！！');
            getCartList()
        })
    }else{
        delSingleCartList(id);
    }
}

//刪除購物車 - 單一
function delSingleCartList(id){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${id}`)
    .then(function(response) {
        getCartList();
    })
}

//刪除購物車 - 全部
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response) {
        alert('已刪除全部購物車物品！！');
        getCartList();
    })
})

//訂單資料
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const form = document.querySelector('form');
const orderInfoMessage = document.querySelectorAll('.orderInfo-message');

orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert('購物車空空喔！請選擇一件商品');
        return
    }
    if(customerName.value == '' || customerPhone.value == '' || customerEmail.value == '' || customerAddress.value == ''){
        alert('請正確填寫資料！！');
    }
    SendCartOrder();
    form.reset();
    tradeWay.value == 'ATM';
})
function SendCartOrder(){
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
          "user": {
            "name": customerName.value,
            "tel": customerPhone.value,
            "email": customerEmail.value,
            "address": customerAddress.value,
            "payment": tradeWay.value
          }
        }
      })
    .then(function(response){
        alert('訂單建立成功！');
        getCartList();
    });
}