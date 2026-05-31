/* global process */
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { portfolioData } from "./src/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const maskSecret = (value) => {
  if (!value) return "";
  if (value.length <= 2) return "*".repeat(value.length);
  return `${value[0]}${"*".repeat(value.length - 2)}${value.slice(-1)}`;
};

let currentAdminPassword = process.env.ADMIN_PASSWORD || "AKS";
const messages = [];

app.use(express.json({ limit: "10mb" }));

app.post("/api/admin/auth", async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }

  const isValid = password === currentAdminPassword;
  console.log(
    `Admin authentication attempt details: Success=${isValid}, Time=${new Date().toISOString()}, IP=${req.ip}`,
  );

  if (!isValid) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid password" });
  }

  return res.json({ success: true, message: "Authenticated successfully" });
});

app.post("/api/admin/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old password and new password are required",
    });
  }

  if (oldPassword !== currentAdminPassword) {
    console.log(
      `Failed password change attempt: Incorrect current password, Time=${new Date().toISOString()}, IP=${req.ip}`,
    );

    return res
      .status(401)
      .json({ success: false, message: "Old password is incorrect" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  currentAdminPassword = newPassword;
  console.log(
    `Admin password changed successfully: Time=${new Date().toISOString()}, IP=${req.ip}`,
  );

  return res.json({ success: true, message: "Password updated successfully" });
});

app.get("/api/admin/messages", (req, res) => {
  return res.json({ success: true, messages });
});

app.delete("/api/admin/messages/:id", (req, res) => {
  const { id } = req.params;
  const index = messages.findIndex((msg) => msg.id === id);
  if (index === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Message not found" });
  }
  messages.splice(index, 1);
  return res.json({ success: true, message: "Message deleted successfully" });
});

const sanitizeText = (value) => {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
};

const sanitizeEmail = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/[\s<>"'\\]/g, "").trim();
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post("/api/contact", async (req, res) => {
  const name = sanitizeText(req.body.name);
  const email = sanitizeEmail(req.body.email);
  const subject = sanitizeText(req.body.subject);
  const message = sanitizeText(req.body.message);

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Provide a valid email address" });
  }

  if (name.length > 100 || subject.length > 120 || message.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "One or more fields exceed supported length",
    });
  }

  const contactMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email,
    subject,
    message,
    receivedAt: new Date().toISOString(),
  };

  messages.unshift(contactMessage);

  console.log(
    `Received contact message:\n  Name: ${name}\n  Email: ${email}\n  Subject: ${subject}\n  Message: ${message}`,
  );

  return res.json({ success: true, message: "Message received successfully!" });
});

// app.post("/api/chat", async (req, res) => {
//   const { message } = req.body;
//   if (!messages || !Array.isArray(messages)) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Messages array is required" });
//   }

//   const pData = portfolioData || {};
//   const apiKey = process.env.GEMINI_API_KEY;

//   if (apiKey) {
//     try {
//       const systemInstructionText = `You are Achyutam's AI Assistant.
// Achyutam's Details:
// Profile Name: ${pData.profile?.name || "Achyutam Sharma"}
// Title: ${pData.profile?.title || "Data Analyst & Full-Stack Developer"}
// Bio: ${pData.profile?.bio || ""}
// Location: ${pData.profile?.location || "Jharkhand, India"}
// Email: ${pData.profile?.email || "akshubusiness187@gmail.com"}
// LinkedIn: ${pData.profile?.linkedin || ""}
// GitHub: ${pData.profile?.github || ""}
// Instagram: ${pData.profile?.instagram || ""}

// Skills:
// ${(pData.skills || []).map((s) => `- ${s.name} (Level: ${s.level}%, Category: ${s.category})`).join("\n")}

// Projects:
// ${(pData.projects || []).map((p) => `- ${p.title}: ${p.description}. Long description: ${p.longDescription || ""}. Tags: ${p.tags?.join(", ") || ""}. GitHub: ${p.github || ""}`).join("\n")}

// Education:
// ${(pData.education || []).map((e) => `- ${e.degree} at ${e.institution} (${e.year}) - GPA: ${e.gpa || ""}. Description: ${e.description || ""}`).join("\n")}

// Custom Frequently Asked Questions (FAQ):
// ${(pData.faqs || []).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n")}

// Strict Rules:
// 1. ONLY answer questions that are directly related to Achyutam Sharma, his work, his portfolio, his skills, his projects, his education, or how to contact him.
// 2. If the user asks about ANY unrelated topic (e.g. general programming questions not about his projects, sports, math, capital of countries, general writing, weather, etc.), you must refuse to answer. Respond with: "I am programmed to only answer questions about Achyutam's portfolio and his work. Let me know if you would like to know about his projects, skills, or studies!"
// 3. Keep your answers brief, professional, and conversational. Fits in a small chat widget.
// 4. Do not make up facts. Only use the provided details.`;

//       const formattedContents = [
//         {
//           role: "user",
//           parts: [{ text: message }],
//         },
//       ];

//       const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: formattedContents,
//           systemInstruction: {
//             parts: [{ text: systemInstructionText }],
//           },
//           generationConfig: {
//             maxOutputTokens: 250,
//             temperature: 0.3,
//           },
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
//         if (replyText) {
//           return res.json({ success: true, reply: replyText.trim() });
//         }
//       } else {
//         const errText = await response.text();
//         console.warn(
//           `Gemini API returned status ${response.status}: ${errText}`,
//         );
//       }

