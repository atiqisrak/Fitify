<div align="center">
<img width="1200" height="475" alt="Fitify Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Fitify - Try Before You Buy

**Stop wondering. Start seeing.**

Fitify is your personal AI-powered virtual fitting room that shows you exactly how any outfit will look on you before you make a purchase. No more guessing, no more returns, no more disappointment.

## ✨ What Can You Do?

### 📸 Create Your Digital Model

Upload a single photo of yourself, and our AI instantly creates a realistic digital model that captures your unique features and body type. It works with both full-body and face-only photos, though full-body gives the best results.

### 👗 Virtual Try-On

See yourself wearing any outfit from our wardrobe collection. From casual wear to formal attire, dresses to traditional sarees - try them all with a single click. Watch your digital model transform instantly.

### 🎨 Style Experimentation

Mix and match different outfits without any commitment. Experiment with styles you've never tried before, explore new fashion trends, or find the perfect look for your next event.

### 📱 Easy & Instant

No complicated setup. No app downloads. Just upload your photo and start trying on outfits immediately. The entire experience is designed to be simple and intuitive.

## 🎯 Perfect For

- **Online Shoppers** - Make confident purchase decisions by seeing how clothes actually look on you
- **Fashion Enthusiasts** - Experiment with different styles and discover your perfect look
- **Event Planning** - Find the ideal outfit for weddings, parties, or professional events
- **Anyone Curious** - Simply explore how different outfits would look on you, risk-free

## 🌟 Why Fitify?

**Save Time & Money** - No more buying clothes that don't look good when they arrive  
**Boost Confidence** - Know exactly what you're getting before you commit  
**Reduce Returns** - Lower environmental impact by making better first-time choices  
**Have Fun** - Enjoy the creative process of finding your style

## 🚀 Getting Started

Visit our app and upload a clear photo of yourself. Within seconds, you'll have your personal digital model ready to try on any outfit in our collection. It's that simple.

### For Developers

#### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager

#### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Fitify
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   Copy the example environment file:

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your credentials:

   ```env
   VITE_ENGINE_URL=http://localhost:3001/api
   VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
   ```

4. **Set up Google OAuth**

   To enable Google Sign-In:

   a. Go to [Google Cloud Console](https://console.cloud.google.com/)

   b. Create a new project or select an existing one

   c. Enable the Google+ API

   d. Go to "Credentials" → "Create Credentials" → "OAuth client ID"

   e. Select "Web application" as the application type

   f. Add authorized JavaScript origins:

   - `http://localhost:4323` (for development)
   - Your production domain

   g. Add authorized redirect URIs:

   - `http://localhost:4323` (for development)
   - Your production domain

   h. Copy the Client ID and paste it into your `.env` file as `VITE_GOOGLE_CLIENT_ID`

5. **Run the development server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:4323`

#### Features

- **Google OAuth Integration** - Users can sign in with their Google account for a seamless experience
- **Traditional Registration** - Email/phone registration option available
- **AI-Powered Virtual Try-On** - Powered by Google's Gemini AI
- **Coin System** - Manage credits for AI transformations
- **Image Gallery** - Save and view all your virtual try-on results

---

**View in AI Studio:** https://ai.studio/apps/drive/1siOUL84nIdvUdPLhRd6w247ts96TrVBP

_Fitify - Where Fashion Meets Future_
