define(['nodemailer', 'config'], function(nodemailer, config){

	var transport;

	switch( config.mailer.service ) {

		case 'gmail':
			transport = nodemailer.createTransport("SMTP", config.mailer.gmail);
		break;

		case 'ses':
			transport = nodemailer.createTransport("SES", {
        AWSAccessKeyID: config.mailer.ses.auth.accesskey,
        AWSSecretKey: config.mailer.ses.auth.secretkey
	    });
		break;

		default:
			transport = nodemailer.createTransport("Sendmail", config.mailer.sendmail.path);

	}

	return transport;

});