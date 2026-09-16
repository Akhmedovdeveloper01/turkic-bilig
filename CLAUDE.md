# Turkic Bilig — Turkiy xalqlar ensiklopediyasi (loyiha qo'llanmasi)

- **Loyiha nomi:** Turkic Bilig ("bilig" — qadimgi turkiy tilda "bilim, donolik")
- **To'liq nom (tavsif bilan):** "Turkic Bilig — Turkiy xalqlar ensiklopediyasi" /
  "Turkic Bilig — Encyclopedia of Turkic Peoples" (tavsif har bir tilga tarjima qilinadi,
  "Turkic Bilig" brend nomi tarjima qilinmaydi)
- **Asosiy domen:** https://turkicbilig.uz (Astro konfiguratsiyasida `site` qiymati)
- **Eslatma:** "Türkbilig" nomli ilmiy jurnal (Hacettepe universiteti) bilan chalkashtirmaslik
  uchun nom saytda doimo tavsif bilan birga ishlatiladi.

Bu fayl loyihaning "konstitutsiyasi". Har bir vazifada shu qoidalarga amal qil.

## Loyiha maqsadi

Turkiy xalqlar haqida o'zbek tilida, ilmiy manbalarga asoslangan, har qanday foydalanuvchi
(o'quvchi, talaba, o'qituvchi, olim, sayyoh) uchun tushunarli va ishonchli veb-sayt.

Qamrab olinadigan mavzular: kelib chiqishi va etnogenezi, til tasnifi, geografik joylashuvi,
aholisi, tarixiy davlat va imperiyalar, olim va ulamolar, madaniyat va san'at, turizm,
qardosh mamlakatlar va xalqaro tashkilotlar (masalan, Turkiy davlatlar tashkiloti),
strategik ahamiyati.

## Auditoriya va uslub

- Har bir sahifa ikki qatlamli bo'lsin:
  1. **Qisqacha** — 3–5 gapdan iborat, oddiy tilda yozilgan xulosa (har kim uchun).
  2. **Batafsil** — ilmiy tafsilotlar, atamalar, munozaralar (talaba va olimlar uchun).
- Asosiy til: o'zbek tili, lotin yozuvi, rasmiy imlo qoidalari bo'yicha (o', g', sh, ch, ng, tutuq belgisi).
- Uslub: neytral, akademik, hissiyotsiz. "Buyuk", "eng qadimgi", "ulug'" kabi baho beruvchi
  so'zlarni manbasiz ishlatma.

## ILMIY QOIDALAR (eng muhim bo'lim)

1. **Manbasiz fakt yo'q.** Har bir raqam, sana va da'vo `sources` maydoniga bog'langan bo'lishi shart.
   Manba ko'rsatilmagan kontent build jarayonida xato berishi kerak (sxema validatsiyasi).
2. **Statistikaga yil va manba.** Masalan: "X mln (2025, O'zbekiston Statistika agentligi)".
3. **Konsensus va munozara ajratiladi.** Bahsli masalalar (Xiongnu–turk bog'liqligi, turklarning
   ilk vatani, allomalarning etnik mansubligi va h.k.) maxsus "Munozarali masala" blokida,
   har bir qarash o'z manbasi bilan beriladi.
4. **Psevdotarix taqiqlanadi.** "Shumerlar turk bo'lgan", "etrusklar turkiy" kabi ilmiy
   jamoatchilik qabul qilmagan da'volar kontentga kiritilmaydi.
5. **Siyosiy sezgir mavzular** (Qorabog', Shinjon, Qrim tatarlari deportatsiyasi, chegara
   masalalari) faqat xalqaro ilmiy va rasmiy manbalar asosida, tomonlar pozitsiyasi bilan yoritiladi.
6. **Uydirma manba yaratma.** Aniq manbani bilmasang, `status: "tekshirilishi-kerak"`
   deb belgila va `TODO` qoldir. Hech qachon kitob, sahifa yoki URL ni o'ylab topma.
7. Har bir kontent faylida `verified: false | true` maydoni bo'lsin. Inson muharrir
   tekshirmagunicha u `false` bo'lib qoladi va sahifada "Tekshiruvda" belgisi ko'rinadi.

### Tavsiya etilgan asosiy manbalar

- P. B. Golden, *An Introduction to the History of the Turkic Peoples* (1992)
- C. V. Findley, *The Turks in World History* (2005)
- D. Sinor (tahr.), *The Cambridge History of Early Inner Asia* (1990)
- L. Johanson, É. Á. Csató (tahr.), *The Turkic Languages* (2-nashr, 2021)
- V. V. Bartold asarlari; *Encyclopaedia of Islam*; *Encyclopaedia Iranica*
- Birlamchi manbalar: O'rxun-Enasoy yozuvlari, Mahmud Koshg'ariy "Devonu lug'otit turk",
  Yusuf Xos Hojib "Qutadg'u bilig"
