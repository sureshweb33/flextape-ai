# FlexTape AI — Deployment Notes

## GitHub
Upload the contents of this project to a new GitHub repository.
Do not upload `.env` files or API keys.

## Netlify
Connect the GitHub repository to Netlify. For a Next.js project, let Netlify auto-detect the framework when possible. Use the project's existing build configuration rather than forcing a `.next` publish directory unless Netlify specifically requires it.

## Environment variables
When real AI APIs are enabled later, add their keys in Netlify's Environment Variables settings. Never put secret keys in frontend code.

## Demo mode
The prototype is intended to demonstrate the customer flow first: upload flex image → analyze → choose design → generate print-ready output → demo payment → order/print workflow.
