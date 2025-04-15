const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Configuration du transporteur email (à mettre dans config.js)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Aucun utilisateur avec cet email' });
    }

    // Générer un token
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 heure

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Envoyer l'email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Vous avez demandé à réinitialiser votre mot de passe. 
      Cliquez sur ce lien pour continuer: ${resetUrl}
      Ce lien expirera dans 1 heure.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Un email de réinitialisation a été envoyé' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};