import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  sourceRef,
  sourceStatus,
  translationFields,
  verificationFields,
} from './content/schemas';

/**
 * Bibliografiya. Har bir yozuv boshqa barcha kolleksiyalardan `sourceRef`
 * orqali chaqiriladi. Aniq manbani bilmasangiz `status: "tekshirilishi-kerak"`
 * qoldiring — hech qachon URL yoki kitobni o'ylab topmang (ILMIY QOIDA 6).
 */
const sources = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/sources' }),
  schema: z.object({
    type: z.enum(['kitob', 'maqola', 'veb', 'birlamchi', 'statistika']),
    author: z.string(),
    title: z.string(),
    year: z.number().int().optional(),
    publisher: z.string().optional(),
    url: z.string().url().optional(),
    isbn: z.string().optional(),
    doi: z.string().optional(),
    accessDate: z.coerce.date().optional(),
    note: z.string().optional(),
    status: sourceStatus,
  }),
});

/** Mualliflar, ekspert-taqrizchilar, tarjimonlar, bosh muharrirlar. */
const contributors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/contributors' }),
  schema: z.object({
    name: z.string(),
    role: z.array(z.enum(['muallif', 'ekspert-taqrizchi', 'tarjimon', 'bosh-muharrir'])),
    degree: z.string().optional(),
    institution: z.string().optional(),
    field: z.string().optional(),
    orcid: z.string().optional(),
  }),
});

// --- Xalqlar ---
// Tilga bog'liq bo'lmagan faktlar (raqam, sana, havolalar) va tarjima
// qilinadigan matn ataylab ikkiga ajratilgan (CLAUDE.md, "Ko'p tillilik" 6-band):
// bitta faktlar fayli barcha tillardagi sahifalar uchun umumiy bo'ladi.
const peopleFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/peoples-facts' }),
  schema: z.object({
    endonym: z.string(),
    languageBranch: z.enum(["o'g'uz", 'qipchoq', "qarluq", 'sibir', "o'g'ur", "arg'u"]),
    population: z
      .array(
        z.object({
          value: z.number().positive(),
          year: z.number().int(),
          country: z.string(),
          sourceId: sourceRef,
          /** etnik — xalqning o'zi; mamlakat-aholisi — butun mamlakat aholisi
           * (etnik ro'yxat bo'lmagani uchun); taxminiy — manbasi qayta
           * tekshirilishi kerak bo'lgan baho. */
          scope: z.enum(['etnik', 'mamlakat-aholisi', 'taxminiy']).default('etnik'),
        })
      )
      .min(1, "Kamida bitta aholi statistikasi va uning manbasi shart"),
    regions: z.array(z.string()).default([]),
    religion: z.array(z.string()).default([]),
    /** Bugungi asosiy joylashuvi (odatda asosiy davlat poytaxti) — xaritada
     * ko'rsatish uchun. Geografik koordinata, alohida manba talab qilinmaydi. */
    location: z
      .object({
        name: z.string(),
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    historicalStates: z.array(reference('stateFacts')).default([]),
    scholars: z.array(reference('scholarFacts')).default([]),
    sources: z.array(sourceRef).min(1, 'Kamida bitta umumiy manba shart'),
    /** Xalq sahifasini individuallashtirish uchun sof dizayn tanlovi — manba
     * talab qilinmaydi (etnografik "milliy rang/naqsh" da'vosi emas). */
    accentColor: z
      .object({
        light: z.string(),
        dark: z.string(),
      })
      .optional(),
    /** Mavhum geometrik bezak turi — hech qanday aniq xalqqa tegishli deb
     * da'vo qilinmaydi, faqat vizual farqlash uchun. */
    pattern: z.enum(['zigzag', 'diamond', 'dots', 'wave', 'key', 'cross']).optional(),
    /** Xalqning bugungi davlatchilik holati: mustaqil davlat, davlat tarkibidagi
     * avtonomiya yoki o'z davlat tuzilmasi yo'q. `flag` — src/data/flags.json
     * dagi kalit (rasmiy bayroq, Wikimedia Commons SVG). */
    statehood: z
      .object({
        status: z.enum(['mustaqil-davlat', 'avtonomiya', 'yoq']),
        entities: z
          .array(
            z.object({
              name: z.string(),
              /** Avtonomiya qaysi davlat tarkibida. */
              country: z.string().optional(),
              flag: z.string().optional(),
              /** Rasmiy bayroq bo'lmasa — sababi (masalan, XXR avtonom birliklarida bayroq yo'q). */
              noFlagNote: z.string().optional(),
            })
          )
          .default([]),
        note: z.string().optional(),
        sourceIds: z.array(sourceRef).min(1, "Davlatchilik holati manbaga bog'lanishi shart"),
      })
      .optional(),
    /** Xalqning o'z vakillik organi qabul qilgan yoki tarixan qo'llangan etnik
     * bayrog'i (davlat bayrog'i emas). Siyosiy sezgir bo'lsa `note` da
     * tomonlarning pozitsiyasi beriladi (ILMIY QOIDA 5). */
    peopleFlag: z
      .object({
        flag: z.string(),
        name: z.string(),
        note: z.string(),
        sourceIds: z.array(sourceRef).min(1),
      })
      .optional(),
    ...verificationFields,
  }),
});

