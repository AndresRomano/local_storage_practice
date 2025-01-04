document.addEventListener('DOMContentLoaded', async () => {
    const productForm = document.getElementById('productForm');

    // Función para realizar una petición POST al crear un producto
    async function createProduct(data) {
        try {
            const response = await fetch('https://fakestoreapi.com/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Error creating product');
            }
            const product = await response.json();
            saveToLocalProducts(product);
            return product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Función para guardar un producto en localStorage
    function saveToLocalProducts(product) {
        try {
            const localProducts = JSON.parse(localStorage.getItem('products')) || [];
            localProducts.push(product);
            localStorage.setItem('products', JSON.stringify(localProducts));
        } catch (error) {
            showAlert('Error saving product to local storage: ' + error.message, 'danger');
        }
    }

    // Event listener para el envío del formulario
    productForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm text-light" role="status"><span class="visually-hidden">Sending...</span></div> Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(this);
        const data = {
            title: formData.get('title') ? formData.get('title').trim() : '',
            price: formData.get('price') ? formData.get('price').trim() : '',
            description: formData.get('description') ? formData.get('description').trim() : '',
            category: formData.get('category') ? formData.get('category').trim() : ''
        };

        try {
            const product = await createProduct(data);
            showAlert(`Product created successfully: Title - ${data.title}, Price - ${data.price}, Description - ${data.description}, Category - ${data.category}`, 'success');
            this.reset(); // Limpiar el formulario después de guardar el producto
        } catch (error) {
            showAlert('Error creating product: ' + error.message, 'danger');
        } finally {
            // Restaura el botón del formulario
            submitBtn.innerHTML = 'Submit';
            submitBtn.disabled = false;
        }
    });
    
    // Función para cargar los productos de la FakeStore API
    async function loadAPIProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            if (!response.ok) {
                throw new Error('Error loading products from API');
            }
            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Función para cargar los productos del localStorage
    function loadLocalProducts() {
        const localProducts = JSON.parse(localStorage.getItem('products')) || [];
        return localProducts;
    }

    // Función para renderizar la lista de productos en la tabla
    async function renderProductList() {
        try {
            const apiProducts = await loadAPIProducts();
            const localProducts = loadLocalProducts();
            const allProducts = [...apiProducts, ...localProducts];
            const productList = document.getElementById('productTableBody');
            productList.innerHTML = '';
            allProducts.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.title}</td>
                    <td>${product.price}</td>
                    <td>${product.description}</td>
                    <td>${product.category}</td>
                `;
                productList.appendChild(row);
            });
        } catch (error) {
            showAlert('Error rendering product list: ' + error.message, 'danger');
        }
    }

    // Función para mostrar un alert de Bootstrap
    function showAlert(message, alertType) {
        // Eliminar el alert anterior si existe
        const previousAlert = document.querySelector('.alert');
        if (previousAlert) {
            previousAlert.remove();
        }

    // Crear el nuevo alert
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', `alert-${alertType}`, 'alert-dismissible'); // Agregamos la clase 'alert-dismissible'

        // Botón de cierre
        const closeButton = document.createElement('button');
        closeButton.setAttribute('type', 'button');
        closeButton.classList.add('btn-close');
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.addEventListener('click', () => {
        alertDiv.remove(); // Al hacer clic en el botón de cierre, se eliminará el alert
    });

    // Texto del mensaje
    const messageText = document.createTextNode(message);

    // Agregamos el botón de cierre y el texto al alertDiv
    alertDiv.appendChild(closeButton);
    alertDiv.appendChild(messageText);

    const form = document.getElementById('productForm');
    form.parentNode.insertBefore(alertDiv, form.nextSibling);
    }

    const productListTable = document.getElementById('productTable');

// Event listener para el botón "Cargar lista de productos"
loadProductListBtn.addEventListener('click', async function () {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    productListTable.appendChild(overlay);

    const spinner = document.createElement('div');
    spinner.classList.add('spinner-border', 'spinner-border-sm', 'text-light');
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="visually-hidden">Updating...</span>';

    loadProductListBtn.innerHTML = 'Updating...';
    loadProductListBtn.appendChild(spinner);
    loadProductListBtn.disabled = true;

    await renderProductList();

    loadProductListBtn.innerHTML = 'Load Product List';
    loadProductListBtn.disabled = false;
    spinner.remove();
    overlay.remove();

    loadProductListBtn.style.display = 'none';
    refreshProductListBtn.style.display = 'block';
    document.getElementById('productList').style.display = 'block';
});

// Event listener para el botón "Actualizar lista de productos"
refreshProductListBtn.addEventListener('click', async function () {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    productListTable.appendChild(overlay);

    const spinner = document.createElement('div');
    spinner.classList.add('spinner-border', 'spinner-border-sm', 'text-light');
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="visually-hidden">Updating...</span>';

    refreshProductListBtn.innerHTML = 'updating...';
    refreshProductListBtn.appendChild(spinner);
    refreshProductListBtn.disabled = true;

    await renderProductList();

    refreshProductListBtn.innerHTML = 'Refresh Product List';
    refreshProductListBtn.disabled = false;
    spinner.remove();
    overlay.remove();
});


    // Llamar a renderProductList al cargar la página
    await renderProductList();
});
