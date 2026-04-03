# 🎓 Peer Doubt Solving Platform

A **StackOverflow-style Q&A platform for MANIT Bhopal students** that enables collaborative peer learning by allowing students to ask academic doubts, receive answers, and build a searchable knowledge base.

---

# 📌 Product Overview

The **Peer Doubt Solving Platform** is a web application designed specifically for the academic ecosystem of **MANIT Bhopal**.

Students can:

- Ask subject-specific doubts
- Answer questions posted by peers
- Upvote helpful answers
- Search previously solved doubts
- View top contributors through a leaderboard

The goal is to **encourage collaborative learning and reduce dependency on offline doubt sessions.**

---

# ❗ Problem Statement

Students frequently encounter conceptual doubts in subjects such as:

- Data Structures & Algorithms (DSA)
- Operating Systems
- Mathematics
- DBMS
- Computer Networks

Current solutions like:

- WhatsApp groups  
- Email threads  
- Informal study circles  

are:

- ❌ Unstructured  
- ❌ Hard to search  
- ❌ Temporary (information gets lost)

There is **no centralized platform** that:

- Organizes doubts by subject  
- Preserves solutions for future reference  
- Encourages students to help peers  
- Helps faculty identify common student struggles  

---

# 💡 Proposed Solution

A **dedicated Q&A platform** where students can:

- Ask tagged doubts
- Receive answers from peers
- Vote on helpful responses
- Build a long-term knowledge base
- Gain recognition through a leaderboard

---

# 🎯 Goals

### Primary Goals

- Increase **peer learning engagement by 40%**
- Reduce **repetitive doubts asked during faculty office hours by 30%**

---

# 🚀 Core Features (MVP)

## 🔐 User Authentication

- Register using **MANIT institutional email (`@stu.manit.ac.in`)**
- Secure login system
- Profile page with:
  - Display name
  - Department
  - Academic year
  - Profile photo (optional)

---

## ❓ Ask a Doubt

Students can post questions with:

- Rich text editor
- Code block support
- Mandatory subject tags
- Optional image attachment (max **2MB**)

Example tags:

```
DSA
OS
Maths
DBMS
Networks
Other
```

Duplicate questions will be detected using keyword matching.

---

## 💬 Answer a Doubt

Any authenticated user can:

- Post answers
- Format answers using rich text or code blocks
- Help peers resolve doubts

The **question author can mark one answer as Accepted.**

Accepted answers appear **pinned at the top**.

---

## 👍 Voting System

Users can vote on questions and answers.

- 👍 Upvote helpful responses
- 👎 Downvote (with reason prompt)
- Each user can vote **once per post**

Vote count is displayed clearly.

---

## 🔎 Search & Filters

Students can easily find doubts using:

- Subject tags
- Full-text search
- Sorting options:

```
Newest
Most Voted
Unanswered
```

---

## 🏆 Leaderboard

Top contributors are recognized through a **reputation system**.

Reputation rules:

```
+10  Accepted Answer
+2   Upvote received
-1   Downvote received
```

Leaderboard features:

- Weekly ranking
- All-time ranking
- Department filters
- Top 3 displayed on homepage

---

# ⚡ Future Features

## Phase 2

- 🔔 Notification system  
- ⭐ Bookmarks  
- 👨‍🏫 Faculty verified answers  
- 🙈 Anonymous posting  
- 📊 Faculty analytics dashboard  
- 📱 Progressive Web App (PWA)  

---

## Phase 3

- 🔐 MANIT portal SSO integration  
- 🤖 AI suggested similar questions  
- ⏰ Live doubt solving sessions  
- 🎮 Gamification (streaks, badges)

---

# 🛠️ Suggested Tech Stack

| Layer | Technology |
|------|-------------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Search | PostgreSQL Full Text Search / Elasticsearch |
| Authentication | JWT + Email OTP |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

---

# 🗂️ Project Status

```
Version: 1.0 (Draft)
Status: Under Review
Date: March 2026
Target Users: MANIT Bhopal Students
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Submit a Pull Request

---

# 📄 License

This project is currently under development and intended for **academic use within MANIT Bhopal**.
