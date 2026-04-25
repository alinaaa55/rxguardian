# RxGuardian 🛡️
### Intelligent Medication Care & Adherence Platform

RxGuardian is a comprehensive mobile application built with React Native and Expo, designed to simplify medication management through artificial intelligence. It helps users track their prescriptions, receive timely reminders, and stay safe with advanced drug-drug interaction analysis.

---

## ✨ Key Features

- **🛡️ AI Safety Guard**: Real-time drug-drug interaction checks between your current medications and new additions.
- **📸 Intelligent Scanning**: Upload or take a photo of your prescription. Our AI automatically extracts medicine names, dosages, and frequencies.
- **👵 Elderly Mode**: A specialized interface with high-contrast UI, larger fonts (1.3x multiplier), and simplified navigation for seniors.
- **🗣️ Voice Reminders**: Not just notifications—the app announces your due medications using Text-to-Speech (TTS).
- **📊 Analytics & Insights**: Track your adherence streaks and receive personalized health insights based on your dose history.
- **💬 RxGuardian AI Chat**: A dedicated assistant to answer medical queries, analyze symptoms, and suggest medicine links from PharmEasy.
- **⚠️ Side Effect Analysis**: Instantly fetch common side effects for any of your medications with a single tap.

---

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo)
- **Navigation**: Expo Router (File-based routing)
- **Styling**: Vanilla CSS with a customized design system
- **State Management**: React Context API
- **Storage**: AsyncStorage & Expo SecureStore
- **Notifications**: Expo Notifications & Background Tasks
- **AI Integration**: Backend-powered LLM analysis for prescriptions and interactions

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rxguardian.git
   cd rxguardian
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your backend URL:
   ```env
   EXPO_PUBLIC_API_URL=your_backend_url_here
   ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

---

## 📂 Project Structure

- `app/`: Expo Router application screens (Tabs, Details, Auth flow)
- `assets/`: SVGs, Images, and Icons
- `components/`: Reusable UI components
- `constants/`: Theme definitions and global constants
- `context/`: Application-wide state (Settings, Theme)
- `services/`: API integration, AI logic, and local storage handlers
- `hooks/`: Custom React hooks for auth and theme logic

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.
