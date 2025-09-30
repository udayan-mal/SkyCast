# SkyCast

SkyCast is a modern weather intelligence dashboard that delivers current conditions, a 7-day outlook, and helpful travel insights for any city in the world. It pairs a sleek, responsive UI with reliable weather providers so your forecasts stay accurate even when one API is unavailable.

## ✨ Features

- **Current weather snapshot** with temperature, humidity, wind, visibility, and sunrise/sunset times.
- **7-day forecast carousel** powered by OpenWeather and automatically backed up by Open-Meteo if the primary API fails.
- **Search history & favorites** so you can quickly revisit recent locations or pin your go-to cities.
- **Theme, unit, and layout preferences** persisted locally for a personalized experience.
- **Graceful loading, error, and geolocation states** to guide users through every scenario.

## 🧰 Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) on top of [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for styled, accessible components
- [TanStack Query](https://tanstack.com/query/latest) for data fetching and caching
- Local storage-backed preferences while we finish wiring the backend
- Node.js + Express scaffold in `server/` for the upcoming JWT authentication service

## 🚀 Getting Started

### Prerequisites

- Node.js **18 LTS** or later
- npm **9+** (bundled with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/udayan-mal/SkyCast.git

# Move into the project directory
cd SkyCast

# Install dependencies
npm install
```

### Environment Variables

Create a copy of `.env.example` and provide your own API keys:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
| --- | --- |
| `VITE_OPENWEATHER_API_KEY` | Your OpenWeather API key. Create one at [openweathermap.org](https://openweathermap.org/api). |

An optional `VITE_OPEN_METEO_API_URL` override is supported if you self-host the fallback service.

### Development

```bash
npm run dev
```

The development server runs on http://localhost:5173 by default and supports hot module reloading.

### Linting & Quality Checks

```bash
npm run lint
```

### Production Build & Preview

```bash
npm run build
npm run preview
```

The production output lives in the `dist/` directory.

## 📁 Project Structure

```
SkyCast/
├── public/              # Static assets (favicon, robots, placeholders)
├── src/
│   ├── components/      # UI building blocks and layout pieces
│   ├── hooks/           # Custom hooks for auth, weather, search, and theme
│   ├── pages/           # Route-level views
│   ├── integrations/    # Future home for external SDKs and API clients
│   └── lib/             # API utilities & helper functions
├── server/              # Node/Express scaffold for the JWT auth API
├── dist/                # Production build output (generated)
└── README.md
```

## 🌦 Data Providers

- [OpenWeather](https://openweathermap.org/) for primary current conditions and forecast data
- [Open-Meteo](https://open-meteo.com/) as the automatic 7-day fallback provider

## 🛣 Roadmap

- Add secure JWT-based authentication backed by the `server/` service
- Sync favorites and search history across devices
- Extend travel guidance with severe weather alerts

## 🤝 Contributing

Issues and pull requests are welcome! If you have ideas for features or improvements, open an issue to discuss them before submitting substantial changes.

## 📄 License

No license has been specified yet. Add a `LICENSE` file before distributing or making the project public.
