const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

// Create a Nodemailer transporter
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'iit2021178@iiita.ac.in',
      pass: 'Pranav@c2'
    }
  });
// Function to generate a PDF from HTML content using Puppeteer
async function generatePDFFromHTML(htmlContent) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set content to the page
    await page.setContent(htmlContent);

    // Generate PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('Error occurred while generating PDF:', error);
    throw error;
  }
}

// Function to send an email with HTML content and attached PDF
async function sendEmailWithHTMLAndPDF(htmlContent, pdfBuffer) {
  try {
    const mailOptions = {
      from: 'iit2021178@iiita.ac.in', // Sender's email address
      to: 'pranavsurabhi15@gmail.com', // Receiver's email address
      subject: 'Sending HTML Content with Attached PDF',
      html: htmlContent, // HTML content for the email body
      attachments: [
        {
          filename: 'attachment.pdf', // Name of the attached file
          content: pdfBuffer, // Content of the attached PDF
        },
      ],
    };

    // Send email with HTML content and attached PDF
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error occurred while sending email:', error);
    throw error;
  }
}

// HTML content for the email body
const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>
    <title>Surabhi Pranav - WD</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<center>
<body >
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <div>
                <table>
                    <tr>
                        <td>
                            <img src="suvida.png" height="150px" width="400px">
                        </td>
                        <td>
                            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                        </td>
                        <td>
                            <p>H.No. 1951, W.N.4, Khaperkheda, Saoner,<br />Nagpur, Maharashtra, India<br />Contact:
                                (+91)08010996763<br />info@suvidhafoundationedutech.Org<br />www.suvidhafoundationedutech.org<br />
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            <p><b>Date: 16-10-2023 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    &nbsp; &nbsp; &nbsp; &nbsp;Ref. No. SMM2023WD960531<br /></b></p>

           <center> <p ><b>INTERNSHIP: OFFER LETTER<br /></b></p> </center>
            <p  ><b>To,<br /></b></p>
            <p><b>Surabhi Pranav ,<br /></b></p>
            <p>With reference to your interview, we are pleased to inform you that you have been selected as
                &#8220;<b>Web<br />Development Intern</b>&#8221; in our NGO - &#8220;Suvidha Mahila Mandal&#8221;, with
                the following terms and conditions.<br /></p>
            <p>&#9679; You will provide the <b>Web Development services and apart from Web development you have to
                    participate in the<br />fundraising task also </b>at <b>Suvidha Foundation </b>and deliver the
                effect of the work.<br /></p>
            <p>&#9679; The internship period will be from <b>17 October, 2023 to 17 November, 2023</b>.<br />&#9679;
                Your work base station is work from Home and six days a week.<br />&#9679; <b>It is an unpaid
                    internship. </b>The certificate of completion will be given only if you invest 4 hours daily on all
                working<br /></p>
            <p>days. You must participate in the daily team meetings through Google Meet. Also, the letter holds no
                value without a<br />completion certificate from us with a unique identification number, which can be
                verified online.<br /></p>
            <p>&#9679; During the internship period and thereafter, you will not give out to anyone in writing or by
                word of mouth or<br />otherwise particulars or details of work process, technical know-how, research
                carried out, security arrangements<br />and/or matters of confidential or secret nature which you may
                come across during your service in this organization.<br /></p>
            <p>&#9679; In case of any misconduct which causes financial loss to the NGO or hurts its reputation and
                goodwill of the<br />organization, the management has the right to terminate any intern. In case of
                termination, the management will not<br />be issuing certificates to the intern.<br /></p>
            <p>&#9679; It is necessary for an intern to return all the organization belongings (login credentials, media
                created, and system) at<br />the time of leaving the organization. A clearance and experience
                certificate will be given after completing the<br />formalities. If any employee leaves the
                job/Internship without completing the formality, the organization will take<br />necessary action. All
                the software/courses/data developed by the interns or any employee for the Suvidha Mahila<br />Mandal
                are intellectual property of the organization &amp; are protected by Indian Copyright Act. All the data
                generated<br />during the internship period, is the property right of organization and can be used for
                any purpose. In case of any<br />piracy, strict legal action will be taken by the organization against
                erring persons. No information or source codes or<br />course curriculum or business secrets or
                financial position or other details of organization shall be discussed among<br />friends or relatives
                or our competitors. Such leakage of information is likely to cause financial loss to the
                organization.<br />Hence, in such a case, the organization will be terminating the employee immediately
                and if required, further legal<br />action will be taken against that intern.<br /></p>
            <p><b>Surabhi Pranav ( )<br /></b></p>
            <p>Mrs. Shobha Motghare<br />Secretary, Suvidha Mahila Mandal</p>

        </div>
    </div>
</body>
</center>
</html>
`;

// Generate PDF from HTML content using Puppeteer and send email with HTML content and attached PDF
generatePDFFromHTML(htmlContent)
  .then((pdfBuffer) => {
    return sendEmailWithHTMLAndPDF(htmlContent, pdfBuffer);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
