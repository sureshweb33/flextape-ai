# FlexTape AI - Custom Decorative Tape Designer

**Mesocare Holistic Pvt Ltd**

AI-powered custom adhesive tape design & ordering prototype.

## Features
- Mobile-first customer flow
- Image upload + real color analysis
- 6 AI design suggestions with matching score
- Design preview
- Demo payment system
- Print-ready A4 PDF generation
- Admin dashboard
- PWA support (install on mobile)

---

## Local Development

```bash
npm install
npm run dev
```

Open: http://localhost:3000

---

## Deploy on Netlify (Recommended)

### Method 1: Drag & Drop (Easiest)

1. Pehle local pe build lo:
```bash
npm install
npm run build
```

2. Netlify pe jaao → https://app.netlify.com
3. **Sites** → **Add new site** → **Deploy manually**
4. `.next` folder ko zip karke drag & drop karo  
   (ya pure project ko GitHub pe daal ke connect karo – better method)

### Method 2: GitHub + Netlify (Best)

1. Project ko GitHub pe upload karo
2. Netlify pe **Add new site** → **Import an existing project**
3. GitHub repo select karo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. **Deploy** click karo

Netlify automatically Next.js ko detect kar lega (`@netlify/plugin-nextjs` already configured).

### After Deploy
- Site live ho jayegi (random URL milega)
- Custom domain bhi add kar sakte ho
- Mobile pe Chrome se **Add to Home Screen** karke app ki tarah use kar sakte ho

---

## Important Notes

- **Demo Payment** only – no real money
- Print PDF download hota hai (A4 ready)
- Color analysis local hai (API key ki zaroorat nahi)
- Baad mein Grok/OpenAI, Razorpay, Industrial printer easily add ho sakte hain

---

## Folder Structure

```
src/
├── app/           → Pages + API routes
├── services/      → AI, Payment, Printer, Design Engine
├── lib/           → Utils + Prisma
public/
├── manifest.json  → PWA support
```

Built as a real business prototype.
