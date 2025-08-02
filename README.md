# OrçaFácil - Sistema de Orçamentos Profissionais

OrçaFácil é uma aplicação MicroSaaS para criação, envio e aprovação de orçamentos profissionais. Desenvolvido com React, TypeScript, TailwindCSS, Supabase e Stripe.

## 🚀 Características

### Autenticação & Onboarding
- Cadastro e login com email/senha via Supabase Auth
- Dashboard personalizado com estatísticas de orçamentos

### Gerenciamento de Clientes
- CRUD completo de clientes
- Informações de contato (nome, email, telefone)
- Interface intuitiva e responsiva

### Sistema de Orçamentos
- Criação de orçamentos com múltiplos itens
- Cálculo automático de valores
- Links públicos para aprovação de clientes
- Status de aprovação em tempo real

### Planos e Cobrança (Stripe)
- **Gratuito**: Até 10 orçamentos por mês
- **Pro (R$ 29/mês)**: Orçamentos ilimitados + personalização
- **Premium (R$ 49/mês)**: Tudo do Pro + notificações por email
- Portal de assinatura Stripe integrado

### Funcionalidades Avançadas
- Geração de PDF/impressão dos orçamentos
- Row Level Security (RLS) para segurança de dados
- Interface responsiva e acessível
- Notificações por email (Premium)

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Roteamento**: React Router v6
- **Estado**: Zustand + React Query
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Pagamentos**: Stripe
- **Build**: Vite
- **Formulários**: React Hook Form
- **Ícones**: Lucide React

## 📦 Configuração

### Pré-requisitos

- Node.js 18+
- Conta Supabase
- Conta Stripe
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/orcafacil.git
cd orcafacil
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute o schema SQL fornecido em `supabase-schema.sql`
3. Configure as variáveis de ambiente

### 4. Configure o Stripe

1. Crie uma conta no [Stripe](https://stripe.com)
2. Crie produtos e preços para os planos Pro e Premium
3. Configure webhooks para os eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

### 5. Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
VITE_APP_URL=http://localhost:5173
```

### 6. Atualize os Price IDs do Stripe

Em `src/lib/stripe.ts`, substitua pelos seus Price IDs reais:

```typescript
export const STRIPE_PLANS = {
  pro: {
    name: 'Pro',
    price: 'R$ 29/mês',
    priceId: 'price_1234567890', // Seu Price ID Pro
    // ...
  },
  premium: {
    name: 'Premium',
    price: 'R$ 49/mês',
    priceId: 'price_0987654321', // Seu Price ID Premium
    // ...
  }
}
```

## 🚀 Desenvolvimento

### Executar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

### Build para produção

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## 📈 Deployment

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

### Servidor próprio

```bash
npm run build
# Servir arquivos da pasta 'dist'
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais:

- **users**: Perfis de usuário e planos
- **clients**: Clientes dos usuários
- **budgets**: Orçamentos com status
- **budget_items**: Itens individuais dos orçamentos
- **payments**: Histórico de pagamentos Stripe

### RLS (Row Level Security)

- Usuários só acessam seus próprios dados
- Orçamentos públicos acessíveis via UUID
- Limite de orçamentos para usuários gratuitos

## 🔐 Segurança

- Autenticação JWT via Supabase
- Row Level Security (RLS) no PostgreSQL
- Validação de dados no frontend e backend
- Webhooks Stripe com verificação de assinatura
- HTTPS obrigatório em produção

## 📝 API Endpoints

### Stripe

- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/create-portal-session`
- `POST /api/stripe/webhook`

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm test
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📞 Suporte

- Email: suporte@orcafacil.com
- Documentação: [docs.orcafacil.com](https://docs.orcafacil.com)
- Issues: [GitHub Issues](https://github.com/seu-usuario/orcafacil/issues)

## 🔄 Próximas Features

- [ ] Integração com WhatsApp
- [ ] Templates de orçamento
- [ ] Dashboard analytics
- [ ] API pública
- [ ] App mobile
- [ ] Integração com CRM
- [ ] Assinatura digital
- [ ] Multi-idioma

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes reutilizáveis
│   ├── auth/           # Componentes de autenticação
│   ├── budgets/        # Componentes de orçamentos
│   ├── clients/        # Componentes de clientes
│   └── layout/         # Layout e navegação
├── hooks/              # Custom hooks
├── lib/                # Configurações (Supabase, Stripe)
├── pages/              # Páginas principais
├── types/              # Tipos TypeScript
└── utils/              # Funções utilitárias
```

---

Desenvolvido com ❤️ para facilitar a vida de profissionais e empresas.
