import json
import urllib.request
from collections import Counter

r = urllib.request.urlopen("https://bzonetgstore.ru/api/products")
d = json.loads(r.read())

print("=== ИТОГ ===")
print(f"Всего товаров: {len(d)}")
print(f"С Tilda UID:   {sum(1 for p in d if p.get('tildaUid'))}")
print(f"С картинкой:   {sum(1 for p in d if p.get('image'))}")
print(f"Со specs:      {sum(1 for p in d if p.get('specs'))}")
print()
print("По категориям:", dict(Counter(p["category"]["name"] for p in d)))
print()
print("Sample клавиатура:")
kb = next(p for p in d if p["category"]["name"] == "клавиатуры")
print(f"  {kb['name']}  {kb['price']} ₽  uid={kb['tildaUid']}")
specs = json.loads(kb["specs"])
for k, v in list(specs.items())[:4]:
    print(f"    {k}: {v}")
print()
print("Sample монитор:")
mon = next(p for p in d if p["category"]["name"] == "мониторы")
print(f"  {mon['name']}  {mon['price']} ₽  uid={mon['tildaUid']}")
specs = json.loads(mon["specs"])
for k, v in list(specs.items())[:4]:
    print(f"    {k}: {v}")
print()
print("Sample мышь без двоеточий в исходнике (AJAZZ AJ159 NL):")
mou = next((p for p in d if "AJ159 NL" in p["name"] and "WHITE" not in p["name"]), None)
if mou:
    print(f"  {mou['name']}  {mou['price']} ₽  uid={mou['tildaUid']}")
    specs = json.loads(mou["specs"])
    for k, v in list(specs.items())[:6]:
        print(f"    {k}: {v}")