const peoples = defineCollection({
  loader: glob({ pattern: '*/**/*.mdx', base: './src/content/peoples' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    factsId: reference('peopleFacts'),
    /** Karusel rasmlari izohlari (tarjima qilinadi), kaliti — src/data/gallery.json dagi `id`. */
    galleryTexts: z.record(z.string(), z.string()).default({}),
    ...translationFields,
  }),
});

// --- Tarixiy davlatlar ---
const stateFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/states-facts' }),
  schema: z.object({
    /** turkiy — turkiy davlat (ilmiy konsensus); turkiy-sulola — turkiy sulola
     * boshqargan, aholisining ko'pchiligi turkiy bo'lmagan davlat; munozarali —
     * turkiy bilan bog'liqligi ilmiy munozarali (ILMIY QOIDA 3: `disputed` da
     * har bir qarash manbasi bilan beriladi). */
    category: z.enum(['turkiy', 'turkiy-sulola', 'munozarali']).default('turkiy'),
    endonym: z.string().optional(),
    period: z.object({
      startYear: z.number().int(),
      startEra: z.enum(['m.av', 'milodiy']),
      endYear: z.number().int(),
      endEra: z.enum(['m.av', 'milodiy']),
      /** Boshlanish yoki tugash sanasi manbalarda turlicha / taxminiy. */
      approximate: z.boolean().default(false),
    }),
    capital: z.string().optional(),
    /** Xaritada shu davlatga doimiy ajratilgan rang — sof dizayn tanlovi,
     * manba talab qilinmaydi (tarixiy "davlat rangi" da'vosi emas). */
    mapColor: z
      .object({
        light: z.string(),
        dark: z.string(),
      })
      .optional(),
    /** src/data/geo/states/{slug}/{mapYear}.geojson faylini topish uchun. */
    mapYear: z.number().int().optional(),
    /** Xaritada nuqta sifatida ko'rsatish uchun — shahar koordinatasi
     * geografik fakt (bahssiz), tarixiy chegaralardan farqli o'laroq
     * alohida manba talab qilinmaydi. */
    capitals: z
      .array(
        z.object({
          name: z.string(),
          lat: z.number(),
          lng: z.number(),
        })
      )
      .default([]),
    /** Taxminiy hudud shakli — aniq tarixiy CHEGARA emas (bunga hali
     * tekshirilgan GeoJSON manba yo'q), balki matnda tasvirlangan umumiy
     * yoyilish yo'nalishini ko'rsatuvchi sxematik ko'pburchak uchun
     * chegaraviy nuqtalar. Har doim aniq ogohlantirish bilan birga
     * ko'rsatiladi. */
    extentPoints: z
      .array(
        z.object({
          name: z.string(),
          lat: z.number(),
          lng: z.number(),
        })
      )
      .default([]),
    /** Davlat ramzlari (tug', tamg'a, tug'ro). Faqat manbada shakli
     * tasvirlangan ramz chiziladi — internetdagi zamonaviy "tarixiy bayroq"
     * talqinlari kiritilmaydi (ILMIY QOIDA 4). `id` tasvir komponentidagi
     * (components/symbols/StateSymbol.astro) chizmaga mos keladi. */
    symbols: z
      .array(
        z.object({
          id: z.enum(['gokturk-bori-tugi', 'temur-uch-halqa']),
          kind: z.enum(['tug', 'tamga', 'tugro', 'muhr']),
          sourceIds: z.array(sourceRef).min(1, 'Har bir ramz kamida bitta manbaga bog\'lanishi shart'),
          confidence: z.enum(['baland', 'ortacha', 'past']),
          verified: z.boolean().default(false),
        })
      )
      .default([]),
    /** Ramz chizilmagan bo'lsa sababi: manbada bor, lekin aniq shaklini
     * ekspert tasdiqlashi kerak, yoki ishonchli manba hali topilmagan. */
    symbolsStatus: z.enum(['chizilgan', 'ekspert-kutilmoqda', 'manba-topilmagan']).optional(),
    predecessors: z.array(reference('stateFacts')).default([]),
    successors: z.array(reference('stateFacts')).default([]),
    sources: z.array(sourceRef).min(1, 'Kamida bitta manba shart'),
    ...verificationFields,
  }),
});

