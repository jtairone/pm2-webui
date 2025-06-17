async function pm2AppAction(appName, action){
    if(action == 'delete'){
        swal.fire({
            title: 'Tem certeza disso?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'SIM',
            cancelButtonText: 'NÂO',
            cancelButtonColor: 'Red',
            confirmButtonColor: '#2AA13D',
            reverseButtons: true
        }).then( async (res)=>{
            if(res.isConfirmed){
                await fetch(`/api/apps/${appName}/${action}`, { method: 'POST'})
                location.reload();
            }
        })
    }else{
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title:  `${action} realizado sucesso!`
        }).then( async ()=>{
                await fetch(`/api/apps/${appName}/${action}`, { method: 'POST'})
                location.reload();
        });
    }
}