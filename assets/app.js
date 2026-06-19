const cl = console.log;
const form = document.getElementById('commentForm');
const  nameControl = document.getElementById('name');
const emailControl = document.getElementById('email');
const bodyControl = document.getElementById('body');
const cContainer = document.getElementById('cContainer');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const spinner = document.getElementById('spinner');


let commentArr = [];
let baseURL = "https://jsonplaceholder.typicode.com";
let posturl = `${baseURL}/comments`;

function snackbar(msg,icon){
    Swal.fire({
        title:msg,
        icon:icon,
        timer:3000
    });
}
function makeApiCall(methodName,api_url,body=null,successCb,errorCb){
    spinner.classList.remove('d-none');
    
    body = body ? JSON.stringify(body):null
    let xhr = new XMLHttpRequest();
    xhr.open(methodName,api_url);
    xhr.send(body);

    xhr.onload = function (){
        if(xhr.status>=200 && xhr.status<= 299){
            let respose = JSON.parse(xhr.response);
            if(methodName === 'GET'){
                successCb(respose);
            }else if (methodName === 'POST'){
                let obj = {...JSON.parse(body),id:respose.id}
                successCb(obj);
            }else if(methodName === 'PATCH' || methodName === 'PUT'){
                successCb(JSON.parse(body));
            }else{
                successCb();
            }
            
        }else{
            errorCb(xhr)
        }
        spinner.classList.add('d-none');
    }
}

function createCard(arr){
    let result = '';
    arr.forEach(comment=>{
        result+=`
        <div class= 'col-md-3 mb-3' id='${comment.id}'>
        <div class='card shadow-lg h-100'>
        <div class='card-header'>
        <h1 class="">${comment.name}</h1>       
        </div>
        <div class='card-body'>
        <p><strong>Email:${comment.email}</strong></p>
        <p class='mb-3'>${comment.body}</p>
        </div>
        <div class='card-footer d-flex justify-content-between'>
        <button class="btn btn-primary btn-sm" onclick="onEdit(this)">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="onRemove(this)">Delete</button>   
        </div>        
        </div>        
        </div>`

    });
    cContainer.innerHTML=result;
}
makeApiCall('GET',posturl,null,createCard,snackbar);


function onCreate(eve){
    eve.preventDefault();
    let newObj = {
        name:nameControl.value,
        email:emailControl.value,
        body:bodyControl.value
    }
   
    makeApiCall('POST',posturl,newObj,createCardOnUi,snackbar)
}

function createCardOnUi(response){
    let div = document.createElement('div');
    div.className='col-md-3';
    div.id = response.id;
    div.innerHTML = ` <div class='card shadow-lg h-100'>
        <div class='card-header'>
        <h1 class="">${response.name}</h1>       
        </div>
        <div class='card-body'>
        <p><strong>Email:${response.email}</strong></p>
        <p class='mb-3'>${response.body}</p>
        </div>
        <div class='card-footer d-flex justify-content-between'>
        <button class="btn btn-primary btn-sm" onclick="onEdit(this)">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="onRemove(this)">Delete</button>   
        </div>        
        </div>`
        cContainer.prepend(div);
        form.reset();
        snackbar("comment Created successfully", "success");

}
form.addEventListener('submit',onCreate);


function onRemove(ele){
    let removeId = ele.closest('.col-md-3').id;
    let remove_url = `${baseURL}/comments/${removeId}`;
   
     Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {          
             localStorage.setItem('removeId',removeId);
            makeApiCall('DELETE',remove_url,null,removeOnUi,snackbar)
        }
    });
   

}
function removeOnUi(){
    let removeId = localStorage.getItem('removeId');
    document.getElementById(removeId).remove();
     snackbar(" Comment Deleted successfully", "success");
}


function onEdit(ele){
    let editId = ele.closest('.col-md-3').id;
    localStorage.setItem('editId',editId);
    let editURl =`${baseURL}/comments/${editId}`;
    makeApiCall('GET',editURl,null,patchOnUi,snackbar)
}

function patchOnUi(editObj){
    nameControl.value = editObj.name;
    emailControl.value = editObj.email;
    bodyControl.value = editObj.body;
    addBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none')
     form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


function onUpdate() {
    let updateId = localStorage.getItem('editId');
    let updateUrl = `${baseURL}/comments/${updateId}`;
    let updateObj = {
        id: updateId,
        name: nameControl.value,
        email: emailControl.value,
        body: bodyControl.value
    };
    makeApiCall('PATCH', updateUrl, updateObj, updatePostCard, snackbar);
}
function updatePostCard(updateObj) {
    let div = document.getElementById(updateObj.id);
    let h1 = div.querySelector('.card-header h1');
    let pTags = div.querySelectorAll('.card-body p');
    h1.innerText = updateObj.name;
    pTags[0].innerHTML = `<strong>Email: ${updateObj.email}</strong>`;
    pTags[1].innerText = updateObj.body;
    addBtn.classList.remove('d-none');
    updateBtn.classList.add('d-none');
   
        div.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
         snackbar(" comment Updated successfully", "success");


    form.reset();
}
updateBtn.addEventListener('click',onUpdate);