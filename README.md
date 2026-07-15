🚀 Entrevista Piloto – PWA para Captação de Projetos
Aplicação web progressiva (PWA) desenvolvida para conduzir entrevistas inteligentes e identificar organizações com potencial para participar de projetos piloto. O sistema calcula internamente o IPP™ (Índice de Potencial Polímata) e armazena os dados localmente, além de enviá-los para um serviço de e-mail (StaticForms) – tudo sem necessidade de backend próprio.

✨ Funcionalidades
Entrevista guiada com perguntas dinâmicas carregadas a partir de um arquivo JSON.

12 segmentos pré-definidos (Igrejas, Escolas, Clínicas, Salões, Barbearias, Comércio, Restaurantes, Academias, Escritórios, Autores, Produtos Digitais, Infoprodutos).

Cálculo automático do IPP™ com base em pesos, critérios eliminatórios e bonificadores.

Persistência local com IndexedDB (offline first).

Envio dos dados para o e-mail do gestor via StaticForms (sem backend).

Progressive Web App (PWA) – instalável, funciona offline, com manifest e service worker.

Design responsivo, mobile-first, com foco em acessibilidade e usabilidade.

Validação de campos com feedback visual (shake, cores de erro).

Microinterações (spinner, transições suaves, progresso).

🛠️ Tecnologias Utilizadas
HTML5 – estrutura semântica

CSS3 – design customizado, variáveis, animações

JavaScript ES6+ – lógica completa, modular

JSON – base de perguntas e configurações

IndexedDB – armazenamento local

Service Worker – cache e offline

Manifest – instalação como PWA

StaticForms – envio de e-mails via API

📁 Estrutura de Arquivos
text
/
├── index.html              # Página principal (todas as telas)
├── style.css               # Estilos globais e responsivos
├── app.js                  # Lógica completa da aplicação
├── perguntas.json          # Dados dos segmentos e perguntas
├── manifest.json           # Configuração do PWA
├── service-worker.js       # Cache e offline
└── icons/                  # Ícones para PWA (192x192, 512x512)
    ├── icon-192.png
    └── icon-512.png
🚀 Como Executar Localmente
Clone ou baixe este repositório.

Certifique-se de que os ícones estão na pasta icons/.

Abra o projeto com um servidor local (ex.: Live Server do VS Code, ou qualquer servidor HTTP estático).

Não use file:// – o service worker e o fetch do JSON precisam de um servidor.

Acesse http://localhost:5500 (ou a porta configurada).

📦 Deploy no GitHub Pages
Faça o push do repositório para o GitHub.

Ative o GitHub Pages nas configurações do repositório (branch main ou gh-pages, pasta raiz).

Acesse https://seu-usuario.github.io/nome-do-repo/.

A aplicação estará disponível com todas as funcionalidades (inclusive PWA).

Importante: O service worker e o manifesto funcionam perfeitamente em qualquer subdiretório. Todos os caminhos são relativos à raiz do projeto.

📧 Configuração do StaticForms
O formulário de identificação envia os dados para o e-mail cadastrado no StaticForms.

Chave da API (apiKey) já está inserida no index.html e no app.js.

Você pode alterar a chave e o destinatário no painel do StaticForms.

O campo message contém todo o JSON da entrevista.

Para testar localmente, substitua a apiKey pela sua e ajuste o e-mail de destino (caso queira).

🎨 Personalização
📝 Alterar perguntas
Edite o arquivo perguntas.json – a estrutura é autoexplicativa. Você pode:

Adicionar ou remover segmentos.

Modificar perguntas, pesos, tipos, critérios.

Ajustar bonificadores e eliminatórios.

🎨 Estilos
As cores principais estão definidas no :root do style.css. Basta alterar as variáveis:

css
--cor-primaria: #2B3A67;
--cor-secundaria: #4A6A8F;
--cor-fundo: #F9FAFC;
📱 Telas e textos
Todo o conteúdo textual está diretamente no index.html. É seguro editar títulos, descrições e mensagens.

📊 Algoritmo IPP™
O IPP™ é calculado com base em:

Pesos atribuídos a cada pergunta.

Normalização de respostas (Sim/Não, número, texto).

Critério eliminatório suave – reduz 40% do score se a organização já possui solução equivalente.

Bonificadores – soma de pontos extras (ex.: impacto social).

O valor final é um número entre 0 e 100, classificado em faixas (Prioritário, Promissor, Elegível, Futuro, Não Recomendado).

🔒 Privacidade e Dados
Nenhum dado é enviado para servidores próprios.

O armazenamento local (IndexedDB) mantém os dados apenas no navegador do usuário.

O envio via StaticForms utiliza HTTPS e não armazena os dados permanentemente – apenas os encaminha por e-mail.

🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para:

Reportar bugs.

Sugerir melhorias de UX/UI.

Adicionar novos segmentos.

Melhorar a documentação.

Abra uma issue ou um pull request no repositório.

📄 Licença
Este projeto está sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.

🙏 Agradecimentos
Polímata Studio – pela visão e pelo conceito do IPP™.

StaticForms – pela API simples e eficiente.

Comunidade open source – pelas ferramentas que tornam isso possível.

Feito com 💜 para facilitar a seleção de projetos inovadores.

