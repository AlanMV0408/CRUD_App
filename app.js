//Url de la APIrest donde se almacenan los productos
const API_URL = 'http://localhost:3000/products'; 

//Vamos a minular el DOM
//Referencia a los elementos del DOM
const productForm = document.getElementById('product-form');
const productTable = document.getElementById('product-table');
const errorMessage = document.getElementById('Error-message');
const resetBtn = document.getElementById('reset-btn');
const searchBtn = document.getElementById('search-btn');
//Inputs del formulario
const inputId = document.getElementById('product-id');
const inputName = document.getElementById('product-name');
const inputPrice = document.getElementById('product-price');
const searchInput = document.getElementById('search-id');

function showError(message){
    errorMessage.textContent = message 
    errorMessage.style.display = 'block'; //Mostrar el mensaje de error
}

function clearError() {
    errorMessage.textContent = ''; // Limpiar el mensaje de error
    errorMessage.style.display = 'none'; // Ocultar el mensaje de error
}


productForm.addEventListener('submit', async (e) => {
    e.preventDefault(); //Editar la recarga de la pagina al enviar el formulario

    const id = inputId.value.trim(); //Obtener el valor del ID
    const name = inputName.value.trim(); //Obtener el valor del nombre
    const price = inputPrice.value.trim(); //Obtener el valor del precio

    //validacion basica: no permitir campos vacíos
    if(!name || isNaN(price)){
        showError('Por favor, completa todos los campos correctamente.');
        return; //Detener la ejecución si hay errores
    }

    //Crear un objeto con los datos del producto
    const payload = {name,price}; //Payload es el objeto que contiene los datos del producto que se enviará al servidor
    try {
        let response;
        //Si el ID está vacío, es una creación de producto
        if (id) {
            //Si el producto ya tiene un ID, significa que estamos actualizando/editando un producto
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT', //Método PUT para actualizar el producto
                headers: {
                    'Content-Type': 'application/json' //Especificar el tipo de contenido como JSON
                },
                body: JSON.stringify(payload) //Convertir el objeto payload a una cadena JSON
            })
        } else {
            //Si el producto no tiene ID, significa que estamos creando un nuevo producto (Metodo POST)
            //obtener la lista de productos actuales para determinar el nuevo ID
            const allProductsRes = await fetch(API_URL);
            const allProducts = await allProductsRes.json();
            //al tener la lista de productos, generar un nuevo ID
            const newId = allProducts.length
        
            response = await fetch(API_URL, {
                method: 'POST', //Método POST para crear un nuevo producto
                headers: {
                    'Content-Type': 'application/json' //Especificar el tipo de contenido como JSON
                },
                body: JSON.stringify({id: String(newId), ...payload}) //Convertir el objeto payload a una cadena JSON con el nuevo ID
            });
        }

        if (!response.ok)throw new Error(`Status: ${response.status}`); 
             //Lanzar un error si la respuesta no es exitosa
        clearError(); //Limpiar el mensaje de error si la operación fue exitosa
        await getProducts(); //Actualizar la lista de productos en la tabla
        productForm.reset(); //Limpiar el formulario después de enviar
        
    }catch(error){
        showError('Error al enviar los datos' + error.message); //Mostrar un mensaje de error si ocurre un problema
    }
})


//Funcion para obtener la lista de productos desde el server 
//y mostrarla en la tabla
async function getProducts() {
    try{
        const response = await fetch(API_URL); //Hacer una petición GET a la API
       const products =  await response.json(); //Convertir la respuesta a JSON
        renderProducts(products); //Llamar a la función para renderizar los productos
        
    }
    catch(error){
        showError('Error al obtener los productos.' + error.message); 
    }
}

//Funcion para mostrar los productos en la tabla HTML
function renderProducts(products){
    productTable.innerHTML = ''; //Limpiar la tabla antes de mostrar los productos
    //Iterar sobre cada producto y crear una fila en la tabla
    products.forEach(p => {
        const row = document.createElement('tr'); //Crear una nueva fila
        row.innerHTML = `
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>
       <button class="btn btn-outline-warning btn-sm edit-btn" data-id="${p.id}">Editar</button>
       <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${p.id}">Eliminar</button>
      </td>
    `
        productTable.appendChild(row); //Agregar la fila a la tabla
    })

    //Asignar eventos a los botones de editar y eliminar
document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id'); //Obtener el ID del producto desde el atributo data-id
        editProduct(id); //Llamar a la función para editar el producto
    })
})

document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id'); //Obtener el ID del producto desde el atributo data-id
        deleteProduct(id); //Llamar a la función para editar el producto
    })
})

}





//Funcion para eliminar un producto mediante su ID
async function deleteProduct(id) {
    //Asegurar que el ID es un número 
    const idNumber = Number(id);
    //Confirmar la eliminación del producto
    if(!confirm(`¿Estás seguro de eliminar el producto con ID ${idNumber}?`)) return;

    try {
        //Hacer una solicitud DELETE a la API para eliminar el producto
        const response = await fetch(`${API_URL}/${idNumber}`, { method: 'DELETE' });//Método DELETE para eliminar el producto
    
        //Manejo de error en la respuesta del servidor
        if (!response.ok) throw new Error(`Status: ${response.status}`); //Lanzar un error si la respuesta no es exitosa
        clearError(); //Limpiar el mensaje de error si la operación fue exitosa
        await getProducts(); //Actualizar la lista de productos en la tabla
    } catch (error) {
        showError('Error al eliminar el producto: ' + error.message); //Mostrar un mensaje de error si ocurre un problema  
    }
}

//Funcion para editar un producto en el formulario

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`); //Hacer una petición GET a la API para obtener el producto por ID
        const product = await response.json(); //Convertir la respuesta a JSON
        inputId.value = product.id; //Establecer el ID del producto en el formulario
        inputName.value = product.name; //Establecer el nombre del producto en el formulario
        inputPrice.value = product.price; //Establecer el precio del producto en el formulario

    } catch (error) {
        showError('Error al editar el producto: ' + error.message); //Mostrar un mensaje de error si ocurre un problema
    }
}

//Evento para buscar un producto por ID
searchBtn.addEventListener('click', async () => {
    const id = searchInput.value.trim(); //Obtener el ID del producto desde el input de búsqueda
    if (!id) return; //Evitar busquedas con campos vacíos
    try {
        const response = await fetch(`${API_URL}/${id}`); //Hacer una petición GET a la API para obtener el producto por ID
        if (!response.ok) throw new Error("Producto no encontrado"); //Lanzar un error si la respuesta no es exitosa
        const product = await response.json(); //Convertir la respuesta a JSON
        renderProducts([product]); //Renderizar el producto encontrado en la tabla
    } catch (error) {
        showError('Erorr al buscar el producto: ' + error.message); //Mostrar un mensaje de error si ocurre un problema
    }

    //Evento para limpiar el campo de búsqueda y recargar todos los productos
    resetBtn.addEventListener('click', () => {
        productForm.reset(); //Limpiar el formulario
        inputId.value = ''; //Limpiar el campo de ID
        getProducts(); //Recargar todos los productos
    });

})


getProducts(); //Llamar a la función para obtener los productos al cargar la página
