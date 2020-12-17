import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
urllib.request.urlretrieve('https://api.darksky.net/forecast/d4d9154a92f1c1997d0c52dc66aa7bee/55.676098,12.568337','future_weather_data.json')