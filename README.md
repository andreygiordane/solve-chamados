Sistema Solve Chamados
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/15decfa6-f6b7-4efd-9d0b-c2aceaccaed8" />

🚀 Visão Geral
•	Sistema completo de gerenciamento de chamados técnicos com autenticação, controle de usuários e interface moderna.

✨ Principais Funcionalidades Implementadas
🔐 Sistema de Autenticação
•	Login/Logout com sessões seguras
•	Proteção de rotas no frontend e backend
•	Middleware de autenticação JWT-like
•	Validação de sessões com expiração
•	Permissões por role (admin, tecnico, usuario)


👥 Gestão de Usuários
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/970f063a-c234-4cb1-a8b2-e14717432fad" />
•	Cadastro completo com nome, email, senha e role
•	Edição de usuários existentes
•	Exclusão segura com validações
•	Badges coloridos para diferentes roles
•	Validação de senhas (mínimo 6 caracteres)


🎫 Sistema de Chamados

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/9fe55ec2-ec8d-4fa3-9a7e-c568b7ec58c0" />
Abertura de chamados com categorização

<img width="1917" height="1079" alt="image" src="https://github.com/user-attachments/assets/733c9ecd-55b7-4ce5-9b7c-280bcdd6d524" />
Fluxo de status (aberto → em_andamento → concluido/cancelado)

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/eb3a13d3-da9e-412d-a164-1b8a1d7c8205" />
Acompanhamento com histórico de updates

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/ce205518-c5d7-4364-8a56-ca166a0908ab" />
Atribuição de chamados a técnicos

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/028325c3-e02f-44bf-a8d4-65e601c0b3af" />
Relatórios exportáveis em CSV/PDF

🖥️ Interface Moderna

<img width="1917" height="1079" alt="image" src="https://github.com/user-attachments/assets/82ea7970-e467-4af8-af24-7493a25de2ff" />
•	Design dark com tema profissional
•	Sidebar responsiva com menus dinâmicos
•	Componentes reutilizáveis e modulares
•	Animações e feedback visual
•	Layout responsivo para mobile


🗂️ Estrutura do Projeto

<img width="773" height="620" alt="image" src="https://github.com/user-attachments/assets/d1a07b8e-ce70-4ca7-a680-740bc4e3f05b" />

🔧 Tecnologias Utilizadas
Backend
•	Node.js + Express.js
•	PostgreSQL com pg
•	Bcrypt para hash de senhas
•	Crypto para tokens de sessão
•	CORS para comunicação frontend/backend


Frontend
•	React 18 com hooks
•	Vite para build e dev server
•	Tailwind CSS para estilização
•	Lucide React para ícones
•	Fetch API para requisições HTTP


📊 Banco de Dados
•	Tabelas Principais
•	users - Usuários do sistema
•	user_sessions - Sessões de autenticação
•	tickets - Chamados técnicos
•	assets - Equipamentos/inventário
•	groups - Grupos de permissão


<img width="770" height="167" alt="image" src="https://github.com/user-attachments/assets/c1ada643-a992-45c0-a919-b94c6e5fad1e" />

🛠️ Configuração e Instalação
•	Pré-requisitos
•	Node.js 16+
•	PostgreSQL 12+
•	npm ou yarn


<img width="771" height="565" alt="image" src="https://github.com/user-attachments/assets/4d148f5f-5052-4044-b952-2c1d12359109" />

🔄 Fluxo de Desenvolvimento
Commits Estruturais
1.	Configuração inicial do projeto
2.	Sistema de autenticação completo
3.	CRUD de usuários com roles
4.	Sistema de chamados com fluxo completo
5.	Interface moderna com componentes
6.	Relatórios e exportação
7.	Otimizações e correções

Padrões de Código
•	Componentes React funcionais com hooks
•	Controllers com tratamento de erros
•	Models com métodos estáticos
•	Services para comunicação API
•	CSS com Tailwind classes

🎯 Funcionalidades por Módulo
•	Módulo de Autenticação
•	Login com email/senha
•	Logout com limpeza de sessão
•	Validação de token
•	Middleware de proteção
•	Roles e permissões

Módulo de Usuários
•	CRUD completo
•	Roles (admin, tecnico, usuario)
•	Gestão de senhas
•	Validações de email
•	Interface administrativa

Módulo de Chamados
•	Abertura com categorização
•	Fluxo de status
•	Acompanhamento com histórico
•	Atribuição a técnicos
•	Filtros e buscas

Módulo de Relatórios
•	Exportação CSV
•	Impressão PDF
•	Filtros por status
•	Estatísticas gerais

🔒 Segurança Implementada
•	Hash de senhas com bcrypt
•	Tokens de sessão seguros
•	Validação de entrada em todas as rotas
•	Proteção contra SQL injection
•	CORS configurado corretamente
•	Middleware de autenticação em rotas protegidas

📱 Responsividade
•	Mobile-first approach
•	Sidebar colapsável em mobile
•	Tabelas responsivas
•	Forms adaptáveis
•	Touch-friendly buttons

<img width="783" height="619" alt="image" src="https://github.com/user-attachments/assets/4bf15c0d-f6f0-4fd6-86e6-f882c090afbf" />


📈 Próximas Melhorias
•	Notificações em tempo real
•	Upload de arquivos em chamados
•	Dashboard com gráficos
•	API documentation
•	Testes automatizados
•	Dockerização

🤝 Contribuição
•	Fork do projeto
•	Branch para feature (git checkout -b feature/AmazingFeature)
•	Commit das mudanças (git commit -m 'Add AmazingFeature')
•	Push para branch (git push origin feature/AmazingFeature)
•	Pull Request

📄 Licença
•	Distribuído sob licença MIT. Veja LICENSE para mais informações.

🎉 Sistema 100% funcional com autenticação, gestão de usuários e chamados técnicos!



