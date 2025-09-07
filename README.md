# Epic Games Free Weekly API

A simple Next.js API that scrapes free games from Epic Games Store and provides real-time data about weekly free games and upcoming releases.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/epic-games-free-weekly-api)

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The project is pre-configured for Vercel with optimized Puppeteer for serverless environments.

## 📡 API Endpoint

### `GET /api/epic/weekly-free`

Returns current free games and upcoming free games from Epic Games Store.

**Response:**
```json
{
  "success": true,
  "count": 4,
  "lastUpdated": "2025-01-07T10:30:00.000Z",
  "data": [
    {
      "title": "Monument Valley",
      "availability": "Free Now",
      "link": "https://store.epicgames.com/en-US/p/monument-valley",
      "image": "https://cdn1.epicgames.com/...",
      "isCurrentlyFree": true,
      "isUpcomingFree": false,
      "freeUntil": "Free Now - Sep 12 at 01:00 AM",
      "gameType": "weekly-free"
    }
  ]
}
```

## 🎮 Features

- **Real-time scraping** of Epic Games Store
- **Weekly free games** detection
- **Upcoming free games** tracking
- **High-quality images** and game links
- **Responsive web interface**
- **No authentication required**

## 💻 Usage Examples

### JavaScript
```javascript
const response = await fetch('/api/epic/weekly-free');
const data = await response.json();

if (data.success) {
  data.data.forEach(game => {
    console.log(`${game.title} - ${game.availability}`);
  });
}
```

### Python
```python
import requests

response = requests.get('http://localhost:3000/api/epic/weekly-free')
data = response.json()

if data['success']:
    for game in data['data']:
        print(f"{game['title']} - {game['availability']}")
```

## 🛠️ Built With

- **Next.js** - React framework
- **Puppeteer** - Web scraping
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## 📝 License

MIT License - feel free to use and modify as needed.

---

**Note:** This tool is for educational purposes. Please respect Epic Games' terms of service.