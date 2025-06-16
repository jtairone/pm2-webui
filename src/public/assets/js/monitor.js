 const socket = io('http://localhost:4343');
  // Atualiza os cards quando receber novos dados
  socket.on('pm2-status', (apps) => {
    updateAppCards(apps);
  });

  // Mostra erros (opcional)
  socket.on('pm2-error', (error) => {
    console.error('Erro no PM2:', error);
    alert('Erro ao buscar dados: ' + error);
  });

  function updateAppCards(apps) {
    apps.forEach(app => {
      const cardElement = document.querySelector(`.card a[href="/apps/${app.name}"]`)?.closest('.card');
      if (!cardElement) return;

      // Atualiza o status (badge)
      const badgeElement = cardElement.querySelector('.badge');
      if (badgeElement) {
        badgeElement.textContent = app.status;
        badgeElement.className = 'badge ' + (app.status === 'online' ? 'bg-green-lt' : 'bg-red-lt');
      }

      // Função para atualizar apenas o texto após o SVG
      const updateTextAfterSvg = (selector, prefix) => {
        const element = cardElement.querySelector(selector);
        if (element) {
          // Encontra o nó de texto após o SVG
          const svg = element.querySelector('svg');
          if (svg) {
            // Remove todos os nós de texto após o SVG
            let nextNode = svg.nextSibling;
            while (nextNode) {
              if (nextNode.nodeType === Node.TEXT_NODE) {
                element.removeChild(nextNode);
                break;
              }
              nextNode = nextNode.nextSibling;
            }
            // Adiciona o novo texto
            element.appendChild(document.createTextNode(` ${prefix}`));
          }
        }
    };
      
      // Atualiza cada campo
      updateTextAfterSvg('h4:nth-child(2)', `Versão: ${app.version}`);
      updateTextAfterSvg('h4:nth-child(3)', `CPU: ${app.cpu} %`);
      updateTextAfterSvg('h4:nth-child(4)', `Memory: ${app.memory}`);
      updateTextAfterSvg('h4:nth-child(5)', `Uptime: ${ app.status === "online"? app.uptime : 0 }`);
      //updateTextAfterSvg('h4:nth-child(6)', `Criado: ${timeSince(app.created)}`);
      updateTextAfterSvg('h4:nth-child(7)', `Watch: ${app.watch}`);
      
      // Atualiza os botões de ação baseados no status
      const footerElement = cardElement.querySelector('.card-footer');
      if (footerElement) {
        footerElement.innerHTML = app.status === 'online' ?
          `
          <button class="btn btn-sm btn-green" aria-label="Button" onclick="pm2AppAction('${app.name}', 'reload')">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
            </svg>
            Reload
          </button>
          <button class="btn btn-sm btn-cyan" aria-label="Button" onclick="pm2AppAction('${app.name}', 'restart')">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-rotate-clockwise-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5"></path>
              <line x1="5.63" y1="7.16" x2="5.63" y2="7.17"></line>
              <line x1="4.06" y1="11" x2="4.06" y2="11.01"></line>
              <line x1="4.63" y1="15.1" x2="4.63" y2="15.11"></line>
              <line x1="7.16" y1="18.37" x2="7.16" y2="18.38"></line>
              <line x1="11" y1="19.94" x2="11" y2="19.95"></line>
            </svg>
            Restart
          </button>
          <button class="btn btn-sm btn-danger" aria-label="Button" onclick="pm2AppAction('${app.name}', 'stop')">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-minus" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <circle cx="12" cy="12" r="9"></circle>
              <line x1="9" y1="12" x2="15" y2="12"></line>
            </svg>
            Stop
          </button>
          ` :
          `
          <button class="btn btn-sm btn-cyan" aria-label="Button" onclick="pm2AppAction('${app.name}', 'restart')">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-rotate-clockwise-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5"></path>
              <line x1="5.63" y1="7.16" x2="5.63" y2="7.17"></line>
              <line x1="4.06" y1="11" x2="4.06" y2="11.01"></line>
              <line x1="4.63" y1="15.1" x2="4.63" y2="15.11"></line>
              <line x1="7.16" y1="18.37" x2="7.16" y2="18.38"></line>
              <line x1="11" y1="19.94" x2="11" y2="19.95"></line>
            </svg>
            Restart
          </button>
          `;
      }
    });
  }

  const bytesToSize = function(bytes, precision) {
    var kilobyte = 1024
    var megabyte = kilobyte * 1024
    var gigabyte = megabyte * 1024
    var terabyte = gigabyte * 1024
  
    if ((bytes >= 0) && (bytes < kilobyte)) {
      return bytes + 'b '
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
      return (bytes / kilobyte).toFixed(precision) + ' kb '
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
      return (bytes / megabyte).toFixed(precision) + ' mb '
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
      return (bytes / gigabyte).toFixed(precision) + 'gb '
    } else if (bytes >= terabyte) {
      return (bytes / terabyte).toFixed(precision) + ' tb '
    } else {
      return bytes + ' b '
    }
}

const timeSince = function(date) {
    var seconds = Math.floor((new Date() - date) / 1000)
  
    var interval = Math.floor(seconds / 31536000)
  
    if (interval > 1) {
      return interval + ' yrs'
    }
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) {
      return interval + ' months'
    }
    interval = Math.floor(seconds / 86400)
    if (interval > 1) {
      return interval + ' days'
    }
    interval = Math.floor(seconds / 3600)
    if (interval > 1) {
      return interval + ' hrs'
    }
    interval = Math.floor(seconds / 60)
    if (interval > 1) {
      return interval + ' minutes'
    }
    return Math.floor(seconds) + ' seconds'
}