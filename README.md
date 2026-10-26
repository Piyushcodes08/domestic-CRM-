<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/26c69a87-d8f1-431d-8831-133f06f34b89

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Agent Accounts

Sign in with the admin account, then open **System Admin & Audit** to create sales-agent accounts. Firebase Authentication stores the credentials; the Firestore `users/{uid}` document stores the agent profile, email, and Firebase UID. Passwords are never written to Firestore and cannot be retrieved from Firebase Authentication.

The included `firestore.rules` allows the configured admin email (`vahlaydigital@gmail.com`) to create and list agent profiles, while agents can read only their own profile. Before deploying these rules, merge them with any existing rules for other Firestore collections. Deploy the merged rules with `firebase deploy --project domestic-crm-2d591 --only firestore:rules`.
