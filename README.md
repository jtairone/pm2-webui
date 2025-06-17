### PM2 WebUI
Alternativa de Código Aberto ao PM2 Plus

##### CARACTERÍSTICAS
- Login Seguro :white_check_mark:
- Gerenciamento de Aplicativos :white_check_mark:
- Visualizador de Logs :white_check_mark:
- Interface Responsiva :white_check_mark:
- MImplantação Manual e Automática (via Webhooks do GitHub)
- Gerenciamento de Ambientes

##### COMO USAR
```
git clone https://github.com/jtairone/pm2-webui.git
cd pm2-webui
npm install
cp env.example .env
npm run setup-admin-user (Necessário para fazer login) 
npm start
```
##### PARA DESENVOLVIMENTO
```
npm run start:dev
```

#### TODO
<!-- - [ ] support for relative paths
- [ ] use fs-extra for filesystem operations
- [ ] use [jsonfile](https://www.npmjs.com/package/jsonfile) for config management
- [ ] replace exec.util with [execa](https://www.npmjs.com/package/execa)
- [ ] add form based env management -->
- [ ] Adicionar logs em tempo real
<!-- - [ ] add log viewer for deployments
- [ ] add deployment abort functionality
- [ ] add deployment triggers -->
- [ ] Adicionar terminal web
<!-- - [ ] add zero downtime deployment strategies - blue-green, rolling etc -->
<!-- - [ ] add docker provider* -->

##### SCREENSHOTS
![PM2 Webui Login](/screenshots/login.png?raw=true "PM2 WebUI Login")
![PM2 Webui Dashboard](/screenshots/dashboard.png?raw=true "PM2 WebUI Dashboard")
![PM2 Webui App](/screenshots/app.png?raw=true "PM2 WebUI App")

##### LICENSE
MIT - Copyright (c) 2025
