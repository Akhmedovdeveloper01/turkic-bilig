"""
Karusel rasmlari uchun Wikimedia Commons metama'lumotini oladi:
scripts/commons/gallery-sources.json -> src/data/gallery.json
(muallif, litsenziya, havola, o'lcham). Fotosuratlar src/assets/gallery/ ga
yuklab olinadi (1400px gacha, JPEG) — build tashqi serverga bog'liq bo'lmasligi
uchun; mavjud fayl qayta yuklanmaydi. Gerb SVG'lari public/emblems/ ga
yuklanadi (skript va tashqi havola tekshiriladi).

Ishga tushirish: python3 scripts/commons/fetch-gallery.py
"""
import io, json, re, sys, time, urllib.parse, urllib.request, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA = 'TurkicBilig/0.1 (https://turkicbilig.uz)'
strip = lambda s: re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', s or '')).strip()


def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})))


def main():
    sources = json.loads((ROOT / 'scripts/commons/gallery-sources.json').read_text())
    out = {}
    (ROOT / 'public/emblems').mkdir(exist_ok=True)
    (ROOT / 'src/assets/gallery').mkdir(exist_ok=True)
    for entity, items in sources.items():
        if entity.startswith('_'):
            continue
        out[entity] = []
        for it in items:
            if 'commons' not in it:  # rasmsiz izoh kartochkasi (masalan, "rasmiy gerbi yo'q")
                out[entity].append({'id': it['id'], 'kind': it['kind']})
                continue
            info = api({'action': 'query', 'titles': it['commons'], 'prop': 'imageinfo', 'redirects': 1,
                        'iiprop': 'url|size|extmetadata', 'iiurlwidth': 1600, 'format': 'json'})
            page = next(iter(info['query']['pages'].values()))
            if 'imageinfo' not in page:
                sys.exit(f"Topilmadi: {it['commons']}")
            ii = page['imageinfo'][0]
            m = ii['extmetadata']
            rec = {
                'id': it['id'],
                'kind': it.get('kind', 'obida'),
                'unescoYear': it.get('unescoYear'),
                'commons': page['title'],
                'sourceUrl': ii['descriptionurl'],
                'author': strip(m.get('Artist', {}).get('value')),
                'license': strip(m.get('LicenseShortName', {}).get('value')),
                'licenseUrl': strip(m.get('LicenseUrl', {}).get('value')) or None,
            }
            if page['title'].lower().endswith('.svg'):
                svg = urllib.request.urlopen(urllib.request.Request(ii['url'], headers={'User-Agent': UA})).read().decode('utf-8')
                if re.search(r'<script|onload=|javascript:|href="http', svg, re.I):
                    sys.exit(f"Xavfli SVG: {page['title']}")
                name = f"{entity.split('/')[1]}-{it['id']}.svg"
                (ROOT / 'public/emblems' / name).write_text(svg)
                rec.update({'src': f'/emblems/{name}', 'width': ii['width'], 'height': ii['height']})
            else:
                name = f"{entity.replace('/', '-')}-{it['id']}.jpg"
                out_file = ROOT / 'src/assets/gallery' / name
                if not out_file.exists():
                    data = urllib.request.urlopen(urllib.request.Request(ii['thumburl'], headers={'User-Agent': UA})).read()
                    im = Image.open(io.BytesIO(data)).convert('RGB')
                    if im.width > 1400:
                        im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
                    im.save(out_file, quality=76, optimize=True, progressive=True)
                    time.sleep(1.5)  # Wikimedia so'rovlar chegarasiga hurmat
                w, h = Image.open(out_file).size
                rec.update({'src': f'gallery/{name}', 'width': w, 'height': h})
            out[entity].append(rec)
            print(f"{entity:32} {it['id']:14} {rec['license']:14} {rec['author'][:40]}")
    (ROOT / 'src/data/gallery.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')


main()
