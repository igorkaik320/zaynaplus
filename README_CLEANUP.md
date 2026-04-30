# Limpeza do Projeto ZaynaPlus

## O que foi feito:

### 1. Banco de Dados
- **Arquivo**: `clean_essential_tables.sql`
- Removeu triggers existentes para evitar conflitos
- Recriou apenas as tabelas essenciais:
  - **Financeiro**: `contas_pagar`, `contas_pagar_parcelas`, `transactions`, `verifications`
  - **Cadastros**: `fornecedores`, `empresas`
  - **Segurança**: `user_action_permissions`

### 2. Aplicação React
- **Arquivo**: `src/App.tsx`
- Removeu imports de páginas não utilizadas
- Manteve apenas as rotas essenciais:
  - `/contas-pagar` - Contas a Pagar
  - `/controle-caixa` - Controle de Caixa
  - `/fornecedores` - Cadastro de Fornecedores
  - `/usuarios` - Gestão de Usuários (Admin)

### 3. Módulos e Permissões
- **Arquivo**: `src/lib/modulePermissions.ts`
- Reduziu o array MODULES para apenas 4 módulos essenciais
- Removeu referências a compras, combustível, equipamentos, etc.

## Páginas Mantidas:
- `Index.tsx` - Controle de Caixa
- `ContasPagarPage.tsx` - Contas a Pagar
- `FornecedoresPage.tsx` - Cadastro de Fornecedores
- `UserManagement.tsx` - Gestão de Usuários
- `Auth.tsx` - Autenticação
- `NotFound.tsx` - Página 404

## Páginas Removidas (podem ser apagadas):
- Todas as páginas de compras
- Todas as páginas de combustível
- Todas as páginas de equipamentos/máquinas
- Páginas de auditoria e configuração

## Próximos Passos:
1. Execute o SQL `clean_essential_tables.sql` no Supabase
2. Remova os arquivos de páginas não utilizadas da pasta `src/pages/`
3. Teste o sistema para garantir que tudo funciona corretamente

## Estrutura Final:
```
Financeiro:
- Controle de Caixa (/controle-caixa)
- Contas a Pagar (/contas-pagar)

Cadastros:
- Fornecedores (/fornecedores)

Segurança:
- Usuários (/usuarios) - Apenas Admin
```
