let orderData;
function init(){
    getCartOrder();
}
init();
//訂單資料
const cartOrderList = document.querySelector('.cartOrderList');
function getCartOrder(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token
        }
    })
    .then(function(response){
        orderData = response.data.orders;
        let str = '';
        orderData.forEach(function(item){
            //訂單品項處理
            let orderPro = '';
            item.products.forEach(function(proItem){
                orderPro += `<p>${proItem.title} x ${proItem.quantity}</p>`;
            })
            //訂單日期處理
            let thisDate = new Date(item.createdAt * 1000);
            let orderDate = `${thisDate.getFullYear()}/${thisDate.getMonth()+1}/${thisDate.getDate()}`;
            //訂單狀態處理
            let orderStatus = '';
            if(item.paid == true){
                orderStatus = '已處理'
            }else{
                orderStatus = '未處理'
            }
            //render 訂單資料
            str += `<tr>
            <td>${item.id}</td>
            <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
            <p>${orderPro}</p>
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
            <a href="#" class="orderStatusBtn" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
            </td>
        </tr>`;
        })
        cartOrderList.innerHTML = str;
        renderC3();
    })
}

//cartOrderList 大範圍監聽
cartOrderList.addEventListener('click',function(e){
    e.preventDefault();
    //訂單狀態
    if(e.target.getAttribute('class') == 'orderStatusBtn'){
        changeOrderStatus(e.target.dataset.id,e.target.dataset.status);
        return
    }
    //刪除單筆訂單
    if(e.target.getAttribute('class') == ('delSingleOrder-Btn')){
        delSingleOrderList(e.target.dataset.id);
        return
    }
})
//修改訂單狀態
function changeOrderStatus(id,status) {
    let newStatus;
    if(status == 'true') {
        newStatus = false
    }else{
        newStatus = true
    }
    axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/`,
    {
        "data":{
            "id":id,
            "paid":newStatus
        }
    },
    {
        headers:{
            'Authorization':token
        }
    })
    .then(function(response){
        alert('更改狀態');
        getCartOrder();
    })
}

//刪除單筆
function delSingleOrderList(id){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}`,
    {
        headers:{
            'Authorization':token
        }
    })
    .then(function(response){
        alert('已刪除訂單資料！！');
        getCartOrder();
    })
}
//刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    delAllOrderList();
})
function delAllOrderList(){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/`,
    {
        headers:{
            'Authorization':token
        }
    })
    .then(function(response){
        alert('已刪除全部訂單資料！！');
        getCartOrder();
    })
}


// C3.js
function renderC3(){
    //物件資料
    let total = {}; // {收納: 5010, 床架: 30000, 窗簾: 1200}
    orderData.forEach(function(item){
        item.products.forEach(function(proItem){
            if(total[proItem.category] == undefined){
                total[proItem.category] = proItem.price * proItem.quantity;
            }else{
                total[proItem.category] += proItem.price * proItem.quantity;
            }
        })
    });
    //資料關聯
    let categoryAry = Object.keys(total); //["收納", "床架", "窗簾"]
    let newCategoryAry = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newCategoryAry.push(ary);
    })
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newCategoryAry,
            colors:{
                "床架":"#DACBFF",
                "收納":"#9D7FEA",
                "窗簾": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}