const states = defineCollection({
  loader: glob({ pattern: '*/**/*.mdx', base: './src/content/states' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    factsId: reference('stateFacts'),
    /** Karusel rasmlari izohlari (tarjima qilinadi), kaliti — src/data/gallery.json dagi `id`. */
    galleryTexts: z.record(z.string(), z.string()).default({}),
    /** "Bilasizmi?" kartochkalari — faqat shu sahifa matnida manbasi bilan
     * keltirilgan faktlar (yangi da'vo emas). Tarjima qilinadi. */
    didYouKnow: z
      .array(z.object({ text: z.string(), sourceIds: z.array(sourceRef).min(1, 'Har bir fakt manbaga bog\'lanishi shart') }))
      .default([]),
    /** Ramz nomi va izohi (tarjima qilinadi), kaliti — `symbols[].id`. */
    symbolTexts: z.record(z.string(), z.object({ title: z.string(), caption: z.string() })).default({}),
    ...translationFields,
  }),
});

// --- Olim va ulamolar ---
const scholarFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/scholars-facts' }),
  schema: ({ image }) => z.object({
    /** turkiy — turkiy tilda ijod qilgan yoki turkiy kelib chiqishi umum qabul
     * qilingan; mintaqaviy — "Turkiy dunyo mintaqasidan": kelib chiqishi boshqa
     * yoki noma'lum, lekin mintaqaning umumiy merosiga mansub (turkiy deb
     * tasniflanmaydi); munozarali — kelib
     * chiqishi ilmiy munozarali (`disputed` da qarashlar manbasi bilan). */
    category: z.enum(['turkiy', 'mintaqaviy', 'munozarali']).default('turkiy'),
    birthYear: z.number().int().optional(),
    birthEra: z.enum(['m.av', 'milodiy']).default('milodiy'),
    deathYear: z.number().int().optional(),
    deathEra: z.enum(['m.av', 'milodiy']).default('milodiy'),
    datesUncertain: z.boolean().default(false),
    /** Tug'ilgan va vafot yillari ma'lum bo'lmasa — manbada aytilgan faoliyat asri
     * (masalan 15 = XV asr). Yil o'ylab topilmaydi; ro'yxatda tartib uchun ham ishlatiladi. */
    century: z.number().int().optional(),
    field: z.array(z.string()).min(1, "Faoliyat sohasi (soha) ko'rsatilishi shart"),
    relatedPeoples: z.array(reference('peopleFacts')).default([]),
    relatedStates: z.array(reference('stateFacts')).default([]),
    /** Portret. foto — fotosurat; tarixiy-tasvir — alloma hayotligida yoki
     * yaqin davrda yaratilgan tasvir; badiiy-tasvir — ancha keyin tasavvur
     * asosida yaratilgan (marka, gravyura, haykal va h.k.). foto va tasvirlar
     * Commons'dan, muallif va litsenziya bilan. ai-talqin — AI chizgan badiiy
     * talqin, model va prompt saqlanadi. badiiy-tasvir va ai-talqin sahifada
     * doimo "haqiqiy qiyofasi ma'lum emas" belgisi bilan ko'rsatiladi. */
    portrait: z
      .discriminatedUnion('kind', [
        z.object({
          kind: z.enum(['foto', 'tarixiy-tasvir', 'badiiy-tasvir']),
          medium: z.enum(['foto', 'miniatyura', 'gravyura', 'rasm', 'marka', 'banknota', 'haykal']),
          src: image(),
          author: z.string(),
          license: z.string(),
          sourceUrl: z.string().url(),
        }),
        z.object({
          kind: z.literal('ai-talqin'),
          src: image(),
          model: z.string(),
          prompt: z.string(),
          created: z.string(),
        }),
      ])
      .optional(),
    sources: z.array(sourceRef).min(1, 'Kamida bitta manba shart'),
    ...verificationFields,
  }),
});