//       console.warn(
//         "Gemini API call returned non-ok status or empty content. Falling back to local matcher.",
//       );
//     } catch (err) {
//       console.error("Error during Gemini API request:", err);
//     }
//   }

//   const userQuery = messages[messages.length - 1]?.content?.toLowerCase() || "";

//   if (pData.faqs && Array.isArray(pData.faqs)) {
//     const matchedFaq = pData.faqs.find(
//       (f) =>
//         userQuery.includes(f.question.toLowerCase()) ||
//         f.question.toLowerCase().includes(userQuery),
//     );
//     if (matchedFaq) {
//       return res.json({ success: true, reply: matchedFaq.answer });
//     }
//   }

//   let reply;
//   if (
//     userQuery.includes("hello") ||
//     userQuery.includes("hi") ||
//     userQuery.includes("hey") ||
//     userQuery.includes("welcome")
//   ) {
//     reply = `Hello! Welcome to ${pData.profile?.name || "Achyutam"}'s portfolio. I am his AI assistant. How can I help you today?`;
//   } else if (
//     userQuery.includes("skill") ||
//     userQuery.includes("tech") ||
//     userQuery.includes("language") ||
//     userQuery.includes("tool")
//   ) {
//     const list = (pData.skills || [])
//       .map((s) => `${s.icon || "⚡"} ${s.name} (${s.level}%)`)
//       .join(", ");
//     reply = list
//       ? `Achyutam's skills and tools include: ${list}.`
//       : "Achyutam works with React, Python, Node.js, and Data Analytics tools.";
//   } else if (
//     userQuery.includes("project") ||
//     userQuery.includes("work") ||
//     userQuery.includes("portfolio")
//   ) {
//     const list = (pData.projects || [])
//       .map((p) => `• ${p.title} (${p.description})`)
//       .join("\n");
//     reply = list
//       ? `Here are Achyutam's projects:\n${list}\n\nYou can view full details in the Projects section.`
//       : "Achyutam has built projects like AgroVision (Plant Disease Detector) and Diwali Sales Analysis.";
//   } else if (
//     userQuery.includes("education") ||
//     userQuery.includes("study") ||
//     userQuery.includes("studies") ||
//     userQuery.includes("university") ||
//     userQuery.includes("college") ||
//     userQuery.includes("gpa")
//   ) {
//     const list = (pData.education || [])
//       .map((e) => `• ${e.degree} from ${e.institution} (${e.year})`)
//       .join("\n");
//     reply = list
//       ? `Achyutam's education details:\n${list}`
//       : "Achyutam is an MCA Graduate from KIIT University.";
//   } else if (
//     userQuery.includes("contact") ||
//     userQuery.includes("email") ||
//     userQuery.includes("linkedin") ||
//     userQuery.includes("github") ||
//     userQuery.includes("reach")
//   ) {
//     reply = `You can contact Achyutam directly at ${pData.profile?.email || "akshubusiness187@gmail.com"}. You can also check his GitHub (${pData.profile?.github || "#"}) and LinkedIn profiles.`;
//   } else if (userQuery.includes("resume") || userQuery.includes("cv")) {
//     reply =
//       "You can view and download Achyutam's resume from the Hero section or the Admin panel.";
//   } else if (userQuery.includes("experience") || userQuery.includes("career")) {
//     reply = `Achyutam has ${pData.profile?.yearsExp || 1} year(s) of experience focusing on Data Analytics and Full-Stack Development.`;
//   } else if (
//     userQuery.includes("location") ||
//     userQuery.includes("live") ||
//     userQuery.includes("where")
//   ) {
//     reply = `Achyutam is based in ${pData.profile?.location || "Jharkhand, India"}.`;
//   } else if (
//     userQuery.includes("about") ||
//     userQuery.includes("who are you") ||
//     userQuery.includes("bio")
//   ) {
//     reply =
//       pData.profile?.bio ||
//       "Achyutam Sharma is a Data Analyst & Full-Stack Developer passionate about turning complex data into actionable insights.";
//   } else {
//     reply =
//       "I am programmed to only answer questions about Achyutam's portfolio and his work. Let me know if you would like to know about his projects, skills, or studies!";
//   }

//   return res.json({ success: true, reply });
// });


app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  const pData = portfolioData;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not configured",
    });
  }

  try {
    const systemInstructionText = `
You are Achyutam Sharma's AI Portfolio Assistant.

Your job is to answer questions using ONLY the portfolio information below.

Rules:
- Answer naturally and conversationally.
- Keep answers short and suitable for a chatbot widget.
- Summarize information instead of dumping raw data.
- If information is not available in the portfolio, politely say so.
- Never invent information.
- You may answer questions about skills, projects, education, experience, contact details, achievements, and technologies.

Portfolio Data:
${JSON.stringify(pData, null, 2)}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: systemInstructionText,
              },
            ],
          },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't find an answer in the portfolio.";

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chat Error:", error);

    return res.status(500).json({
      success: false,
      reply: "Sorry, I encountered an error while processing your request.",
    });
  }
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio Express Server running on port ${PORT}`);
});
