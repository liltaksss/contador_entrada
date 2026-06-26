# Controle de Entrada (Event Flow Controller)

Um sistema web em tempo real (Serverless) para registrar e monitorar o fluxo de entrada de pessoas em eventos. Ideal para a coordenação logística e controle de portarias em festivais culturais, matsuris e grandes eventos, garantindo a consistência dos dados em múltiplos dispositivos simultaneamente.

## 🚀 Funcionalidades

- **Dashboard em Tempo Real:** Acompanhamento instantâneo da capacidade do evento, dividido por categorias (Antecipados, Pagos na Hora, Convidados/Isenções).
- **Suporte a Múltiplos Clientes:** Construído para rodar na nuvem, permitindo que vários voluntários registrem entradas ao mesmo tempo através de celulares ou notebooks sem conflito de dados.
- **Exportação de Relatórios:**
  - Exportação do Dashboard em PDF com formatação limpa e de alta qualidade.
  - Exportação de logs brutos em formato `.csv` para auditoria e fechamento de caixa.
- **Título Dinâmico:** Personalização do nome do evento diretamente na interface, refletindo automaticamente nos relatórios gerados.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Backend:** Node.js, Express (Arquitetura Serverless via Vercel Functions).
- **Banco de Dados:** PostgreSQL (Vercel Postgres).
- **Bibliotecas:** `html2pdf.js` para geração de relatórios no lado do cliente; `pg` para interface com o banco de dados.

## 📁 Estrutura do Projeto

```text
/
├── api/
│   └── index.js          # Lógica do servidor Express (Rotas e DB)
├── public/
│   ├── app.js            # Lógica do cliente (Interface e requisições)
│   ├── index.html        # Estrutura do Dashboard
│   └── styles.css        # Estilização global
├── schema.sql            # Script de inicialização do PostgreSQL
├── vercel.json           # Configurações de roteamento Serverless
└── package.json          # Dependências do Node.js