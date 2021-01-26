// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const nodemailer = require('nodemailer');
const fs = require('fs');
//Load the library and specify options
const replace = require('replace-in-file');

exports.sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    secure: true
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'RunCode Ingeniería SAS <info@runcode.co>',
    to: options.email,
    subject: options.subject,
    html: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

exports.sendEmailWithAttachments = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const maillist = ['eaar23@gmail.com', options.email];

  // 2) Define the email options
  const mailOptions = {
    from: 'RunCode Reports <info@runcode.co>',
    to: maillist,
    subject: options.subject,
    html: options.message,
    attachments: [
      {
        path: options.path
      }
    ]
  };

  const opt = {
    files: options.path,
    from: /\./g,
    to: ','
  };

  try {
    const results = await replace(opt);
    console.log('Replacement results:', results);
  } catch (error) {
    console.error('Error occurred:', error);
  }

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
  console.log('Correo enviado, eliminando plantilla temporal');
  fs.unlink(options.path, function(err) {
    if (err) throw err;
  });
};
