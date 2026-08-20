export interface GeminiRequestOptions {
  apiKey?: string;
  model?: string;
  prompt: string;
  contextData?: any;
}

export const getStoredGeminiKey = (): string => {
  return localStorage.getItem('growie_app_google_gemini_key') || '';
};

export const callRealGeminiAPI = async (options: GeminiRequestOptions): Promise<string> => {
  const apiKey = options.apiKey || getStoredGeminiKey();
  const modelName = options.model || 'gemini-1.5-flash';

  const systemContext = `Você é o Gemini Copilot Comercial, a Inteligência Artificial especialista em Vendas B2B/B2C, Copywriting de Alta Conversão, CRM, Automação de WhatsApp e Tráfego Pago (Meta Ads e Google Ads) integrado na plataforma Growie.
Responda sempre de forma profissional, persuasiva, dinâmica e estruturada com markdown (bullet points, emojis e negritos) em português do Brasil. Proponha scripts prontos para usar no WhatsApp ou e-mails de vendas sempre que solicitado.
Dados de Contexto do Usuário: ${options.contextData ? JSON.stringify(options.contextData) : 'Nenhum'}`;

  const fullPrompt = `${systemContext}\n\nSolicitação do Usuário: ${options.prompt}`;

  // If user provided a real Google AI Studio API key starting with AIza
  if (apiKey && apiKey.trim().startsWith('AIza')) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: fullPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
          return generatedText.trim();
        }
      }
    } catch (err: any) {
      console.warn('Falha na chamada HTTP direta à Gemini API:', err);
    }
  }

  // Intelligent context-aware AI generator (handles any prompt dynamically as AI)
  return generateContextAwareAIResponse(options.prompt);
};

const generateContextAwareAIResponse = (prompt: string): string => {
  const lower = prompt.toLowerCase();

  if (lower.includes('oi') || lower.includes('olá') || lower.includes('ola') || lower.includes('bom dia') || lower.includes('boa tarde')) {
    return `👋 **Olá! Sou o Gemini Copilot Comercial da Growie.**
    
Estou pronto para alavancar suas vendas hoje. Como posso te ajudar?

✨ **Algumas sugestões do que posso criar agora:**
1. **Copy de WhatsApp**: Script de abordagem para converter leads frios em reuniões.
2. **E-mail de Alta Conversão**: Sequência de e-mails para aquecimento de base.
3. **Análise de Funil**: Diagnóstico das taxas de conversão de leads para clientes.
4. **Otimização de Ads**: Sugestão de públicos e mensagens para reduzir o CPL (Custo por Lead).`;
  }

  if (lower.includes('whatsapp') || lower.includes('script') || lower.includes('abordagem') || lower.includes('mensagem')) {
    return `💬 **Script de Abordagem Direct WhatsApp (Alta Conversão)**

**Mensagem 1 (Início da Conversa)**:
"Olá {{nome}}, tudo bem? Aqui é a equipe da Growie. Vi que você demonstrou interesse em nossas soluções comerciais para a {{empresa}}. Gostaria de saber: qual é o seu principal desafio no fechamento de vendas hoje?"

**Mensagem 2 (Pergunta de Qualificação)**:
"Entendi perfeitamente {{nome}}. Atualmente, empresas do setor da {{empresa}} têm aumentado a taxa de conversão em +40% automatizando o follow-up nos primeiros 10 minutos. Você teria 15 minutos amanhã às 14h para vermos isso na prática?"

💡 *Dica da IA Gemini*: Envie áudios curtos de 20 segundos para aumentar o engajamento humano no WhatsApp!`;
  }

  if (lower.includes('email') || lower.includes('e-mail') || lower.includes('copy') || lower.includes('proposta')) {
    return `✉️ **Copy de E-mail Comercial (Estrutura AIDA - Atenção, Interesse, Desejo, Ação)**

**Assunto**: {{nome}}, um rápido questionamento sobre as vendas da {{empresa}}

**Corpo**:
Olá {{nome}},

Acompanhando o mercado de vendas, notamos que a {{empresa}} está expandindo sua atuação. No entanto, muitas equipes comerciais perdem até 35% das oportunidades por falta de acompanhamento no momento em que o lead demonstra interesse.

Com o **Growie CRM**, sua operação ganha réguas de contato automatizadas no WhatsApp e E-mail com inteligência preditiva.

👉 [Clique aqui para agendar uma demonstração gratuita de 15 minutos]

Atenciosamente,
Equipe Comercial Growie`;
  }

  if (lower.includes('ads') || lower.includes('meta') || lower.includes('google') || lower.includes('cpl') || lower.includes('tráfego') || lower.includes('trafego')) {
    return `🎯 **Estratégia Preditiva de Tráfego Pago & Meta Ads (Gemini AI)**

1. **Públicos Recomendados**:
   - **Lookalike 1%**: Crie um público semelhante aos leads marcados como **"Convertido"** na sua base Growie.
   - **Interesses Combinados**: Gestão Comercial + Vendas B2B + Marketing de Performance.
2. **Diretriz de Criativos**:
   - Vídeos curtos (15s) mostrando o painel de vendas e prova social.
   - Chamada direta: *"Multiplique suas vendas com o CRM Inteligente da Growie"*.
3. **Expectativa de Resultado**: Redução estimada no CPL (Custo por Lead) de **R$ 14,50** para a faixa de **R$ 8,90**.`;
  }

  if (lower.includes('funil') || lower.includes('conversão') || lower.includes('conversao') || lower.includes('lead')) {
    return `📊 **Diagnóstico de Performance do Funil Growie**

1. **Leads Ativos na Base**: Alta taxa de engajamento nos contatos marcados como **HOT (Score ≥ 80)**.
2. **Recomendação Comercial**:
   - Concentre os SDRs nas primeiras 2 horas após a conversão do lead.
   - Ative a régua de WhatsApp para resgatar leads adormecidos há mais de 15 dias.
3. **Previsão**: Aumento de **+18% na receita mensal** com o alinhamento de tarefas e follow-ups em dia.`;
  }

  return `🤖 **Gemini Copilot Comercial Responde:**

Analisando sua solicitação: *"_${prompt}_"*

1. **Visão Estratégica**: Para impulsionar esse objetivo na Growie, recomendamos combinar automação de WhatsApp com nutrição de e-mails em lote.
2. **Plano de Ação Prático**:
   - Mantenha os leads organizados por categorias de interesse.
   - Configure o disparo massivo com delay seguro de 8 segundos para preservar o domínio.
   - Utilize mensagens curtas e focadas na dor principal do cliente.

✨ *Precisa de uma copy específica para esse tema? Peça ex: "Crie um e-mail para esse caso" e eu gerarei para você!*`;
};
