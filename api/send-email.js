import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { 
    smtpHost = 'smtp.hostinger.com', 
    smtpPort = 465, 
    smtpSecurity = 'ssl', 
    smtpUser = 'isadora@pluriecomunicacao.com.br', 
    smtpPass = '$chirmerS20', 
    senderName, 
    fromName,
    senderEmail,
    fromEmail,
    to, 
    toEmail,
    subject, 
    html, 
    text,
    content,
    signature,
    campaignId,
    leadId,
    tenantId
  } = req.body || {};

  const targetEmail = to || toEmail;
  const targetSender = senderName || fromName || 'Isadora Rossetto | Growie';
  const bodyText = text || content || '';
  
  if (!targetEmail) {
    return res.status(400).json({ error: 'Falta o e-mail de destino (to ou toEmail).' });
  }

  // Determine valid email for FROM field
  let validFromEmail = fromEmail || senderEmail || smtpUser || 'isadora@pluriecomunicacao.com.br';
  if (!validFromEmail.includes('@')) {
    validFromEmail = `${validFromEmail}@pluriecomunicacao.com.br`;
  }

  // 1x1 OPEN TRACKING PIXEL INJECTION (GUARANTEED ON ALL SENT EMAILS)
  const currentCmpId = campaignId || 'cmp_' + Date.now();
  const currentLeadId = leadId || 'lead_' + Date.now();
  const trackingPixelUrl = `https://growie-ruddy.vercel.app/api/track/open?campaignId=${encodeURIComponent(currentCmpId)}&leadId=${encodeURIComponent(currentLeadId)}&email=${encodeURIComponent(targetEmail)}&t=${Date.now()}`;
  const trackingPixelTag = `<div style="margin-top:15px;clear:both;"><img src="${trackingPixelUrl}" width="1" height="1" border="0" style="display:block;width:1px;height:1px;max-height:1px;max-width:1px;margin:0;padding:0;border:none;outline:none;" alt="" /></div>`;

  let bodyHtml = html || (content ? `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #1e293b; margin: 0; padding: 0;"><style>p, div { margin: 0 0 6px 0; padding: 0; line-height: 1.4; }</style><div>${content}</div>${signature ? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${signature}</div>` : ''}</div>` : `<p>${bodyText}</p>`);

  // Append unique invisible token to prevent Gmail thread collapsing (...)
  bodyHtml = bodyHtml + `<!-- growie_unique_token_${Date.now()}_${Math.random().toString(36).substring(2, 6)} -->`;

  // Ensure tracking pixel tag is attached at end of HTML
  if (!bodyHtml.includes('/api/track/open')) {
    bodyHtml = bodyHtml + trackingPixelTag;
  }

  // AUTOMATIC BASE64 TO CID INLINE ATTACHMENT CONVERTER (100% GMAIL & OUTLOOK COMPATIBLE)
  const mailAttachments = [];
  let processedHtml = bodyHtml;
  let cidIndex = 1;

  // Regex to catch all data:image/...(png|jpeg|jpg|gif|webp);base64,... URIs
  const base64Regex = /src=["'](data:image\/(png|jpeg|jpg|gif|webp);base64,([^"']+))["']/gi;
  processedHtml = processedHtml.replace(base64Regex, (match, fullDataUrl, mimeType, base64Data) => {
    try {
      const cid = `img_cid_${cidIndex}_${Date.now()}@growie`;
      const ext = mimeType === 'jpeg' ? 'jpg' : mimeType;
      const filename = `image_${cidIndex}.${ext}`;
      const buffer = Buffer.from(base64Data, 'base64');

      mailAttachments.push({
        filename,
        content: buffer,
        cid: cid
      });

      cidIndex++;
      return `src="cid:${cid}"`;
    } catch (e) {
      return match;
    }
  });

  // 1. ATTEMPT REAL SMTP PORT 465 (SSL) VIA NODEMAILER
  const host = smtpHost || 'smtp.hostinger.com';

  try {
    const transporter465 = nodemailer.createTransport({
      host,
      port: 465,
      secure: true,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });

    const info465 = await transporter465.sendMail({
      from: `"${targetSender}" <${validFromEmail}>`,
      to: targetEmail,
      subject: subject || 'Proposta Comercial Growie',
      text: bodyText || processedHtml.replace(/<[^>]+>/g, ''),
      html: processedHtml,
      attachments: mailAttachments
    });

    console.log(`✅ Real Email Sent via SMTP 465 (${host}) to ${targetEmail}. MessageId: ${info465.messageId}`);
    return res.status(200).json({
      success: true,
      method: 'SMTP_465',
      messageId: info465.messageId,
      pixelUrl: trackingPixelUrl,
      message: `E-mail enviado com sucesso via Hostinger SSL (Porta 465) para ${targetEmail}.`
    });
  } catch (err465) {
    console.warn(`Port 465 SSL failed (${err465.message}), attempting Port 587 TLS:`);

    // 2. ATTEMPT REAL SMTP PORT 587 (STARTTLS / TLS) VIA NODEMAILER
    try {
      const transporter587 = nodemailer.createTransport({
        host,
        port: 587,
        secure: false,
        requireTLS: true,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      });

      const info587 = await transporter587.sendMail({
        from: `"${targetSender}" <${validFromEmail}>`,
        to: targetEmail,
        subject: subject || 'Proposta Comercial Growie',
        text: bodyText || processedHtml.replace(/<[^>]+>/g, ''),
        html: processedHtml,
        attachments: mailAttachments
      });

      console.log(`✅ Real Email Sent via SMTP 587 (${host}) to ${targetEmail}. MessageId: ${info587.messageId}`);
      return res.status(200).json({
        success: true,
        method: 'SMTP_587',
        messageId: info587.messageId,
        pixelUrl: trackingPixelUrl,
        message: `E-mail enviado com sucesso via Hostinger TLS (Porta 587) para ${targetEmail}.`
      });
    } catch (err587) {
      console.error(`❌ ERRO SMTP HOSTINGER (465 & 587 Falharam):`, err465.message, err587.message);
      return res.status(500).json({
        error: `Falha na autenticação SMTP Hostinger: ${err587.message || err465.message}. Verifique o e-mail e senha configurados.`
      });
    }
  }
}
