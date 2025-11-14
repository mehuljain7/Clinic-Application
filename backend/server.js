// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import bodyParser from "body-parser";
// import connectDB from "./config/db.js";
// import User from "./models/User.js";
// import Diagnosis from "./models/Diagnosis.js";  // ✅ NEW
// import crypto from "crypto";
// import nodemailer from "nodemailer";
// import { Resend } from 'resend';
// import formData from "form-data";
// import Mailgun from "mailgun.js";


// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // ========================
// // AUTH ROUTES (EXISTING)
// // ========================

// console.log("🔑 Using Resend key:", process.env.KEY ? "✅ loaded" : "❌ missing");
// console.log("📨 Using from address:", process.env.EM);

// // Initialize Mailgun client (HTTPS API — works on Render)
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({
//   username: "api",
//   key: process.env.MAILGUN_API_KEY,
// });


// app.post("/api/register", async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists ❌" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       verificationToken
//     });

//     await newUser.save();

//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     user: process.env.EMAIL_USER,
//     //     pass: process.env.EMAIL_PASS,
//     //   },
//     // });

//     // const resend = new Resend(process.env.KEY);

//     // const verifyUrl = `http://localhost:5000/api/verify/${verificationToken}`;

//     const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

//     const verifyUrl = `${BASE_URL}/api/verify/${verificationToken}`;

//     // const mailOptions = {
//     //   from: process.env.EMAIL_USER,
//     //   to: email,
//     //   subject: "Verify your email",
//     //   html: `
//     //     <h2>Hello ${firstName},</h2>
//     //     <p>Thanks for registering! Please verify your email by clicking below:</p>
//     //     <a href="${verifyUrl}">Verify Email</a>
//     //   `,
//     // };

//     // await transporter.sendMail(mailOptions);

//     // try {await resend.emails.send({
//     //   from: process.env.EM,
//     //   to: email,
//     //   subject: "Verify your email",
//     //   html: `
//     //     <h2>Hello ${firstName},</h2>
//     //     <p>Thanks for registering! Please verify your email by clicking below:</p>
//     //     <a href="${verifyUrl}">Verify Email</a>
//     //   `,
//     // })
//     // console.log(`📧 Verification email sent to: ${email}`);
//     // res.json({ message: "User registered! Check your email for verification link 📩" });}
//     // catch (err) {
//     //   console.error("❌ Resend error:", err);
//     // }

//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     // const mailOptions = {
//     //   from: process.env.SMTP_FROM,
//     //   to: email,
//     //   subject: "Verify your email",
//     //   html: `
//     //     <h2>Hello ${firstName},</h2>
//     //     <p>Thanks for registering! Please verify your email by clicking below:</p>
//     //     <a href="${verifyUrl}">Verify Email</a>
//     //   `,
//     // };

//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error("❌ Email failed:", error);
//     //   } else {
//     //     console.log("✅ Email sent:", info.response);
//     //   }
//     // });

//     await mg.messages.create(process.env.MAILGUN_DOMAIN, {
//       from: process.env.MAILGUN_FROM,
//       to: email,
//       subject: "Verify your email",
//       html: `
//         <h2>Hello ${firstName},</h2>
//         <p>Thanks for registering! Please verify your email by clicking below:</p>
//         <a href="${verifyUrl}">Verify Email</a>
//       `,
//     });
//     console.log(`📧 Verification email sent to: ${email}`);


//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Email already registered ❌" });
//     }
//     console.error("❌ Error during registration:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.get("/api/verify/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const user = await User.findOne({ verificationToken: token });

//     if (!user) {
//       return res.status(400).send("Invalid or expired token ❌");
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     await user.save();

//     res.send("✅ Email verified successfully! You can now log in.");
//   } catch (error) {
//     console.error("Verification error:", error);
//     res.status(500).send("Server error");
//   }
// });

// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;
//   console.log("🟡 Login attempt for:", email);

//   try {
//     const user = await User.findOne({ email });
    
//     if (!user) {
//       console.log("❌ No user found");
//       return res.status(400).json({ message: "User not found ❌" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid password ❌" });
//     }

//     if (!user.isVerified) {
//       console.log("⚠️ User not verified");
//       return res.status(403).json({ message: "Please verify your email before logging in." });
//     }

//     console.log("✅ Login success for:", user.email);
//     res.json({
//       message: "Login successful 🎉",
//       user: { 
//         email: user.email, 
//         firstName: user.firstName,
//         lastName: user.lastName 
//       },
//     });

//   } catch (error) {
//     console.error("💥 Login error details:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.post("/api/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found ❌" });

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.resetToken = resetToken;
//     user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
//     await user.save();

//     const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

//     // const resetUrl = `http://localhost:5000/reset/${resetToken}`;
//     const resetUrl = `${BASE_URL}/reset/${resetToken}`;

//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//     // });

//     // const resend = new Resend(process.env.KEY);

//     // await transporter.sendMail({
//     //   from: process.env.EMAIL_USER,
//     //   to: email,
//     //   subject: "Password Reset Request",
//     //   html: `
//     //     <p>Click below to reset your password:</p>
//     //     <a href="${resetUrl}">Reset Password</a>
//     //     <p>Link expires in 15 minutes</p>
//     //   `,
//     // });

//     // try{await resend.emails.send({
//     //   from: process.env.EM,
//     //   to: email,
//     //   subject: "Password Reset Request",
//     //   html: `
//     //     <p>Click below to reset your password:</p>
//     //     <a href="${resetUrl}">Reset Password</a>
//     //     <p>Link expires in 15 minutes</p>
//     //   `,
//     // });




//     // res.json({ message: "Password reset email sent 📧" });}
//     // catch (err) {console.error("❌ Resend error:", err);}

//     // const transporter = nodemailer.createTransport({
//     //   host: process.env.SMTP_HOST,
//     //   port: process.env.SMTP_PORT,
//     //   auth: {
//     //     user: process.env.SMTP_USER,
//     //     pass: process.env.SMTP_PASS,
//     //   },
//     // });

//     // const mailOptions = {
//     //   from: process.env.SMTP_FROM,
//     //   to: email,
//     //   subject: "Password Reset Request",
//     //   html: `
//     //     <p>Click below to reset your password:</p>
//     //     <a href="${resetUrl}">Reset Password</a>
//     //     <p>Link expires in 15 minutes</p>
//     //   `,
//     // };

//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error("❌ Email failed:", error);
//     //   } else {
//     //     console.log("✅ Email sent:", info.response);
//     //   }
//     // });

//     await mg.messages.create(process.env.MAILGUN_DOMAIN, {
//   from: process.env.MAILGUN_FROM,
//   to: email,
//   subject: "Password Reset Request",
//   html: `
//     <p>Click below to reset your password:</p>
//     <a href="${resetUrl}">Reset Password</a>
//     <p>Link expires in 15 minutes.</p>
//   `,
// });
// console.log(`📧 Password reset email sent to: ${email}`);


//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.post("/api/resend-verification", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found ❌" });

//     if (user.isVerified) {
//       return res.json({ message: "User already verified ✅" });
//     }

//     const newToken = crypto.randomBytes(32).toString("hex");
//     user.verificationToken = newToken;
//     await user.save();

//     const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

//     // const verifyUrl = `http://localhost:5000/api/verify/${newToken}`;
//     const verifyUrl = `${BASE_URL}/api/verify/${newToken}`;

//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     user: process.env.EMAIL_USER,
//     //     pass: process.env.EMAIL_PASS,
//     //   },
//     // });

//     // const resend = new Resend(process.env.KEY);

//     // await transporter.sendMail({
//     //   to: email,
//     //   subject: "Verify your email again",
//     //   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
//     // });

//     // try{await resend.emails.send({
//     //   from: process.env.EM,
//     //   to: email,
//     //   subject: "Verify your email again",
//     //   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
//     // });

//     // console.log("📧 Verification email resent to:", email);
//     // res.json({ message: "Verification email resent 📧" });}
//     // catch (err) {
//     //   console.error("❌ Resend error:", err);
//     // }

//     // const transporter = nodemailer.createTransport({
//     //   host: process.env.SMTP_HOST,
//     //   port: process.env.SMTP_PORT,
//     //   auth: {
//     //     user: process.env.SMTP_USER,
//     //     pass: process.env.SMTP_PASS,
//     //   },
//     // });

//     // const mailOptions = {
//     //   from: process.env.SMTP_FROM,
//     //   to: email,
//     //   subject: "Verify your email again",
//     //   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
//     // };

//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error("❌ Email failed:", error);
//     //   } else {
//     //     console.log("✅ Email sent:", info.response);
//     //   }
//     // });

//     await mg.messages.create(process.env.MAILGUN_DOMAIN, {
//   from: process.env.MAILGUN_FROM,
//   to: email,
//   subject: "Verify your email again",
//   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
// });
// console.log(`📧 Resent verification email to: ${email}`);


//   } catch (error) {
//     console.error("Error resending verification:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.get("/reset/:token", async (req, res) => {
//   const { token } = req.params;

//   try {
//     const user = await User.findOne({
//       resetToken: token,
//       resetTokenExpiry: { $gt: Date.now() },
//     });

//     if (!user) return res.status(400).send("Invalid or expired token ❌");

//     res.send(`
//       <h2>Reset your password</h2>
//       <form action="/reset/${token}" method="POST">
//         <input type="password" name="password" placeholder="New Password" required />
//         <button type="submit">Reset Password</button>
//       </form>
//     `);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// app.post("/reset/:token", async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     const user = await User.findOne({
//       resetToken: token,
//       resetTokenExpiry: { $gt: Date.now() },
//     });

//     if (!user) return res.status(400).send("Invalid or expired token ❌");

//     user.password = await bcrypt.hash(password, 10);
//     user.resetToken = undefined;
//     user.resetTokenExpiry = undefined;

//     await user.save();

//     res.send(`<h2>Password reset successful ✅</h2><p>You can now login with your new password.</p>`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// // ========================
// // ✅ NEW DIAGNOSIS ROUTES
// // ========================

// // Save diagnosis result
// app.post("/api/saveDiagnosis", async (req, res) => {
//   const { userEmail, userName, inputs, results } = req.body;

//   try {
//     if (!userEmail || !inputs || !results) {
//       return res.status(400).json({ 
//         error: "Missing required fields: userEmail, inputs, results" 
//       });
//     }

//     // Determine top result (highest value from results)
//     let topResult = "Unknown";
//     if (results && typeof results === 'object') {
//       const entries = Object.entries(results);
//       if (entries.length > 0) {
//         topResult = entries.reduce((max, curr) => 
//           parseFloat(curr[1]) > parseFloat(max[1]) ? curr : max
//         )[0];
//       }
//     }

//     const diagnosis = new Diagnosis({
//       userEmail,
//       userName: userName || "User",
//       inputs,
//       results,
//       topResult
//     });

//     await diagnosis.save();

//     console.log("✅ Diagnosis saved for:", userEmail);
//     res.json({ 
//       message: "Diagnosis saved successfully",
//       diagnosisId: diagnosis._id
//     });

//   } catch (error) {
//     console.error("❌ Error saving diagnosis:", error);
//     res.status(500).json({ error: "Failed to save diagnosis" });
//   }
// });

// // Get all diagnoses for a user
// app.get("/api/reports/:email", async (req, res) => {
//   const { email } = req.params;

//   try {
//     const reports = await Diagnosis.find({ userEmail: email })
//       .sort({ createdAt: -1 })  // Most recent first
//       .limit(50);  // Limit to last 50 reports

//     console.log(`📊 Found ${reports.length} reports for ${email}`);
//     res.json({ reports });

//   } catch (error) {
//     console.error("❌ Error fetching reports:", error);
//     res.status(500).json({ error: "Failed to fetch reports" });
//   }
// });

// // Get single diagnosis by ID
// app.get("/api/diagnosis/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const diagnosis = await Diagnosis.findById(id);

//     if (!diagnosis) {
//       return res.status(404).json({ error: "Diagnosis not found" });
//     }

//     res.json({ diagnosis });

//   } catch (error) {
//     console.error("❌ Error fetching diagnosis:", error);
//     res.status(500).json({ error: "Failed to fetch diagnosis" });
//   }
// });

// // Generate PDF (placeholder - you can enhance with a PDF library)
// app.post("/api/generatePDF", async (req, res) => {
//   const { inputs, results } = req.body;

//   try {
//     // For now, return a simple HTML response
//     // You can use libraries like pdfkit or puppeteer for actual PDFs
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Diagnosis Report</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           h1 { color: #4A90E2; }
//           .section { margin: 20px 0; }
//           .label { font-weight: bold; }
//         </style>
//       </head>
//       <body>
//         <h1>🩺 Allergy Diagnosis Report</h1>
//         <div class="section">
//           <h2>Input Data</h2>
//           <pre>${JSON.stringify(inputs, null, 2)}</pre>
//         </div>
//         <div class="section">
//           <h2>Results</h2>
//           <pre>${JSON.stringify(results, null, 2)}</pre>
//         </div>
//         <p>Generated on: ${new Date().toLocaleString()}</p>
//       </body>
//       </html>
//     `;

//     res.setHeader('Content-Type', 'text/html');
//     res.send(htmlContent);

//   } catch (error) {
//     console.error("❌ Error generating PDF:", error);
//     res.status(500).json({ error: "Failed to generate PDF" });
//   }
// });

// // ========================
// // START SERVER
// // ========================

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Diagnosis from "./models/Diagnosis.js";  // ✅ NEW
import crypto from "crypto";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ========================
// AUTH ROUTES (EXISTING)
// ========================

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken
    });

    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // const verifyUrl = `http://localhost:5000/api/verify/${verificationToken}`;

    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    const verifyUrl = `${BASE_URL}/api/verify/${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Hello ${firstName},</h2>
        <p>Thanks for registering! Please verify your email by clicking below:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to: ${email}`);
    res.json({ message: "User registered! Check your email for verification link 📩" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered ❌" });
    }
    console.error("❌ Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send("Invalid or expired token ❌");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send("✅ Email verified successfully! You can now log in.");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Server error");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🟡 Login attempt for:", email);

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ No user found");
      return res.status(400).json({ message: "User not found ❌" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    if (!user.isVerified) {
      console.log("⚠️ User not verified");
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    console.log("✅ Login success for:", user.email);
    res.json({
      message: "Login successful 🎉",
      user: { 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName 
      },
    });

  } catch (error) {
    console.error("💥 Login error details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found ❌" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // const resetUrl = `http://localhost:5000/reset/${resetToken}`;
    const resetUrl = `${BASE_URL}/reset/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Link expires in 15 minutes</p>
      `,
    });

    res.json({ message: "Password reset email sent 📧" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found ❌" });

    if (user.isVerified) {
      return res.json({ message: "User already verified ✅" });
    }

    const newToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = newToken;
    await user.save();

    // const verifyUrl = `http://localhost:5000/api/verify/${newToken}`;
    const verifyUrl = `${BASE_URL}/api/verify/${newToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Verify your email again",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    console.log("📧 Verification email resent to:", email);
    res.json({ message: "Verification email resent 📧" });

  } catch (error) {
    console.error("Error resending verification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/reset/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send("Invalid or expired token ❌");

    res.send(`
      <h2>Reset your password</h2>
      <form action="/reset/${token}" method="POST">
        <input type="password" name="password" placeholder="New Password" required />
        <button type="submit">Reset Password</button>
      </form>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/reset/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send("Invalid or expired token ❌");

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.send(`<h2>Password reset successful ✅</h2><p>You can now login with your new password.</p>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ========================
// ✅ NEW DIAGNOSIS ROUTES
// ========================

// Save diagnosis result
app.post("/api/saveDiagnosis", async (req, res) => {
  const { userEmail, userName, inputs, results } = req.body;

  try {
    if (!userEmail || !inputs || !results) {
      return res.status(400).json({ 
        error: "Missing required fields: userEmail, inputs, results" 
      });
    }

    // Determine top result (highest value from results)
    let topResult = "Unknown";
    if (results && typeof results === 'object') {
      const entries = Object.entries(results);
      if (entries.length > 0) {
        topResult = entries.reduce((max, curr) => 
          parseFloat(curr[1]) > parseFloat(max[1]) ? curr : max
        )[0];
      }
    }

    const diagnosis = new Diagnosis({
      userEmail,
      userName: userName || "User",
      inputs,
      results,
      topResult
    });

    await diagnosis.save();

    console.log("✅ Diagnosis saved for:", userEmail);
    res.json({ 
      message: "Diagnosis saved successfully",
      diagnosisId: diagnosis._id
    });

  } catch (error) {
    console.error("❌ Error saving diagnosis:", error);
    res.status(500).json({ error: "Failed to save diagnosis" });
  }
});

// Get all diagnoses for a user
app.get("/api/reports/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const reports = await Diagnosis.find({ userEmail: email })
      .sort({ createdAt: -1 })  // Most recent first
      .limit(50);  // Limit to last 50 reports

    console.log(`📊 Found ${reports.length} reports for ${email}`);
    res.json({ reports });

  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get single diagnosis by ID
app.get("/api/diagnosis/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const diagnosis = await Diagnosis.findById(id);

    if (!diagnosis) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    res.json({ diagnosis });

  } catch (error) {
    console.error("❌ Error fetching diagnosis:", error);
    res.status(500).json({ error: "Failed to fetch diagnosis" });
  }
});

// Generate PDF (placeholder - you can enhance with a PDF library)
app.post("/api/generatePDF", async (req, res) => {
  const { inputs, results } = req.body;

  try {
    // For now, return a simple HTML response
    // You can use libraries like pdfkit or puppeteer for actual PDFs
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Diagnosis Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4A90E2; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>🩺 Allergy Diagnosis Report</h1>
        <div class="section">
          <h2>Input Data</h2>
          <pre>${JSON.stringify(inputs, null, 2)}</pre>
        </div>
        <div class="section">
          <h2>Results</h2>
          <pre>${JSON.stringify(results, null, 2)}</pre>
        </div>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));