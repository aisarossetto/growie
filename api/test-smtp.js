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

  const { smtpHost = 'smtp.hostinger.com', smtpPort = 465, smtpSecurity = 'ssl', smtpUser, smtpPass } = req.body || {};

  if (!smtpUser || !smtpPass) {
    return res.status(400).json({ error: 'Preencha o e-mail de usuário e senha Hostinger para testar.' });
  }

  const host = smtpHost || 'smtp.hostinger.com';

  // 1. TEST PORT 465 SSL
  try {
    const transporter465 = nodemailer.createTransport({
      host,
      port: 465,
      secure: true,
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 7000,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });

    await transporter465.verify();
    return res.status(200).json({
      success: true,
      port: 465,
      message: `Conexão SMTP Hostinger com ${host}:465 (SSL) estabelecida e autenticada com sucesso para ${smtpUser}!`
    });
  } catch (err465) {
    console.warn(`Port 465 failed for ${smtpUser}, trying Port 587 TLS:`, err465.message);

    // 2. TEST PORT 587 STARTTLS
    try {
      const transporter587 = nodemailer.createTransport({
        host,
        port: 587,
        secure: false,
        requireTLS: true,
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 7000,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      });

      await transporter587.verify();
      return res.status(200).json({
        success: true,
        port: 587,
        message: `Conexão SMTP Hostinger com ${host}:587 (TLS/STARTTLS) estabelecida e autenticada com sucesso para ${smtpUser}!`
      });
    } catch (err587) {
      console.error('Both SMTP ports failed:', err587.message);
      return res.status(500).json({
        success: false,
        error: `Erro de Autenticação SMTP Hostinger: ${err465.message || err587.message}. Verifique se a senha do e-mail ${smtpUser} está correta.`
      });
    }
  }
}