- Statistika: milliy statistika qo'mitalari, BMT (UN DESA), aholini ro'yxatga olish natijalari
- O'zbek manbalari: O'zbekiston Fanlar akademiyasi nashrlari, "O'zbekiston milliy ensiklopediyasi"
- L. Gumilyov asarlari — faqat "munozarali" belgisi bilan ishlatiladi.

## Texnologiyalar

- **Framework:** Astro, eng so'nggi barqaror versiya (statik, kontentga yo'naltirilgan, tez)
- **Kontent:** Astro Content Collections + Zod sxemalari (MDX va JSON)
- **Stil:** Tailwind CSS, yorug' va qorong'i rejim
- **Xarita:** MapLibre GL yoki Leaflet + GeoJSON (tarixiy chegaralar davr bo'yicha)
- **Qidiruv:** Pagefind (statik qidiruv)
- **Ko'p tillilik:** Astro i18n (batafsil: "Ko'p tillilik" bo'limi)
- **Shriftlar:** Noto Sans oilasi (lotin, kirill, arab, CJK, devanagari), faqat kerakli tilga yuklanadi
- **Til:** TypeScript (qat'iy rejim)
- **Hosting:** Cloudflare (asosiy), muqobil — Netlify yoki Vercel
- **CMS:** Sveltia CMS (2-bosqich)
- **Kod ombori:** GitHub (CMS va ekspert taqrizi ham shu orqali ishlaydi)
- **Asosiy tamoyil:** sayt statik bo'lsin; JavaScript faqat interaktiv qismlarda
  (xarita, xronologiya, qidiruv, til almashtirgich) — Astro "islands" yondashuvi.

## Ko'p tillilik (arxitektura BIRINCHI KUNDAN shunga mo'ljallanadi)

### Tillar ro'yxati (BCP-47 kodlari)

**Turkiy tillar:**
- Lotin yozuvi: `uz` o'zbek, `tr` turk, `az` ozarbayjon, `tk` turkman, `kaa` qoraqalpoq,
  `crh` qrim-tatar, `gag` gagauz
- Kirill yozuvi: `kk` qozoq, `ky` qirg'iz, `tt` tatar, `ba` boshqird, `sah` saxa (yoqut),
  `cv` chuvash, `tyv` tuva, `alt` oltoy, `kjh` xakas, `krc` qorachoy-bolqor, `kum` qumiq, `nog` no'g'ay
- Arab yozuvi (RTL): `ug` uyg'ur
- Qo'shimcha yozuv variantlari keyinchalik: `uz-Cyrl`, `kk-Latn` (qozoq lotin alifbosiga o'tish jarayoni)

**Boshqa tillar:** `en` ingliz, `ru` rus, `ar` arab (RTL), `zh` xitoy (soddalashtirilgan),
`ko` koreys, `ja` yapon, `hi` hind, `es` ispan, `fr` fransuz, `de` nemis

Ro'yxat kengayadi — til qo'shish faqat konfiguratsiyaga bitta yozuv qo'shish bilan bo'lishi kerak.

### Texnik talablar

1. **Til ro'yxati bitta joyda:** `src/i18n/locales.ts` — har bir til uchun `code`, `endonym`
   (o'z tilidagi nomi), `script`, `dir` (ltr | rtl), `font`, `group` (turkiy | boshqa), `status`.
2. **URL tuzilishi:** `/{til}/...` (masalan `/uz/xalqlar/ozbeklar`, `/ar/...`). `hreflang` teglari,
   har til uchun sitemap.
3. **RTL (arab, uyg'ur):** `<html dir>` til bo'yicha o'rnatiladi. CSS da faqat mantiqiy xossalar
   (`margin-inline-start`, `ps-*`/`pe-*`), `left/right` ishlatilmaydi. Xronologiya va xarita
   boshqaruvlari RTL da ham to'g'ri ishlashi tekshiriladi.
4. **Interfeys matnlari:** `src/i18n/ui/{til}.json`. Kodga matn qattiq yozilmaydi.
   Tarjimasi yo'q kalit avval `en`, keyin `uz` ga qaytadi (fallback).
5. **Kontent tarjimasi:** `src/content/peoples/{til}/{slug}.mdx`. Asl (manba) til — `uz`.
   Tarjima faylida: `translatedFrom`, `translationStatus: "yoq" | "mashina" | "tahrirlangan" | "tasdiqlangan"`,
   `translator`, `reviewedBy`. Tarjima yo'q bo'lsa — asl matn "Bu sahifa hali {til}ga tarjima
   qilinmagan" ogohlantirishi bilan ko'rsatiladi.
   `translationStatus: "mashina"` bo'lgan sahifada foydalanuvchiga ogohlantirish ko'rinadi.
6. **Faktlar tarjimaga bog'liq emas:** raqamlar, sanalar, koordinatalar, manba id lari
   tilga bog'liq bo'lmagan umumiy JSON/frontmatter da saqlanadi — tarjimada faqat matn bo'ladi.
   Shunda aholi soni yangilansa, 30 ta tilda qo'lda o'zgartirish kerak bo'lmaydi.
7. **Atamalar lug'ati:** `src/data/glossary/` — xalqlar, davlatlar, shaxslar, joy nomlarining
   har bir tildagi qabul qilingan yozilishi (masalan Ko'k Turk xoqonligi / Göktürk Kağanlığı /
   Тюркский каганат / Göktürk Khaganate). Tarjimada nomlar FAQAT shu lug'atdan olinadi.
8. **Formatlash:** raqam va sanalar `Intl.NumberFormat` / `Intl.DateTimeFormat` bilan.
   Tarixiy sanalar uchun "mil. av." / "BC" / "до н. э." kabi belgilar tarjima faylida.
9. **Til almashtirgich:** ikki guruh ("Turkiy tillar" va "Boshqa tillar"), har til o'z nomida
   (endonym) yoziladi, bayroq ishlatilmaydi (til ≠ davlat).
10. **Qidiruv:** Pagefind har til uchun alohida indeks.

### Tarjima sifati qoidalari

- Ilmiy matn tarjimasida mazmun o'zgarmaydi: "munozarali" belgilari, manbalar va ehtiyot
  iboralari ("taxminan", "ba'zi olimlar fikricha") saqlanadi.
- Kam resursli tillar (saxa, chuvash, tuva, xakas, oltoy, gagauz, no'g'ay va h.k.) uchun
  mashina tarjimasi ishonchsiz — ona tili egasi tekshirmaguncha `translationStatus: "mashina"`
  qoladi yoki umuman nashr etilmaydi.
- Tarjima ham `npm run build` da tekshiriladi: frontmatter dagi faktlar asl faylga mos kelishi shart.

## Tahrir va ekspert tekshiruvi tizimi

Maqsad: dasturchi bo'lmagan tarixchi, tilshunos va tarjimonlar brauzer orqali matnni
tahrirlay olsin, har bir o'zgarish kim tomonidan, qachon va nima uchun kiritilgani saqlansin.

1. **Kontent boshqaruvi (CMS):** Git-ga asoslangan CMS — Sveltia CMS (asosiy nomzod,
   ko'p tillilikni qo'llaydi) yoki Decap CMS. Ma'lumotlar bazasi talab qilinmaydi,
   barcha kontent Git repozitoriyada MDX/JSON ko'rinishida qoladi.
   CMS konfiguratsiyasi Zod sxemalariga mos bo'lishi shart (maydonlar, majburiy manbalar).
2. **Rollar:** muallif, ekspert-taqrizchi (tarixchi, tilshunos, etnograf, san'atshunos),
   tarjimon, bosh muharrir. Asosiy (`main`) tarmoqqa faqat bosh muharrir birlashtiradi.
3. **Ish oqimi:** qoralama → ekspert taqrizi → muharrir tasdig'i → nashr.
   Ekspertlarning o'zgarishlari alohida tarmoq / pull request orqali keladi.
4. **Taqriz ma'lumotlari (frontmatter):**
   `reviews[] { reviewerId, field, date, result: "tasdiqlandi" | "tuzatish-kerak", notes }`.
   Taqrizchilar `src/content/contributors/` da: ism, ilmiy daraja, muassasa, soha, ORCID (bo'lsa).
5. **Sahifada ko'rinadi:** "Taqrizchilar", "Oxirgi tekshiruv sanasi", "O'zgarishlar tarixi"
   (Git tarixidan avtomatik), "Xato haqida xabar berish" tugmasi (forma yoki GitHub issue).
6. **Tarjimalarni sinxronlash:** asl `uz` matn o'zgarsa, barcha tarjimalar avtomatik
   `translationStatus: "eskirgan"` holatiga tushadi (asl fayl versiyasi/hash solishtiriladi)
   va sahifada "Asl matn yangilangan, tarjima tekshirilmoqda" belgisi chiqadi.
   Build vaqtida eskirgan tarjimalar ro'yxati hisobot sifatida chiqariladi.
7. **Katta tuzatishlar** (fakt, sana, raqam, talqin o'zgarishi) sahifadagi "O'zgarishlar"
   bo'limida qisqa izoh bilan qayd etiladi — ilmiy shaffoflik uchun.

## Papka tuzilishi (amaldagi)

Ko'p tillilik qoidasi 6 ("Faktlar tarjimaga bog'liq emas") amalda har bir kolleksiyani
ikkiga ajratish orqali ta'minlanadi: **`*-facts/`** — tilga bog'liq bo'lmagan raqam, sana,
havola va manbalar (bitta JSON, barcha tillar uchun umumiy); **kolleksiyaning o'zi** —
har til uchun alohida tarjima qilinadigan MDX matni (`{til}/{slug}.mdx`), `factsId` orqali
tegishli faktlar yozuviga bog'lanadi.

```
src/
  content/
    config.ts           # barcha Zod sxemalari shu yerda
    schemas.ts           # qayta ishlatiladigan sxema bo'laklari (manba, review, changelog, disputed)
    sources/              # bibliografiya — {id}.json, sources kolleksiyasi
    contributors/          # mualliflar, taqrizchilar, tarjimonlar — {id}.json
    peoples-facts/{slug}.json   # xalq haqidagi tilga bog'liq bo'lmagan faktlar
    peoples/{til}/{slug}.mdx    # xalq sahifasining tarjima qilinadigan matni (uz — asl)
    states-facts/{slug}.json
    states/{til}/{slug}.mdx
    scholars-facts/{slug}.json
    scholars/{til}/{slug}.mdx
    topics-facts/{slug}.json
    topics/{til}/{slug}.mdx
  data/
    languages.json  # til tasnifi va qiyosiy lug'at
    geo/            # GeoJSON xaritalar
    glossary/       # atamalar va nomlarning har tildagi yozilishi
  i18n/
    locales.ts      # tillar konfiguratsiyasi (BCP-47, script, dir, font, group, status)
    fonts.ts        # skriptga mos Noto Sans paketini dinamik yuklash
    ui.ts           # interfeys tarjimasi uchun fallback (til -> en -> uz) va t() funksiyasi
    ui/             # interfeys tarjimalari (uz.json, en.json, ...)
  components/
  layouts/
  pages/
```

## Kontent sxemasi (xalq uchun namunaviy maydonlar)

`name`, `endonym`, `languageBranch` (o'g'uz | qipchoq | qarluq | sibir | o'g'ur | arg'u),
`population[] {value, year, country, sourceId}`, `regions[]`, `religion[]`,
`historicalStates[]` (states kolleksiyasiga havola), `scholars[]`, `summary`,
`sources[]` (majburiy, kamida 1 ta), `disputed[]`, `verified`, `lastReviewed`,
`reviews[]`, `changelog[]`.

Barcha xalq sahifalari BIR XIL shablonda bo'lsin:
Kelib chiqishi → Tili → Joylashuvi → Aholisi → Tarixiy davlatlari → Allomalari →
Madaniyat va san'at → Turizm → Manbalar.

## Bosqichlar

- **1-bosqich:** Loyiha skeleti, sxemalar, dizayn tizimi, umumiy bo'limlar
  (etnogenez, til tasnifi, davlatlar xronologiyasi) + 6 davlat: O'zbekiston, Qozog'iston,
  Qirg'iziston, Turkmaniston, Ozarbayjon, Turkiya.
- **2-bosqich:** CMS va ekspert taqrizi tizimi, interaktiv xarita, qiyosiy lug'at, allomalar bazasi, qidiruv.
- **3-bosqich:** Tatar, boshqird, uyg'ur, qoraqalpoq, yoqut, chuvash, gagauz, qrim tatarlari va boshqalar.
- **Tillar bo'yicha bosqichlar** (arxitektura 1-bosqichda barcha tillarga tayyor bo'ladi,
  kontent tarjimasi esa bosqichma-bosqich):
  - Interfeys (menyu, tugmalar): barcha tillar — 1-bosqichdayoq.
  - Kontent, 1-to'lqin: `uz`, `en`, `ru`, `tr`, `kk`, `ky`, `az`, `tk`
  - Kontent, 2-to'lqin: `ar`, `zh`, `ja`, `ko`, `hi`, `es`, `fr`, `de`, `ug`, `tt`, `ba`, `kaa`
  - Kontent, 3-to'lqin: qolgan turkiy tillar (ona tili egalari tekshiruvi bilan)

## Ish tartibi

- Katta vazifadan oldin reja taklif qil va tasdiqimni kut.
- Bitta vazifada bitta mantiqiy o'zgarish qil; har qadamdan keyin git commit.
- Kontentdan oldin sxema va shablonni tayyorla, matnni keyin to'ldir.
- O'zgarishdan keyin `npm run build` bilan tekshir (sxema xatolari shu yerda ushlanadi).
- Accessibility: semantik HTML, alt matnlar, klaviatura bilan boshqarish, yetarli kontrast.
- Mobile-first dizayn.
