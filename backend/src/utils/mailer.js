import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT || 587),
 	secure: false,
  	auth: {
    	user: process.env.SMTP_USER,
    	pass: process.env.SMTP_PASS
  	}
});

export const sendSecurityEmail = async (to, subject, text, html) => {
	const info = await transporter.sendMail({
    	from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    	to,
    	subject,
    	text,
    	html
  	});

	console.log('email sended: ', info);
	console.log('view mail:', nodemailer.getTestMessageUrl(info));
};

