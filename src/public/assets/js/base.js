async function editarUsuario(userId) {
  try {
      const response = await fetch(`/getuser/${userId}`);
      if (!response.ok) {
          throw new Error('Falha ao carregar usuário. Status: ' + response.status);
      }
      const userData = await response.json();
      const currentPhoto = userData.photoUrl || '/assets/images/app/user.svg'; // ajuste conforme seu backend

      const { value: formValues } = await Swal.fire({
          title: 'Editar Usuário',
          html: `
              <div class="swal2-form" style="text-align:center;">
                <div style="position:relative; width:90px; height:90px; margin:0 auto 18px auto;">
                  <img id="swal-profile-preview" src="${currentPhoto}" alt="Preview"
                    style="width:100%;height:100%;border-radius:50%;object-fit:cover;box-shadow:0 2px 8px #0001;border:3px solid #e0e0e0;position:absolute;left:0;top:0;">
                  <input type="file" id="swal-profile-photo" accept="image/*" style="display:none;">
                  <label for="swal-profile-photo"
                    style="position:absolute;bottom:-10px;right:-10px;background:#0d6efd;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0002;cursor:pointer;transition:background 0.2s;">
                    <i class="bi bi-camera" style="font-size:1.3rem;"></i>
                  </label>
                  <div id="swal-profile-curtain" class="swal-profile-curtain"></div>
                </div>
                <input id="swal-username" class="swal2-input" style="margin-top:18px;" value="${userData.username || ''}" placeholder="Nome de usuário" required>
                <input id="swal-password" class="swal2-input" type="password" placeholder="Nova senha">
                <input id="swal-confirm" class="swal2-input" type="password" placeholder="Confirme a senha">
              </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Salvar',
          cancelButtonText: 'Cancelar',
          backdrop: true,
          allowOutsideClick: false,
          preConfirm: () => {
              const username = document.getElementById('swal-username').value.trim();
              const password = document.getElementById('swal-password').value;
              const confirmPassword = document.getElementById('swal-confirm').value;
              const photoInput = document.getElementById('swal-profile-photo');
              const photoFile = photoInput.files[0];

              if (!username) {
                  Swal.showValidationMessage('Nome de usuário é obrigatório');
                  return false;
              }
              if (password !== confirmPassword) {
                  Swal.showValidationMessage('As senhas não coincidem');
                  return false;
              }
              return {
                  username,
                  password: password || undefined,
                  photoFile
              };
          },
          didOpen: () => {
              const photoInput = document.getElementById('swal-profile-photo');
              const preview = document.getElementById('swal-profile-preview');
              const curtain = document.getElementById('swal-profile-curtain');
              const passwordInput = document.getElementById('swal-password');
              let vendado = false;

              // Preview da foto ao selecionar novo arquivo
              if (photoInput) {
                photoInput.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            preview.src = e.target.result;
                            curtain.classList.remove('active');
                            vendado = false;
                        };
                        reader.readAsDataURL(this.files[0]);
                    }
                });
              }

              // Função para detectar se é avatar padrão
              function isDefaultAvatar(src) {
                  return src.includes('user.svg') || src.includes('user_vendado.svg');
              }

              if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                    const src = preview.src;
                    const isDefault = isDefaultAvatar(src);

                    // Cortina aparece sempre que digitar senha
                    if (passwordInput.value.length > 0) {
                        curtain.classList.add('active');
                    } else {
                        curtain.classList.remove('active');
                    }

                    // Só faz o toggle entre user.svg e user_vendado.svg se for avatar padrão
                    if (isDefault) {
                        if (!vendado && passwordInput.value.length > 0) {
                            preview.src = "/assets/images/app/user_vendado.svg";
                            vendado = true;
                        } else if (vendado && passwordInput.value.length === 0) {
                            preview.src = "/assets/images/app/user.svg";
                            vendado = false;
                        }
                    }
                });
              }

              document.getElementById('swal-username').focus();
          }
      });

      // 3. Se o usuário confirmou a edição
      if (formValues) {
          Swal.fire({
              title: 'Salvando...',
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading();
              }
          });

          const formData = new FormData();
          formData.append('username', formValues.username);
          if (formValues.password) formData.append('password', formValues.password);
          if (formValues.photoFile) formData.append('profilePhoto', formValues.photoFile);

          const updateResponse = await fetch(`/updateuser/${userId}`, {
              method: 'PUT',
              body: formData
          });

          const result = await updateResponse.json();

          if (!updateResponse.ok) {
              throw new Error(result.message || 'Erro ao atualizar usuário');
          }

          Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Usuário atualizado!',
              showConfirmButton: false,
              timer: 1500
          }).then(() => {
              window.location.reload();
          });
      }
  } catch (error) {
      console.error('Erro na edição:', error);
      Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: error.message || 'Ocorreu um erro ao editar o usuário',
          confirmButtonText: 'Entendi'
      });
  }
}

// Função para preview da imagem e animação de cortina no formulário de cadastro
document.addEventListener('DOMContentLoaded', function() {
  const fotoPerfil = document.getElementById('profile-preview');
  const senhaInput = document.getElementById('senha');
  const curtain = document.getElementById('profile-curtain');
  let vendado = false;

  function isDefaultAvatar(src) {
    return src.includes('user.svg') || src.includes('user_vendado.svg');
  }

  if (senhaInput && fotoPerfil && curtain) {
    senhaInput.addEventListener('input', function() {
      const src = fotoPerfil.src;
      const isDefault = isDefaultAvatar(src);

      // Cortina aparece sempre que digitar senha
      if (senhaInput.value.length > 0) {
          curtain.classList.add('active');
      } else {
          curtain.classList.remove('active');
      }

      // Só faz o toggle entre user.svg e user_vendado.svg se for avatar padrão
      if (isDefault) {
          if (!vendado && senhaInput.value.length > 0) {
              fotoPerfil.src = "/assets/images/app/user_vendado.svg";
              vendado = true;
          } else if (vendado && senhaInput.value.length === 0) {
              fotoPerfil.src = "/assets/images/app/user.svg";
              vendado = false;
          }
      }
    });
  }

  const profilePhotoInput = document.getElementById('profile-photo');
  if (profilePhotoInput && fotoPerfil && curtain) {
    profilePhotoInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
              fotoPerfil.src = e.target.result;
              curtain.classList.remove('active');
              vendado = false;
          };
          reader.readAsDataURL(this.files[0]);
      }
    });
  }
});
