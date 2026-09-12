// services/settings.service.ts
// Serviço Central de Configurações Dinâmicas do Sistema
// GH Camiseteria & Uniformes Personalizados

import { pool } from "@/lib/db";

export interface SystemSettingItem {
  key: string;
  value: string;
  maskedValue: string;
  description?: string;
  category: "ai" | "payment" | "support" | "general";
  isSecret: boolean;
  updatedAt?: string;
}

// Chaves gerenciadas oficialmente pelo painel administrativo
export const MANAGED_SETTINGS = [
  {
    key: "GROQ_API_KEY",
    label: "Chave de API da Groq (IA)",
    category: "ai" as const,
    isSecret: true,
    description: "Chave utilizada pelo Consultor Virtual e compilador de uniformes.",
  },
  {
    key: "GROQ_MODEL",
    label: "Modelo de Inteligência Artificial",
    category: "ai" as const,
    isSecret: false,
    defaultValue: "openai/gpt-oss-120b",
    description: "Identificador do modelo LLM (ex: openai/gpt-oss-120b, llama-3.3-70b-versatile).",
  },
  {
    key: "MERCADO_PAGO_ACCESS_TOKEN",
    label: "Access Token do Mercado Pago",
    category: "payment" as const,
    isSecret: true,
    description: "Credencial de produção para processamento de Pix e Cartão de Crédito.",
  },
  {
    key: "NEXT_PUBLIC_WHATSAPP_NUMBER",
    label: "Número do WhatsApp Oficial",
    category: "support" as const,
    isSecret: false,
    defaultValue: "5511999999999",
    description: "Número do WhatsApp com DDI e DDD (somente números) para atendimento e compartilhamento.",
  },
  {
    key: "SUPPORT_EMAIL",
    label: "E-mail de Atendimento",
    category: "support" as const,
    isSecret: false,
    defaultValue: "contato@ghcamiseteria.com.br",
    description: "E-mail oficial para dúvidas e contato comercial.",
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    label: "URL da Aplicação (Domínio)",
    category: "general" as const,
    isSecret: false,
    defaultValue: "https://ghcamiseteria.com.br",
    description: "URL pública oficial utilizada nos links de compartilhamento e webhooks.",
  },
  {
    key: "COMPANY_NAME",
    label: "Nome da Empresa / Marca",
    category: "general" as const,
    isSecret: false,
    defaultValue: "GH Camiseteria & Uniformes",
    description: "Identificação da marca exibida nas propostas e mensagens automáticas.",
  },
];

// Cache em memória para acesso ultrarrápido
const memorySettingsCache = new Map<string, { value: string; updatedAt: string }>();
let tableEnsured = false;

