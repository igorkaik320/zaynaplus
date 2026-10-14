import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_contas_pagar",
  title: "Listar contas a pagar",
  description: "Lista as contas a pagar mais recentes, opcionalmente filtrando por status ou fornecedor.",
  inputSchema: {
    status: z.string().optional().describe("Filtrar por status (ex.: aberto, pago)."),
    fornecedor: z.string().optional().describe("Parte do nome do fornecedor."),
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de registros."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, fornecedor, limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Não autenticado");
    let q = supabaseForUser(ctx)
      .from("contas_pagar")
      .select("id, fornecedor_nome, empresa_nome, valor_total, quantidade_parcelas, status, data_emissao, data_primeiro_vencimento, observacao")
      .order("data_emissao", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    if (fornecedor) q = q.ilike("fornecedor_nome", `%${fornecedor}%`);
    const { data, error } = await q;
    if (error) throw new ToolError(error.message);
    const contas = (data ?? []).map((c: any) => ({
      id: String(c.id),
      fornecedor: c.fornecedor_nome ?? null,
      empresa: c.empresa_nome ?? null,
      valor_total: Number(c.valor_total ?? 0),
      parcelas: Number(c.quantidade_parcelas ?? 0),
      status: c.status ?? null,
      data_emissao: c.data_emissao ?? null,
      primeiro_vencimento: c.data_primeiro_vencimento ?? null,
      observacao: c.observacao ?? null,
    }));
    return { content: [{ type: "text", text: JSON.stringify(contas) }], structuredContent: { contas } };
  },
});
