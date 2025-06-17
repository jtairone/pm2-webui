document.querySelector('#form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Impede o envio tradicional
    
    // Mostra o loading
    const swalInstance = Swal.fire({
        title: 'Autenticando...',
        html: 'Por favor, aguarde',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Coleta os dados do formulário (usando FormData para manter o mesmo formato do backend)
        const formData = new FormData(this);
        // Converte para objeto simples (opcional, pode enviar FormData diretamente)
        const body = Object.fromEntries(formData.entries());
        // Envia a requisição
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Ou 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(body) // Se usar FormData, remova o header Content-Type
        });
        // Verifica se é um redirecionamento
        if (response.redirected) {
            window.location.href = response.url; // Redireciona para /apps
            return;
        } 
        const errorMsg = 'Credenciais inválidas';
        throw new Error(errorMsg);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Falha no login',
            text: error,
            confirmButtonText: 'Tentar novamente'
        });
    } finally {
        swalInstance.close(); // Fecha o loading
    }
});