export class SettingsService {
  /**
   * Garante que a tabela public.system_settings existe no PostgreSQL
   */
  private static async ensureTable(): Promise<void> {
    if (tableEnsured) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.system_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          description TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      tableEnsured = true;
    } catch {
      // Em ambientes de teste sem Postgres ativo, o cache de memória responderá
    }
  }

  /**
   * Busca o valor de uma configuração.
   * Ordem de precedência:
   * 1. Cache em memória (se atualizado)
   * 2. Banco de dados PostgreSQL (public.system_settings)
   * 3. Variáveis de ambiente (process.env)
   * 4. Valor padrão configurado
   */
  static async get(key: string): Promise<string | null> {
    // 1. Cache em memória
    if (memorySettingsCache.has(key)) {
      return memorySettingsCache.get(key)!.value;
    }

    // 2. Banco de dados PostgreSQL
    await this.ensureTable();
    try {
      const res = await pool.query(
        "SELECT value, updated_at FROM public.system_settings WHERE key = $1",
        [key]
      );
      if (res.rows[0]) {
        const val = res.rows[0].value;
        memorySettingsCache.set(key, {
          value: val,
          updatedAt: res.rows[0].updated_at?.toISOString?.() || new Date().toISOString(),
        });
        return val;
      }
    } catch {
      // Fallback
    }

    // 3. Variáveis de ambiente
    const envVal = process.env[key];
    if (envVal !== undefined && envVal !== "") {
      return envVal;
    }

    // 4. Valor padrão
    const def = MANAGED_SETTINGS.find((s) => s.key === key)?.defaultValue;
    return def || null;
  }

  /**
   * Salva ou atualiza uma configuração no sistema
   */
  static async set(key: string, value: string, description?: string): Promise<void> {
    const trimmedVal = value.trim();
    const now = new Date().toISOString();

    // Atualiza cache em memória
    memorySettingsCache.set(key, { value: trimmedVal, updatedAt: now });

    // Persiste no banco de dados
    await this.ensureTable();
    try {
      await pool.query(
        `INSERT INTO public.system_settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value,
             description = COALESCE(EXCLUDED.description, public.system_settings.description),
             updated_at = EXCLUDED.updated_at`,
        [key, trimmedVal, description || null, now]
      );
    } catch {
      // Fallback
    }
  }

  /**
   * Salva múltiplas configurações de uma única vez
   */
  static async setMultiple(settings: Record<string, string>): Promise<void> {
    for (const [key, val] of Object.entries(settings)) {
      if (val !== undefined && val !== null) {
        await this.set(key, String(val));
      }
    }
  }

  /**
   * Retorna todas as configurações com mascaramento de segredos para exibição segura no painel
   */
  static async getAllForAdmin(): Promise<SystemSettingItem[]> {
    await this.ensureTable();

    const dbRows: Record<string, { value: string; updated_at: string }> = {};
    try {
      const res = await pool.query("SELECT key, value, updated_at FROM public.system_settings");
      for (const row of res.rows) {
        dbRows[row.key] = {
          value: row.value,
          updated_at: row.updated_at?.toISOString?.() || new Date().toISOString(),
        };
      }
    } catch {
      // Fallback
    }

    return MANAGED_SETTINGS.map((def) => {
      const dbItem = dbRows[def.key];
      const memItem = memorySettingsCache.get(def.key);
      const envVal = process.env[def.key];

      const rawVal = memItem?.value || dbItem?.value || envVal || def.defaultValue || "";
      const updatedAt = memItem?.updatedAt || dbItem?.updated_at || undefined;

      let maskedValue = rawVal;
      if (def.isSecret && rawVal) {
        if (rawVal.length > 8) {
          const prefix = rawVal.substring(0, 4);
          const suffix = rawVal.substring(rawVal.length - 4);
          maskedValue = `${prefix}••••••••••••${suffix}`;
        } else {
          maskedValue = "••••••••••••";
        }
      }

      return {
        key: def.key,
        value: def.isSecret ? "" : rawVal, // Segredos não são enviados em texto claro para o cliente
        maskedValue,
        description: def.description,
        category: def.category,
        isSecret: def.isSecret,
        updatedAt,
      };
    });
  }

  /**
   * Testar conexão com a API da Groq
   */
  static async testGroq(apiKey?: string, model?: string): Promise<{ success: boolean; message: string }> {
    const keyToUse = apiKey || (await this.get("GROQ_API_KEY"));
    if (!keyToUse) {
      return { success: false, message: "Nenhuma chave da Groq foi informada ou configurada." };
    }

    const modelToUse = model || (await this.get("GROQ_MODEL")) || "openai/gpt-oss-120b";
    const start = Date.now();

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      const elapsed = Date.now() - start;
      if (res.ok) {
        return {
          success: true,
          message: `Conexão bem-sucedida com a Groq! Modelo: ${modelToUse} (${elapsed}ms).`,
        };
      }

      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `Erro HTTP ${res.status}: ${res.statusText}`;
      return { success: false, message: `Falha na Groq: ${msg}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de rede ao conectar na Groq";
      return { success: false, message: `Falha de rede: ${msg}` };
    }
  }

  /**
   * Limpar cache de memória (útil para testes unitários)
   */
  static _resetMemoryCache(): void {
    memorySettingsCache.clear();
  }
}
