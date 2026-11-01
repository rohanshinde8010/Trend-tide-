import urllib.request
from bs4 import BeautifulSoup
import re

def fetch_twitter_trending():
    url = "https://trends24.in/united-states/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    trends = []
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            soup = BeautifulSoup(resp.read().decode('utf-8', errors='ignore'), 'html.parser')
            lists = soup.find_all('ol', class_='trend-card__list')
            if lists:
                current_list = lists[0]
                rank = 1
                for li in current_list.find_all('li'):
                    a = li.find('a')
                    span = li.find('span', class_='tweet-count')
                    if a and a.text.strip():
                        topic_name = a.text.strip()
                        raw_count = span.text.strip() if span else None
                        
                        hashtag = topic_name if topic_name.startswith('#') else f"#{re.sub(r'[^a-zA-Z0-9]', '', topic_name)}"
                        clean_query = urllib.parse.quote(topic_name)
                        x_url = f"https://x.com/search?q={clean_query}"
                        
                        trends.append({
                            'rank': rank,
                            'name': topic_name,
                            'hashtag': hashtag,
                            'x_url': x_url,
                            'tweet_count': raw_count
                        })
                        rank += 1
    except Exception as e:
        print("Twitter fetch error:", e)
    return trends

if __name__ == '__main__':
    items = fetch_twitter_trending()
    print(f"Total Twitter/X trends retrieved: {len(items)}")
    for t in items[:15]:
        print(f"#{t['rank']} {t['hashtag']} ({t['name']}) -> {t['x_url']}")

