import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Gamepad2, Calendar, DollarSign, Users, Zap } from 'lucide-react';

interface FreeGame {
  title: string;
  originalPrice?: string;
  discount?: string;
  availability: string;
  link: string;
  image: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  freeUntil?: string;
  isCurrentlyFree: boolean;
  isUpcomingFree: boolean;
  gameType: 'weekly-free' | 'coming-soon';
}

interface ApiResponse {
  success: boolean;
  count: number;
  lastUpdated: string;
  data: FreeGame[];
  error?: string;
  message?: string;
}

export default function Home() {
  const [games, setGames] = useState<FreeGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchFreeGames = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/epic/weekly-free');
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setGames(data.data);
        setLastUpdated(data.lastUpdated);
      } else {
        setError(data.message || 'Failed to fetch free games');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreeGames();
  }, []);

  const weeklyFreeGames = games.filter(game => game.gameType === 'weekly-free');
  const comingSoonGames = games.filter(game => game.gameType === 'coming-soon');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'https://your-domain.com';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Head>
        <title>Epic Games Free Weekly API</title>
        <meta name="description" content="Real-time API for Epic Games Store free weekly games and upcoming releases" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">
              Epic Games Free Weekly API
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Real-time scraping of Epic Games Store free weekly games and upcoming releases. 
            Get the latest free games data with a simple API call.
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={fetchFreeGames}
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://store.epicgames.com/en-US/free-games', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Epic Games Store
            </Button>
          </div>

          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{games.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Free</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{weeklyFreeGames.length}</div>
              <p className="text-xs text-muted-foreground">
                Available now
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{comingSoonGames.length}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming releases
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Status</CardTitle>
              <div className={`h-4 w-4 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{error ? 'Error' : 'Online'}</div>
              <p className="text-xs text-muted-foreground">
                {error ? 'Check connection' : 'All systems go'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8" variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentation">📚 Documentation</TabsTrigger>
            <TabsTrigger value="examples">💻 Code Examples</TabsTrigger>
            <TabsTrigger value="live-data">🎮 Live Data</TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  API Overview
                </CardTitle>
                <CardDescription>
                  Everything you need to know about the Epic Games Free Weekly API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">What is this API?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    This API provides real-time data about free games available on the Epic Games Store. 
                    It automatically scrapes the official Epic Games Store free games page and returns 
                    structured JSON data about weekly free games and upcoming free releases. Perfect for 
                    building gaming apps, Discord bots, or any application that needs up-to-date free game information.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Real-time Data</h4>
                        <p className="text-sm text-gray-600">Fresh data every time you call the API</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Weekly Updates</h4>
                        <p className="text-sm text-gray-600">Automatic detection of new weekly free games</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Gamepad2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">High-Quality Images</h4>
                        <p className="text-sm text-gray-600">Direct links to Epic Games CDN images</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Developer Friendly</h4>
                        <p className="text-sm text-gray-600">Simple JSON response, no authentication required</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">API Endpoint</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-green-400">GET</code>
                      <code className="text-blue-400">/api/epic/weekly-free</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('GET /api/epic/weekly-free')}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Response Format</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
{`{
  "success": true,
  "count": 4,
  "lastUpdated": "2025-01-07T10:30:00.000Z",
  "data": [
    {
      "title": "Monument Valley",
      "availability": "Free Now",
      "link": "https://store.epicgames.com/en-US/p/monument-valley",
      "image": "https://cdn1.epicgames.com/offer/...",
      "description": "Currently free on Epic Games Store",
      "isCurrentlyFree": true,
      "isUpcomingFree": false,
      "freeUntil": "Free Now - Sep 12 at 01:00 AM",
      "gameType": "weekly-free"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Learn how to integrate the Epic Games Free Weekly API into your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="php">PHP</TabsTrigger>
                  </TabsList>

                  <TabsContent value="javascript" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">JavaScript / Node.js</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Using Fetch API</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`fetch('${getBaseUrl()}/api/epic/weekly-free')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Free games:', data.data);
      data.data.forEach(game => {
        console.log(\`\${game.title} - \${game.availability}\`);
      });
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="text-sm overflow-x-auto">
{`fetch('${getBaseUrl()}/api/epic/weekly-free')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Free games:', data.data);
      data.data.forEach(game => {
        console.log(\`\${game.title} - \${game.availability}\`);
      });
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">React Hook Example</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Custom React Hook</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`import { useState, useEffect } from 'react';

function useEpicFreeGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('${getBaseUrl()}/api/epic/weekly-free');
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return { games, loading, error, refetch: fetchGames };
}

export default useEpicFreeGames;`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="text-sm overflow-x-auto">
{`import { useState, useEffect } from 'react';

function useEpicFreeGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/epic/weekly-free');
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return { games, loading, error, refetch: fetchGames };
}

export default useEpicFreeGames;`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="python" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Python with requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Basic Python Example</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`import requests
import json

def get_epic_free_games():
    try:
        response = requests.get('https://your-domain.com/api/epic/weekly-free')
        data = response.json()
        
        if data['success']:
            print(f"Found {data['count']} free games")
            for game in data['data']:
                print(f"{game['title']} - {game['availability']}")
                print(f"  Link: {game['link']}")
                print(f"  Image: {game['image']}")
                print("---")
        else:
            print(f"Error: {data.get('message', 'Unknown error')}")
            
    except requests.RequestException as e:
        print(f"Network error: {e}")

# Usage
get_epic_free_games()`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="text-sm overflow-x-auto">
{`import requests
import json

def get_epic_free_games():
    try:
        response = requests.get('https://your-domain.com/api/epic/weekly-free')
        data = response.json()
        
        if data['success']:
            print(f"Found {data['count']} free games")
            for game in data['data']:
                print(f"{game['title']} - {game['availability']}")
                print(f"  Link: {game['link']}")
                print(f"  Image: {game['image']}")
                print("---")
        else:
            print(f"Error: {data.get('message', 'Unknown error')}")
            
    except requests.RequestException as e:
        print(f"Network error: {e}")

# Usage
get_epic_free_games()`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Discord Bot Example</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Discord.py Bot</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`import discord
import requests
from discord.ext import commands

bot = commands.Bot(command_prefix='!')

@bot.command(name='epicfree')
async def epic_free_games(ctx):
    try:
        response = requests.get('https://your-domain.com/api/epic/weekly-free')
        data = response.json()
        
        if data['success'] and data['data']:
            embed = discord.Embed(
                title="🎮 Epic Games Free Weekly",
                color=0x00ff00
            )
            
            for game in data['data']:
                embed.add_field(
                    name=game['title'],
                    value=f"{game['availability']}\\n[View Game]({game['link']})",
                    inline=True
                )
            
            await ctx.send(embed=embed)
        else:
            await ctx.send("No free games found at the moment.")
            
    except Exception as e:
        await ctx.send(f"Error fetching free games: {e}")

bot.run('YOUR_BOT_TOKEN')`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="text-sm overflow-x-auto">
{`import discord
import requests
from discord.ext import commands

bot = commands.Bot(command_prefix='!')

@bot.command(name='epicfree')
async def epic_free_games(ctx):
    try:
        response = requests.get('https://your-domain.com/api/epic/weekly-free')
        data = response.json()
        
        if data['success'] and data['data']:
            embed = discord.Embed(
                title="🎮 Epic Games Free Weekly",
                color=0x00ff00
            )
            
            for game in data['data']:
                embed.add_field(
                    name=game['title'],
                    value=f"{game['availability']}\\n[View Game]({game['link']})",
                    inline=True
                )
            
            await ctx.send(embed=embed)
        else:
            await ctx.send("No free games found at the moment.")
            
    except Exception as e:
        await ctx.send(f"Error fetching free games: {e}")

bot.run('YOUR_BOT_TOKEN')`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="curl" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">cURL Examples</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Basic Request</h4>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Simple GET request</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(`curl -X GET "https://your-domain.com/api/epic/weekly-free" \\
  -H "Accept: application/json"`)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <pre className="text-sm overflow-x-auto">
{`curl -X GET "https://your-domain.com/api/epic/weekly-free" \\
  -H "Accept: application/json"`}
                              </pre>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">With Pretty Print</h4>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Formatted JSON output</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(`curl -X GET "https://your-domain.com/api/epic/weekly-free" \\
  -H "Accept: application/json" | jq '.'`)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <pre className="text-sm overflow-x-auto">
{`curl -X GET "https://your-domain.com/api/epic/weekly-free" \\
  -H "Accept: application/json" | jq '.'`}
                              </pre>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Save to File</h4>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Download JSON data</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(`curl -X GET "https://your-domain.com/api/epic/weekly-free" \\
  -H "Accept: application/json" \\
  -o epic-free-games.json`)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <pre className="text-sm overflow-x-auto">
{`curl -X GET "https://your-domain.com/api/epic/weekly-free" \\
  -H "Accept: application/json" \\
  -o epic-free-games.json`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="php" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">PHP Examples</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Basic PHP Example</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`<?php
function getEpicFreeGames() {
    $url = 'https://your-domain.com/api/epic/weekly-free';
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Accept: application/json'
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception('Failed to fetch data');
    }
    
    $data = json_decode($response, true);
    
    if ($data['success']) {
        echo "Found {$data['count']} free games:\\n";
        foreach ($data['data'] as $game) {
            echo "- {$game['title']} ({$game['availability']})\\n";
            echo "  Link: {$game['link']}\\n";
        }
    } else {
        echo "Error: " . ($data['message'] ?? 'Unknown error');
    }
}

// Usage
try {
    getEpicFreeGames();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="text-sm overflow-x-auto">
{`<?php
function getEpicFreeGames() {
    $url = 'https://your-domain.com/api/epic/weekly-free';
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Accept: application/json'
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception('Failed to fetch data');
    }
    
    $data = json_decode($response, true);
    
    if ($data['success']) {
        echo "Found {$data['count']} free games:\\n";
        foreach ($data['data'] as $game) {
            echo "- {$game['title']} ({$game['availability']})\\n";
            echo "  Link: {$game['link']}\\n";
        }
    } else {
        echo "Error: " . ($data['message'] ?? 'Unknown error');
    }
}

// Usage
try {
    getEpicFreeGames();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Data Tab */}
          <TabsContent value="live-data" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Game Data</span>
                  <Button
                    onClick={fetchFreeGames}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Real-time data from Epic Games Store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Scraping Epic Games...</p>
                  </div>
                )}

                {!loading && games.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">All Free Games</h3>
                      <div className="flex gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {weeklyFreeGames.length} Free Now
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {comingSoonGames.length} Coming Soon
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {games.map((game, index) => (
                        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {game.image && (
                            <div className="aspect-video overflow-hidden relative">
                              <img
                                src={game.image}
                                alt={game.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                {game.gameType === 'weekly-free' ? (
                                  <Badge className="bg-green-500 text-white">
                                    FREE NOW
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-yellow-500 text-white">
                                    COMING SOON
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <CardHeader>
                            <CardTitle className="text-lg">{game.title}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant={game.gameType === 'weekly-free' ? 'default' : 'secondary'}
                                className={game.gameType === 'weekly-free' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {game.availability}
                              </Badge>
                              {game.isCurrentlyFree && (
                                <Badge variant="outline" className="border-green-500 text-green-700">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Currently Free
                                </Badge>
                              )}
                              {game.isUpcomingFree && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            {game.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {game.description}
                              </p>
                            )}
                            
                            {game.freeUntil && (
                              <p className="text-sm text-blue-600 mb-3">
                                {game.freeUntil}
                              </p>
                            )}
                            
                            <Button
                              asChild
                              className="w-full"
                              size="sm"
                            >
                              <a
                                href={game.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on Epic Games
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {!loading && games.length === 0 && !error && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No free games found. Try refreshing the page.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="mb-2">
            Epic Games Free Weekly API - Built with Next.js and shadcn/ui
          </p>
          <p className="text-sm">
            Data scraped from{' '}
            <a 
              href="https://store.epicgames.com/en-US/free-games" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Epic Games Store
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
