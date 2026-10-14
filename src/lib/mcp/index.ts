import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listContasPagar from "./tools/list-contas-pagar";
import listFornecedores from "./tools/list-fornecedores";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "control-zayna",
  title: "control zayna",
  version: "0.1.0",
  instructions:
    "Ferramentas da Gestão Zayna. Consulte contas a pagar e fornecedores com as permissões do usuário conectado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listContasPagar, listFornecedores],
});
