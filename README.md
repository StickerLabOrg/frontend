# 📦 Projeto Álbum de Figurinhas — Frontend

Este repositório contém a implementação do **frontend** do sistema **Álbum de Figurinhas**, desenvolvido em **React**.
O objetivo é fornecer uma interface moderna, responsiva e intuitiva para interação com o backend e o banco de dados.

---

## 📑 Índice

* [Visão Geral](#visão-geral)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Pré-requisitos](#pré-requisitos)
* [Instalação e Execução](#instalação-e-execução)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [Boas Práticas](#boas-práticas)
* [Contribuição](#contribuição)
* [Licença](#licença)

---

## 🔎 Visão Geral

O frontend é responsável por:

* Exibir as funcionalidades principais do sistema de gerenciamento do álbum de figurinhas.
* Consumir a API desenvolvida em **FastAPI**.
* Garantir uma boa experiência de usuário (UX) com design responsivo.

---

## 🛠 Tecnologias Utilizadas

* [React](https://react.dev/)
* [Vite](https://vitejs.dev/) *(opcional para build mais rápido)*
* [Axios](https://axios-http.com/) *(para integração com API)*
* [React Router](https://reactrouter.com/) *(para navegação entre páginas)*
* [TailwindCSS](https://tailwindcss.com/) *(para estilização)*

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

* **Node.js** (>= 18.x)
* **npm** ou **yarn**

---

## 🚀 Instalação e Execução

1. Clone este repositório:

   ```bash
   git clone https://github.com/<sua-org>/album-frontend.git
   cd album-frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure a URL da API (backend) no arquivo `.env`:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse no navegador:

   ```
   http://localhost:5173
   ```

---

## 📂 Estrutura do Projeto

```
album-frontend/
├── public/               # Arquivos estáticos
├── src/
│   ├── assets/           # Imagens e ícones
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas principais
│   ├── services/         # Configuração da API (Axios)
│   ├── App.jsx           # Arquivo principal do React
│   └── main.jsx          # Ponto de entrada
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

---

## ✅ Boas Práticas

* Seguir o padrão **component-based**.
* Usar **commits semânticos** (Ex: `feat: adiciona página de login`).
* Criar **pull requests** para novas features.
* Garantir que todo código esteja testado antes do merge.

---

## 🤝 Contribuição

1. Faça um fork do projeto.
2. Crie uma branch:

   ```bash
   git checkout -b feature/nova-feature
   ```
3. Commit suas alterações:

   ```bash
   git commit -m "feat: descrição da feature"
   ```
4. Push para a branch:

   ```bash
   git push origin feature/nova-feature
   ```
5. Abra um Pull Request.

---

## 📜 Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

