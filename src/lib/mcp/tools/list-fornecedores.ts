import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_fornecedores",
  title: "Listar fornecedores",
  description: "Busca fornecedores cadastrados pelo nome ou CNPJ/CPF.",
  inputSchema: {
    busca: z.string().optional().describe("Parte do nome, razão social ou CNPJ/CPF."),
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de registros."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ busca, limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Não autenticado");
    let q = supabaseForUser(ctx)
      .from("fornecedores")
      .select("id, nome_fornecedor, razao_social, cnpj_cpf, celular")
      .order("nome_fornecedor")
      .limit(limit);
    if (busca) {
      const s = busca.replace(/[,()]/g, " ");
      q = q.or(`nome_fornecedor.ilike.%${s}%,razao_social.ilike.%${s}%,cnpj_cpf.ilike.%${s}%`);
    }
    const { data, error } = await q;
    if (error) throw new ToolError(error.message);
    const fornecedores = (data ?? []).map((f: any) => ({
      id: String(f.id),
      nome: f.nome_fornecedor ?? null,
      razao_social: f.razao_social ?? null,
      cnpj_cpf: f.cnpj_cpf ?? null,
      celular: f.celular ?? null,
    }));
    return { content: [{ type: "text", text: JSON.stringify(fornecedores) }], structuredContent: { fornecedores } };
  },
});
