import urllib.request
import re
from bs4 import BeautifulSoup

def test_trends24():
    url = "https://trends24.in/united-states/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')
            # Look for trend cards
            trend_cards = soup.find_all('ol', class_='trend-card__list')
            trends = []
            if trend_cards:
                for li in trend_cards[0].find_all('li'):
                    a = li.find('a')
                    span = li.find('span', class_='tweet-count')
                    if a:
                        trends.append({
                            'name': a.text.strip(),
                            'url': a.get('href'),
                            'tweet_count': span.text.strip() if span else 'N/A'
                        })
            print(f"Trends24 found: {len(trends)} trends")
            for t in trends[:5]:
                print(f"  - {t['name']} ({t['tweet_count']}) -> {t['url']}")
            return trends
    except Exception as e:
        print("Trends24 error:", e)
        return []

def test_getdaytrends():
    url = "https://getdaytrends.com/united-states/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')
            rows = soup.find_all('tr')
            trends = []
            for r in rows:
                a = r.find('a')
                count_td = r.find('td', class_='desc') or r.find('span', class_='small')
                if a and ('/trend/' in a.get('href', '') or '#' in a.text or len(a.text.strip()) > 2):
                    trends.append({
                        'name': a.text.strip(),
                        'tweet_count': count_td.text.strip() if count_td else 'N/A'
                    })
            print(f"GetDayTrends found: {len(trends)} trends")
            for t in trends[:5]:
                print(f"  - {t['name']} ({t['tweet_count']})")
            return trends
    except Exception as e:
        print("GetDayTrends error:", e)
        return []

if __name__ == "__main__":
    print("Testing Trends24:")
    test_trends24()
    print("\nTesting GetDayTrends:")
    test_getdaytrends()

