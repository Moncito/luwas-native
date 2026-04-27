# Luwas Mobile

Luwas Mobile is a cross-platform travel application built with Expo and React Native. It provides users with seamless travel planning, booking, and itinerary management, featuring modern UI components, authentication, and real-time data integration.

## Features

- Cross-platform support for iOS, Android, and Web via Expo
- Authentication with Google and Facebook OAuth
- Destination browsing, booking, and itinerary management
- In-app chat support for customer service
- Promotions and travel offers
- Integrated weather insights and traveler reviews
- Modular UI with reusable components and Lottie animations
- Firebase integration for real-time data and authentication

## Getting Started

### Prerequisites

- Node.js
- Expo CLI
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Moncito/luwas-native.git
   cd luwas-native/luwas-native
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and provide your API keys (Google, Facebook, Firebase, etc.).

4. Start the development server:

   ```bash
   npm start
   ```

5. Open the app using Expo Go or an emulator/simulator as preferred.

## Project Structure

- `app/` – Main application routes and screens (file-based routing)
- `components/` – Reusable UI components
- `constants/` – Theme and global constants
- `hooks/` – Custom React hooks for data fetching and logic
- `assets/` – Images and Lottie animations
- `src/lib/` – Firebase and other library integrations

## Scripts

- `npm start` – Start Expo development server
- `npm run android` – Run on Android emulator/device
- `npm run ios` – Run on iOS simulator/device
- `npm run web` – Run on web
- `npm run lint` – Lint the codebase
- `npm run reset-project` – Reset to a fresh project state

## Configuration

- Google/Facebook OAuth: Configure your OAuth credentials in the `.env` file
- Firebase: Update `src/lib/firebase.ts` with your Firebase configuration

## Contributing

Contributions are welcome. Please open issues and pull requests for improvements or bug fixes and Additional Information.

## License

This project is licensed under the MIT License.
