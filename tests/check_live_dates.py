import urllib.request
import xml.etree.ElementTree as ET

url = 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
root = ET.fromstring(urllib.request.urlopen(req, timeout=10).read())

print("LIVE SPORTS HEADLINES RIGHT NOW:")
for it in root.findall('.//item')[:5]:
    title = it.find('title').text
    pub_date = it.find('pubDate').text
    print(f"  • {title}")
    print(f"    Published: {pub_date}")

