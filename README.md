# TenderFlow - AI-Powered Bidding & Subcontractor Hub

A premium SaaS landing page and dashboard for Italian construction procurement (gare d'appalto). Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and AI integration.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000?style=for-the-badge)](https://ui.shadcn.com)

## ✨ Features

### Landing Page
- **Aceternity-inspired Hero** with animated spotlight effects and grid pattern
- **3D Marquee** showcasing construction imagery with parallax effects
- **Trust Banner** with investment messaging and visual elements
- **Premium Pricing Cards** with glowing hover effects and interactive animations
- **Responsive Design** optimized for all devices

### Dashboard
- **AI Win Probability Predictor** - Analyze bid success with explainable AI
- **Smart Price Suggestions** - AI-powered pricing recommendations with confidence scores
- **Real-time Activity Feed** - Live updates on tenders, bids, and alerts
- **Analytics Dashboard** - Win/loss trends, regional distribution, category performance
- **Risk Analysis** - Automated compliance checking (DURC, SOA, ANAC)
- **Interactive BOQ Builder** with AI price assistance
- **Subcontractor Management** - Bidding portal and verification
- **Command Palette** - Quick navigation and actions
- **AI Copilot** - Chat interface for tender assistance

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4.0 + Custom animations
- **Components:** shadcn/ui + Custom premium components
- **State Management:** Zustand
- **Animations:** Framer Motion + CSS animations
- **Charts:** Recharts
- **AI Integration:** Mistral AI API
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Mistral AI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tenderflow.git
cd tenderflow

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your MISTRAL_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.
Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the full dashboard experience.

### Environment Variables

Create a `.env.local` file:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard application
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── sections/          # Landing page sections
│   ├── dashboard/         # Dashboard components
│   └── ...
├── lib/
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── ai-service.ts      # AI integration
│   └── ...
├── app/api/v1/            # API routes
│   ├── ai/                # AI endpoints
│   ├── pricing/           # Pricing engine
│   └── ...
├── public/                # Static assets
└── ...
```

## 🎨 Premium UI Features

- **Glowing Effects** - Mouse-following gradient borders
- **Spotlight Animation** - Aceternity-style hero lighting
- **Premium Cards** - Glass morphism with ambient glows
- **Micro-interactions** - Smooth hover states and transitions
- **Custom Scrollbars** - Styled scrollbars throughout
- **Animated Charts** - Real-time data visualization
- **Responsive Grid** - Adaptive layouts for all screens

## 🤖 AI Features

The platform integrates Mistral AI for:
- **Price Prediction** - Smart pricing suggestions with market analysis
- **Win Probability** - Bid success prediction with factor breakdown
- **Risk Analysis** - Automated compliance and anomaly detection
- **Document Intelligence** - AI-powered tender parsing

## 📄 License

MIT License - feel free to use this project for learning or building your own applications.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com) components
- Inspired by [Aceternity UI](https://ui.aceternity.com) design patterns
- Icons by [Lucide](https://lucide.dev)
- AI powered by [Mistral AI](https://mistral.ai)