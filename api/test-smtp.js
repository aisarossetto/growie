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

  const { smtpHost, smtpPort, smtpSecurity, smtpUser, smtpPass } = req.body;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(400).json({ error: 'Preencha o servidor SMTP, usuário (e-mail) e senha para testar.' });
  }

  try {
    const port = Number(smtpPort) || 465;
    const isSecure = smtpSecurity === 'ssl' || port === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.hostinger.com',
      port,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    return res.status(200).json({
      success: true,
      message: `Conexão SMTP com ${smtpHost}:${port} (${isSecure ? 'SSL' : 'TLS'}) confirmada com sucesso! Autenticação OK para ${smtpUser}.`
    });
  } catch (error) {
    console.error('SMTP Hostinger Verify Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Falha ao autenticar com o servidor SMTP Hostinger. Verifique usuário e senha.'
    });
  }
}
