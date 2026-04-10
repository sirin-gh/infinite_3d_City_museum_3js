# 🏙️ The Infinite 3D City

A personal project exploring how interactive 3D experiences. The goal was to build something that felt like a **living environment**  not just a rendered scene, but a city that generates itself, reacts to input, and stays in sync across users in real time.

## What it actually does

- **The world keeps going.** Roads and buildings generate procedurally as you move. There's no edge to the city at least not one you'll find by walking.
- **It's alive.** Birds arc overhead, cats in parks. 
- **You can break things.** Double-click anywhere to flip between first-person mode and a floating god-view. From the control panel, you can spawn birds, repaint every bench, or check what the weather's doing in Tunis right now.
- **It's shared.** Firebase keeps everything in sync. Delete a bird in the dashboard and it's gone from the world for everyone watching.

## The stack

- **Three.js** :handles the actual 3D world: rendering, lighting, fog, the whole thing
- **Angular + RxJS** :the UI layer and state management, kept deliberately separate from the 3D logic
- **Firebase**: real-time database and hosting; makes the sync feel effortless
- **OpenWeather API**: live weather pulled from the country you're, projected into the 3D sky

## Run it locally

1. Clone the repo and run npm install
2. Set up your Firebase project and copy your config into src/app/app.config.ts
3. Run ng serve and open localhost:4200

Then **double-click** anywhere in the city to toggle between first-person and god-mode.

## Firebase setup

The credentials are not included for obvious reasons. To run this yourself, create a project on [console.firebase.google.com](https://console.firebase.google.com), enable Firestore, then replace the placeholders in `app.config.ts`:

```ts
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000",
  measurementId: "G-XXXXXXXXXX"
};
```

> Your Firebase config is safe to expose in client-side code as long as you set proper Firestore security rules. Don't skip that part.

## Why I made this

I'm a software engineering student with a genuine interest in how the web can go beyond flat interfaces. This project was a way to apply real architectural discipline keeping the rendering engine completely decoupled from the Angular layer while building something that's actually fun to explore. It's the kind of project you keep adding to because you're curious what happens next.

---
