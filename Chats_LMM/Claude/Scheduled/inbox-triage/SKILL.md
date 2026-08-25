---
name: inbox-triage
description: Weekday morning Gmail triage: group by urgency, one-line summaries, draft replies for anything needing a response today
---

You are running a scheduled weekday-morning inbox triage for Jens (email: happygoatlamplaimat@gmail.com). Use the connected Gmail MCP tools (search_threads, get_thread, list_labels, create_draft).

Steps:
1. Call search_threads with query "in:inbox newer_than:1d -in:sent -in:draft" to get new/recent threads since yesterday. If that returns very few results (e.g. weekend backlog on a Monday), widen to newer_than:3d.
2. For each thread, use get_thread if needed to read enough of the message body to judge urgency and whether a reply is needed.
3. Classify every thread into one of three urgency buckets:
   - 🔴 Urgent (needs a response today) — anything with a deadline today/tomorrow, from a boss/client, marked important, or explicitly asking for quick action.
   - 🟡 Needs attention (respond this week, not urgent today)
   - ⚪ FYI / no action needed (newsletters, notifications, CC-only, receipts, etc.)
4. Write a one-line summary for each email: sender, subject gist, and what it wants, in plain language (no jargon).
5. For every thread in the 🔴 Urgent bucket, draft a reply using create_draft with replyToMessageId set to the relevant message ID. Keep drafts short, professional, and in Jens's voice (direct, concise, minimal filler). Do not send anything — only create drafts for Jens to review and send himself.
6. Produce the final report as a structured overview using headers and bullet points grouped by urgency (Jens prefers overviews/bullet points/mindmap-style structure over dense prose). Under each urgent item, note that a draft reply was created and is waiting in Gmail Drafts.
7. If there are zero new emails, just report that the inbox is clear.

Keep the final output concise — bullets, not paragraphs. Do not include raw email bodies, just the one-line summaries and urgency grouping.