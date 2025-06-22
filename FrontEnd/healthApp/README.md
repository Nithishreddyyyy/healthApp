Here is your updated `README.md` with all features included and the author credited at the bottom:

---

````markdown
# 🩺 React Native Health App (Expo)

Welcome to the **React Native Health App**, built using **Expo Router** and **React Native**. This application provides a sleek, customizable bottom tab navigation interface with features tailored for health tracking, exercise, reminders, emergency access, and useful utilities.

---

## 🚀 Getting Started

### 📦 Install Dependencies

Install all the required project dependencies:

```bash
npm install
````

### ▶️ Start the App

To start the development server and run the app:

```bash
npx expo start
```

From here, you can open the app using:

* **Expo Go App** (via QR Code)
* **Android Emulator**
* **iOS Simulator**
* **Development Build** (for native features)

---

## 📁 Project Structure

```
.
├── app/                   # Screens (index.tsx, Exercise.tsx, etc.)
├── constants/             # Constants and icon resources (e.g., icons.ts)
├── layout.tsx             # Custom Tab Bar Layout
├── README.md              # Project documentation
```

---

## 🧭 Navigation Tabs

This app uses **Expo Router** and file-based routing with a highly customized bottom tab bar. Each route corresponds to a feature screen:

| 🧭 Tab       | 🛣️ Route    | 🔍 Description                          |
| ------------ | ------------ | --------------------------------------- |
| 🏠 Home      | `/index`     | Welcome and overview screen             |
| 💪 Exercise  | `/Exercise`  | Track workouts, exercises, and activity |
| ⏰ Reminder   | `/Reminder`  | Set health-related reminders (badge UI) |
| 🧰 Utilities | `/Utilities` | Useful tools like BMI calculator, etc.  |
| 🚨 Emergency | `/Emergency` | Access help or emergency resources      |

---

## ✨ Custom Tab Bar Highlights

* 🖼️ **Dynamic Icons** – Highlighted on focus
* 🔴 **Badge Support** – Shown on Reminder tab
* 🌌 **Dark Theme** – Consistent dark UI with shadows
* 📱 **Safe Area Compatible** – Supports iOS notch/padding
* 🛠️ **Configurable per tab** – With `unmountOnBlur` and `lazy` options

---

## 🧼 Reset Project

To remove the starter content and begin with a fresh blank app:

```bash
npm run reset-project
```

This command will:

* Move the starter files to `app-example`
* Create a fresh empty directory in `app/`

---

## 📚 Useful Resources

* [📘 Expo Documentation](https://docs.expo.dev/)
* [🚀 Expo Router Guide](https://expo.github.io/router/docs)
* [📱 Learn React Native](https://reactnative.dev/docs/getting-started)
* [💬 Join Expo on Discord](https://discord.gg/expo)
* [🌐 Expo GitHub](https://github.com/expo/expo)

---

## 🛠️ Dev Scripts

| Script                  | Description                        |
| ----------------------- | ---------------------------------- |
| `npm install`           | Install dependencies               |
| `npx expo start`        | Launch development server          |
| `npm run reset-project` | Wipe starter files and start fresh |

---

## 👨‍💻 Author

**Nithish Reddy**
B.E. Information Science
Ramaiah Institute of Technology

---
