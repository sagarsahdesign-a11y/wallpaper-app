# 🎨 WallpaperApp — Setup Guide

A beautiful wallpaper app built with **React Native (Expo) + Firebase**

---

## 📁 Project Structure
```
wallpaper-app/
├── App.js                  ← Main app entry point & navigation
├── firebase.js             ← Firebase config (YOU MUST EDIT THIS)
├── package.json            ← All dependencies
├── screens/
│   ├── HomeScreen.js       ← Browse wallpapers with category filter
│   ├── DetailScreen.js     ← Full-screen view + download options
│   ├── SearchScreen.js     ← Search by name, category, tags
│   ├── FavoritesScreen.js  ← Saved favorites
│   ├── UploadScreen.js     ← Admin: upload new wallpapers
│   └── LoginScreen.js      ← Admin login
```

---

## 🚀 Step-by-Step Setup

### STEP 1 — Install Tools (do this once)

1. Install **Node.js** → https://nodejs.org (download LTS version)
2. Install **Expo CLI** — open Terminal/Command Prompt and run:
   ```
   npm install -g expo-cli
   ```
3. Install **Expo Go** app on your phone (App Store / Play Store)

---

### STEP 2 — Set Up Firebase (FREE)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it "WallpaperApp" → click Continue
3. Once created, click **"</> Web"** to add a web app
4. Copy the firebaseConfig values shown

5. Open **`firebase.js`** and paste YOUR values:
   ```js
   const firebaseConfig = {
     apiKey: "paste-your-value-here",
     authDomain: "paste-your-value-here",
     projectId: "paste-your-value-here",
     storageBucket: "paste-your-value-here",
     messagingSenderId: "paste-your-value-here",
     appId: "paste-your-value-here",
   };
   ```

6. In Firebase Console → **Authentication** → Get Started → Enable **Email/Password**

7. In Firebase Console → **Firestore Database** → Create database → Start in test mode

8. In Firebase Console → **Storage** → Get Started → Start in test mode

---

### STEP 3 — Create Your Admin Account

1. In Firebase Console → Authentication → Users → **Add user**
2. Enter your email & password
3. Open **`App.js`** and change this line to your email:
   ```js
   const ADMIN_EMAIL = "your@email.com";  // ← Change this!
   ```

---

### STEP 4 — Install & Run the App

Open your Terminal in the project folder and run:

```bash
# Install all packages
npm install

# Start the app
npx expo start
```

Then:
- **On your phone**: Scan the QR code with the Expo Go app
- **On Android emulator**: Press `a`
- **On iOS simulator**: Press `i`
- **In web browser**: Press `w`

---

## 🔧 Firebase Security Rules (Important for Production!)

### Firestore Rules (Firebase Console → Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read wallpapers
    match /wallpapers/{document} {
      allow read: if true;
      // Only logged-in admin can write
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules (Firebase Console → Storage → Rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /wallpapers/{allPaths=**} {
      // Anyone can download
      allow read: if true;
      // Only logged-in users can upload
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| 🏠 Home | Browse wallpapers in a beautiful 2-column grid |
| 🏷️ Categories | Filter by Phone, Desktop, 4K, Nature, Dark, etc. |
| 🔍 Search | Find wallpapers by name, category or tags |
| ⬇️ Download | Save wallpapers for Phone, Laptop, Desktop, or Original |
| ❤️ Favorites | Save your favorite wallpapers |
| 🔐 Admin Upload | Login to upload your own wallpapers |
| 📸 Image Picker | Pick from gallery or take a photo |
| 🔥 Real-time | New wallpapers appear instantly without refresh |

---

## 🎨 Customization Tips

- **Change app name**: Edit the `name` in `app.json`
- **Change colors**: Search for `#6C63FF` (purple) and replace with your brand color
- **Add more categories**: Find `CATEGORIES` array in HomeScreen.js and add more
- **App icon**: Replace `assets/icon.png` with your logo (1024×1024px)

---

## 🆘 Common Issues

**"Module not found" error** → Run `npm install` again

**Firebase permission denied** → Make sure Firestore and Storage are in test mode

**Images not loading** → Check that your Firebase Storage bucket URL is correct

**Admin tab not showing** → Make sure you logged in AND `ADMIN_EMAIL` in App.js matches your Firebase account email

---

## 📦 Build for App Stores (when ready)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android (APK)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios
```

---

Happy building! 🚀 If something doesn't work, check the Expo docs at **https://docs.expo.dev**
