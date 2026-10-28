# Job Ticket: quotes & invoices for the trades

A single-file web app for plumbers, electricians, handymen, cleaners, landscapers, painters, and other small service businesses. They fill in a job and get a clean, professional quote or invoice they can print, save as a PDF, or paste into a text or email.

**Files**
- `index.html` is the full app. Host this one. It has **Download PDF** (a share sheet on phones) and **Print** buttons. Printed and downloaded tickets never show the Draft, Sent or Overdue stamp; only PAID appears.
- `lib/html2pdf.bundle.min.js` makes the PDFs (html2pdf.js 0.10.1, MIT license).
- `app.html` is the same app formatted for the Claude artifact preview.

Nothing else is needed: no server and no database. Each customer's data stays in their own browser.

## What it does
The app has four tabs:
- **Ticket:** write a quote or invoice. Pick from about 70 common jobs across 10 trades (search by name, or browse your trade). Size-based jobs ask one question, like square feet or number of rooms, and scale the materials and hours. Jobs that aren't listed get a quick estimate from just the hours and materials cost. Everything is priced from your own rates. Each line reads "qty × price = amount". The ticket preview updates as you type. On phones, a bar at the bottom shows the total and switches between editing and preview.
- **All tickets:** shows how much you're owed, what's overdue, open quotes and money collected, with filters. Overdue invoices are flagged automatically.
- **My rates:** the price book. Hourly rate, markup on parts, service call fee, disposal fee, minimum job charge and sales tax, each with a plain explanation and a live worked example. Saved parts and services fill in automatically on tickets.
- **Business:** name, contact, license, logo and default payment instructions.

New users get a 30-second setup (trade, hourly rate, business name) that fills in typical rates for their trade.

## Free plan and upgrades
- Everyone gets **3 free invoices**. Quotes are always free.
- On the 4th invoice an upgrade screen appears with your price, a **Buy now** button (your payment link) and a box for an unlock code.
- Unlocking gives unlimited invoices and removes "Made with Job Ticket" from tickets.
- To stop one invoice being reused for new jobs on the free plan: once an invoice is copied or printed, its customer can't be changed (prices and notes still can), and once it's marked Paid the whole invoice is locked. "Repeat this job" makes a new invoice from it. Upgraded users can edit everything.

### Before you launch, edit these lines near the top of the script in `index.html` (and `app.html`)
```js
var FREE_INVOICES = 3;
var PRICE = "$29";
var PRICE_NOTE = "One-time founding price. Pay once, use it for good.";
var PAY_URL = "";   // your Stripe Payment Link, e.g. https://buy.stripe.com/...
var CONTACT = "";   // where buyers get their unlock code, e.g. a phone number or email
```

### Selling a code
1. Make a free Stripe account and create a **Payment Link** for your price. Under "After payment", show a message like: "Thanks! Your unlock code will be sent to your email within a few hours."
2. Paste the link into `PAY_URL`.
3. When a payment comes in, email or text the buyer one code from `private/unlock-codes.txt` and cross it off. To make more codes, run `node tools/make-codes.js 20`.

To test the free plan again yourself, enter the owner test code at the top of `private/unlock-codes.txt`. It puts you back to 3 unused free invoices. Make another with `node tools/make-codes.js --reset`.

`private/` is in `.gitignore`, so your codes never go to GitHub.

### Limits to know about
This app has no server, so the free limit and the codes are checked in the browser. Someone technical could get around them, and a person could keep editing an old invoice instead of making a new one. That's fine for an early launch, since the people who'd bother aren't your customers anyway. If the app takes off, the next step is real accounts with a server-side license check. That also enables syncing across devices.

## Putting it online (GitHub Pages)
This repository is set up to serve `index.html`. In GitHub, go to **Settings → Pages**, set **Source: Deploy from a branch**, **Branch: main / (root)**, then **Save**. After a minute or two the app is live at `https://jesse-4.github.io/job-ticket/`.

## Who pays for this, and how to charge
Most trades people under ~5 employees write invoices on paper pads or in Word. The big tools (QuickBooks, Jobber, Housecall Pro) cost $30–$200/month and are more than they need.

Three realistic ways to make money with it:

1. **Set it up for local businesses ($50–$150 one-time).** Put a copy online with their name, logo, rates, and tax already filled in, and send them their own link. Find customers on Facebook neighborhood groups, Nextdoor, Craigslist services, or by asking the trades people you already know. This is the fastest way to get your first dollar.
2. **Sell it as a digital download ($9–$19).** List it on Gumroad, Etsy ("invoice template for contractors" is a popular search), or Payhip as "a printable invoice app that works offline."
3. **Subscription ($5–$9/month).** Host it at your own domain. Offer the free version with the "Made with Job Ticket" footer, and charge for removing it plus extras like cloud backup or emailing invoices. Recurring billing needs a payment link (Stripe Payment Links or Lemon Squeezy) and, for the paid extras, a small backend. This is the most work and the most long-term income.

## Putting it online for free (about 5 minutes)
- **Netlify Drop:** go to app.netlify.com/drop and drag the `job-ticket` folder in. You get a public link right away.
- **GitHub Pages:** push this folder to a repo, then turn on Pages in Settings → Pages.
- A custom domain (about $12/year) makes it look like a real product.

## Making a personalized copy for a client
Open `index.html` and look for the line that starts `var biz = load(KEY_BIZ, null) || {`. Replace the example business name, phone, email, address, and license with your client's details, then upload their copy.

## Good next features (if people ask for them)
- Remove the footer behind a license key
- Send invoices by email or SMS directly from the app (needs a backend service)
- A "Pay now" button that links to the business's Stripe/Square/PayPal page
- Spanish-language version (big underserved market in the trades)
