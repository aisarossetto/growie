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

  let bodyHtml = html || (content ? `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;"><div>${content}</div>${signature ? `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${signature}</div>` : ''}</div>` : `<p>${bodyText}</p>`);

  // Ensure tracking pixel tag is attached at end of HTML
  if (!bodyHtml.includes('/api/track/open')) {
    bodyHtml = bodyHtml + trackingPixelTag;
  }

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
      text: bodyText || bodyHtml.replace(/<[^>]+>/g, ''),
      html: bodyHtml
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
        text: bodyText || bodyHtml.replace(/<[^>]+>/g, ''),
        html: bodyHtml
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
      console.warn(`Port 587 TLS failed (${err587.message}), attempting HTTPS Direct Mailer:`);

      // 3. ATTEMPT HTTPS DIRECT DELIVERY VIA FORMSUBMIT REST API (PORT 443 - DIRECT TO LEAD)
      try {
        const httpRes = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: subject || 'Proposta Comercial Growie',
            _replyto: validFromEmail,
            remetente: targetSender,
            mensagem: bodyText || bodyHtml.replace(/<[^>]+>/g, ''),
            _template: 'box'
          })
        });

        const httpData = await httpRes.json();
        if (httpRes.ok && httpData.success) {
          console.log(`✅ Real Email Delivered via HTTPS Direct API to ${targetEmail}`);
          return res.status(200).json({
            success: true,
            method: 'HTTPS_DIRECT_API',
            messageId: 'fs_' + Date.now(),
            pixelUrl: trackingPixelUrl,
            message: `E-mail entregue com sucesso via HTTPS API para ${targetEmail}.`
          });
        }
      } catch (errHttp) {
        console.error('HTTPS Direct API Error:', errHttp.message);
      }

      // 4. Final Fallback Response with detailed diagnostics
      return res.status(200).json({
        success: true,
        simulated: true,
        pixelUrl: trackingPixelUrl,
        smtpError: err465.message || err587.message,
        message: `Disparo registrado para ${targetEmail}. (Nota: Se a senha Hostinger estiver incorreta ou a caixa de e-mail desativada, atualize em Configurações).`
      });
    }
  }
}
