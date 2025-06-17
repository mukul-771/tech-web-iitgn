# Step-by-Step Deployment Guide

Follow these steps in order to deploy your application.

---

## Part 1: Firebase Setup (for File Storage)

### 1. Create a Firebase Project
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click **"Add project"**.
- Give your project a name (e.g., "tech-website-prod") and follow the on-screen instructions.

### 2. Enable Cloud Storage
- In your new Firebase project, go to the **Storage** section from the left-hand menu.
- Click **"Get started"**.
- Choose **"Start in production mode"** and click **"Next"**.
- Select a Cloud Storage location (choose one close to your users) and click **"Done"**.

### 3. Get Your Firebase Web App Configuration
- In the Firebase console, click the gear icon ⚙️ next to "Project Overview" and select **"Project settings"**.
- In the "Your apps" section, click the web icon (`</>`).
- Give the app a nickname (e.g., "Tech Website Web") and click **"Register app"**.
- You will see a `firebaseConfig` object. Copy these keys and paste them into your `.env.local` file.
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

### 4. Generate a Service Account Key
- In your Firebase **"Project settings"**, go to the **"Service accounts"** tab.
- Click **"Generate new private key"**. A JSON file will be downloaded.
- Open the downloaded JSON file, copy the entire content, and paste it as a single line into your `.env.local` file for the `FIREBASE_SERVICE_ACCOUNT_KEY` variable.

### 5. Configure Storage Rules
- Go to the **Storage** section in the Firebase console.
- Click on the **"Rules"** tab.
- Replace the existing rules with the following and click **"Publish"**:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Or more specific admin rules
    }
  }
}
```

---

## Part 2: Firebase Authentication Setup

### 1. Enable Firebase Authentication
- In your Firebase project, go to the **Authentication** section from the left-hand menu.
- Click **"Get started"**.
- Under the **"Sign-in method"** tab, click on **"Google"** and enable it.
- Provide a project support email and click **"Save"**.

### 2. Add Authorized Domains
- Still in the **Authentication** section, go to the **"Settings"** tab.
- Under **"Authorized domains"**, click **"Add domain"** and add the domain you will be using for your Vercel deployment (e.g., `your-project-name.vercel.app`). You will get this domain after your first deployment. You should also add `localhost` for local testing.

---

## Part 3: Vercel Deployment (for Hosting)

### 1. Push Your Code to GitHub
- Make sure all your changes, including the `vercel.json`, `.github/workflows/deploy.yml`, and your filled-in `.env.local` (but make sure `.env.local` is in your `.gitignore` file and not committed!), are saved.
- Push your project to a GitHub repository.

### 2. Import Project to Vercel
- Go to your [Vercel Dashboard](https://vercel.com/dashboard).
- Click **"Add New... -> Project"**.
- Select your GitHub repository.
- Vercel will automatically detect that it's a Next.js project.

### 3. Configure Environment Variables in Vercel
- In the "Configure Project" screen, expand the **"Environment Variables"** section.
- Add all the variables from your local `.env.local` file. This includes all the `NEXT_PUBLIC_FIREBASE_*` keys, `FIREBASE_SERVICE_ACCOUNT_KEY`, and `NEXTAUTH_SECRET`.
- For `NEXTAUTH_URL`, use the domain Vercel will assign to your project (e.g., `https://your-project-name.vercel.app`).
- Click **"Deploy"**.

### 4. Run the File Migration
- Now that your local environment is configured with the correct Firebase keys, you can migrate your existing files.
- Run this command in your local terminal:
```bash
node scripts/migrate-to-firebase.js
```

You are now fully deployed!