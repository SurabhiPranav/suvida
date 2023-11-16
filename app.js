// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { promisify } = require('util');
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
var nodemailer = require('nodemailer');
const AdmZip = require('adm-zip');
const archiver = require('archiver');
const puppeteer = require('puppeteer');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'suvida',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
app.set("view engine", "ejs");
app.use(express.static("public"));

function format(date) {
  if (!(date instanceof Date)) {
    throw new Error('Invalid "date" argument. You must pass a date instance')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

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
async function sendEmailWithHTMLAndPDF(htmlContent, pdfBuffer, mailadd) {
  try {
    const mailOptions = {
      from: 'iit2021178@iiita.ac.in', // Sender's email address
      to: mailadd, // Receiver's email address
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



app.get('/', function (req, res) {
  res.render("login", { result: '' })
})
app.post('/', async (req, res) => {
  //res.set('Cache-Control', 'no-store');
  var username = (req.body.username)
  var password = (req.body.password)
  // Find user by email
  const [rows] = await pool.query('SELECT * FROM admin WHERE admin_id = ?', [username]);
  console.log(rows)
  const user = rows[0];
  console.log(username + " " + password)
  // User not found
  if (!user) {
    return res.render('login', { result: 'Invalid id or password' });
  }
  console.log(username + " " + password)
  // Compare password

  var isMatch = false;
  if (user.password == password) {
    isMatch = true
  };
  if (!isMatch) {
    return res.render('login', { result: "incorrect credentials" })
  }

  // Generate session token
  const sessionToken = jwt.sign({ userId: user.admin_id }, '12345678');
  await pool.query('UPDATE admin SET session_token = ? WHERE admin_id = ?', [sessionToken, user.admin_id]);

  // Set session token cookie
  res.cookie('sessionToken', sessionToken, { httpOnly: true });

  res.redirect('/index')
});
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'iit2021178@iiita.ac.in',
    pass: 'Pranav@c2'
  }
});
app.get("/index", async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const { sessionToken } = req.cookies;
    var decoded = jwt.verify(sessionToken, '12345678');
    console.log(decoded)
    const [A] = await pool.query('SELECT * FROM applicant where status=?', ["pending"]);
    const [I] = await pool.query('SELECT * FROM intern  where status=?', ["working"]);
    const [ad] = await pool.query('SELECT * FROM admin WHERE admin_id = ?', [decoded.userId]);
    res.render("index", { applicant: A, intern: I, admin: ad })


  }
  catch (err) {
    res.redirect('/')
  }



})
app.post("/addApplicant", async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const { sessionToken } = req.cookies;
    var decoded = jwt.verify(sessionToken, '12345678');


    await pool.query('insert into applicant (name,id,phone,email,admin_id,status,stream) values(?,?,?,?,?,?,?)', [req.body.name, req.body.id, req.body.phone, req.body.email, decoded.userId, "Pending", req.body.stream])
    res.redirect('/index');
  }
  catch (err) {
    throw err
  }
})
app.post("/add", async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const { sessionToken } = req.cookies;
    var decoded = jwt.verify(sessionToken, '12345678');
    var date = format(new Date())
    await pool.query('UPDATE applicant SET status = ? WHERE id = ?', ["accept", req.body.id]);
    await pool.query('insert into intern (id,`join`,`status`) values(?,?,?)', [req.body.id, date, "working"])
    var [d] = await pool.query('SELECT * FROM applicant where id=?', [req.body.id]);
    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>
    <title>Surabhi Pranav - WD</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>

<body >
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <div>
            <table>
            <tr>
                <td>
                    <img src="https://media.licdn.com/dms/image/C4D0BAQF97Cbv5ALLzA/company-logo_200_200/0/1648277837820/suvidha_foundation_logo?e=2147483647&v=beta&t=NToOCe5_y7AOPX64_tgtkAZCb2QTd6_Tx1peZpvv0OE" height="150px" width="150px">
                </td>
                <td>
                    <p>Suvidha Mahila Mandal, Walni <br/> Registration No. MH/568/1995 <br/> F No.12669

                        <br/> Registerd Under the Society Act of 1860
                        
                    </p>
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

           <p ><b>INTERNSHIP: OFFER LETTER<br /></b></p> 
            <p  ><b>To,<br /></b></p>
            <p><b>${d[0].name} ,<br /></b></p>
            <p>With reference to your interview, we are pleased to inform you that you have been selected as
                &#8220;<b>Web<br />Development Intern</b>&#8221; in our NGO - &#8220;Suvidha Mahila Mandal&#8221;, with
                the following terms and conditions.<br /></p>
            <p>&#9679; You will provide the <b>Web Development services and apart from Web development you have to
                    participate in the<br />fundraising task also </b>at <b>Suvidha Foundation </b>and deliver the
                effect of the work.<br /></p>
            <p>&#9679; The internship period will be from <b>${req.body.joining}  to ${req.body.ending}</b>.<br />&#9679;
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
            <p><b>${d[0].name} ( )<br /></b></p>
            <p>Mrs. Shobha Motghare<br />Secretary, Suvidha Mahila Mandal</p>

        </div>
    </div>
</body>

</html>
`;
    // Generate PDF from HTML content using Puppeteer and send email with HTML content and attached PDF
    generatePDFFromHTML(htmlContent)
      .then((pdfBuffer) => {
        return sendEmailWithHTMLAndPDF(htmlContent, pdfBuffer, d[0].email);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    res.redirect('/index');

  }
  catch (err) {
    throw err
  }
})
app.post("/delete", async (req, res) => {

  await pool.query('delete from applicant where id=?', [req.body.id])
  res.redirect('/index');
})
app.post("/complete", async (req, res) => {
  var date = format(new Date())
  await pool.query('UPDATE intern SET status = ?,ending=? WHERE id = ?', ["complete", date, req.body.id]);
  res.redirect('/index');
})
app.get('/logout', async (req, res) => {
  const { sessionToken } = req.cookies;
  // Verify session token
  try {
    var decoded = jwt.verify(sessionToken, '12345678');
    const userId = decoded.userId;
    // Clear session token
    await pool.query('UPDATE admin SET session_token = NULL WHERE admin_id = ?', [userId]);
    console.log(decoded)
    // Clear session token cookie
    res.clearCookie('sessionToken');
    // Redirect to / page
    res.redirect('/');
  } catch (err) {
    throw err
    // res.status(401).send('Unauthorized');
  }
});
app.listen(3000, function () {
  console.log('app listening on port 3000!');
});