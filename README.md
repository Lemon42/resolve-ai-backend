<h1 align="center">
	<img src="https://i.imgur.com/yQztMun.png" 		height="85" />
	<br>
	ResolveAi! Backend
</h1>

API Rest para atender o [aplicativo ResolveAi!], ela está hospedado na Microsoft Azure e guarda e utiliza um banco de dados SQL Server para armazenar as informações.

###  Instalação :gear:

É necessário ter instalado o [Node] e o [Yarn], após adquirido ambos, você deve clonar este projeto, na pasta raiz do mesmo. Edite as variáveis de ambiente que se encontra em `example.env` e renomeio para `dev.env`.

Com o console aberto na pasta onde clonou o diretório insira os comandos nessa ordem:

    yarn install 
    yarn dev


Pronto! em **localhost:3333** a API estará sendo executada. Para ver as rotas da API é possível importar o para dentro do [Insomnia] o arquivo `insomnia.json`.

### Licença :page_with_curl:

O projeto usa a licença [MIT].

[ aplicativo ResolveAi!]:  <https://github.com/Lemon42/resolve-ai-mobile>
[Node]: <https://nodejs.org/>
[Yarn]: <https://yarnpkg.com/>
[Insomnia]: <https://insomnia.rest/download>
[MIT]:  <https://github.com/Lemon42/resolve-ai-mobile/blob/main/LICENSE.txt>