const scholars = defineCollection({
  loader: glob({ pattern: '*/**/*.mdx', base: './src/content/scholars' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    factsId: reference('scholarFacts'),
    /** "Bilasizmi?" kartochkalari — faqat shu sahifa matnida manbasi bilan
     * keltirilgan faktlar (yangi da'vo emas). Tarjima qilinadi. */
    didYouKnow: z
      .array(z.object({ text: z.string(), sourceIds: z.array(sourceRef).min(1, 'Har bir fakt manbaga bog\'lanishi shart') }))
      .default([]),
    ...translationFields,
  }),
});

// --- Umumiy mavzular (etnogenez, til tasnifi va h.k.) ---
const topicFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/topics-facts' }),
  schema: z.object({
    category: z.string().optional(),
    relatedPeoples: z.array(reference('peopleFacts')).default([]),
    sources: z.array(sourceRef).min(1, 'Kamida bitta manba shart'),
    ...verificationFields,
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '*/**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    factsId: reference('topicFacts'),
    ...translationFields,
  }),
});

// --- Ilmiy meros: turkiy dunyo allomalari va davlatlarining ilm-fan va madaniyatga hissasi ---
/** Hissa kim tomonidan qilingani ATAYLAB yozilmaydi — sahifada `scholars` (alloma toifasi)
 * yoki `states` (turkiy davlat homiyligi) dan avtomatik aniqlanadi. Shunda "turkiy hissa"
 * belgisi alloma toifasiga zid bo'lib qolmaydi (masalan, Ibn Sino — "Turkiy dunyo mintaqasidan"). */
const contributionFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/contributions-facts' }),
  schema: z
    .object({
      domain: z.enum([
        'matematika', 'astronomiya', 'tibbiyot', 'geografiya', 'tilshunoslik', 'islom-ilmlari',
        'falsafa', 'tarix', 'adabiyot', 'memorchilik', 'talim',
      ]),
      /** Asosiy sana (asar yozilgan, inshoot qurilgan va h.k.). */
      year: z.number().int(),
      era: z.enum(['m.av', 'milodiy']).default('milodiy'),
      yearUncertain: z.boolean().default(false),
      /** Birinchisi — asosiy muallif (hissa belgisi uning toifasidan olinadi), qolganlari hamkor yoki davomchilar. */
      scholars: z.array(reference('scholarFacts')).default([]),
      states: z.array(reference('stateFacts')).default([]),
      /** Ta'sir dalillari turi — o'lchanadigan ko'rsatkichlar (ball yoki foiz emas). */
      evidence: z.array(z.enum(['tarjima', 'darslik', 'atama', 'nashr', 'davomchi', 'meros'])).min(1),
      /** Ta'sir zanjiri qadamlari; matni tarjima faylida (`chainTexts[id]`). */
      chain: z.array(z.object({ id: z.string(), year: z.number().int().optional() })).default([]),
      sources: z.array(sourceRef).min(1, 'Kamida bitta manba shart'),
      ...verificationFields,
    })
    .refine((d) => d.scholars.length > 0 || d.states.length > 0, {
      message: "Hissa kamida bitta alloma yoki davlatga bog'lanishi shart",
    }),
});

const contributions = defineCollection({
  loader: glob({ pattern: '*/**/*.mdx', base: './src/content/contributions' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    factsId: reference('contributionFacts'),
    /** Ta'sir dalillari — har biri manbaga bog'langan aniq fakt. */
    impact: z
      .array(z.object({ text: z.string(), sourceIds: z.array(sourceRef).min(1, "Har bir dalil manbaga bog'lanishi shart") }))
      .min(1),
    chainTexts: z.record(z.string(), z.string()).default({}),
    ...translationFields,
  }),
});

export const collections = {
  sources,
  contributors,
  peopleFacts,
  peoples,
  stateFacts,
  states,
  scholarFacts,
  scholars,
  topicFacts,
  topics,
  contributionFacts,
  contributions,
};
