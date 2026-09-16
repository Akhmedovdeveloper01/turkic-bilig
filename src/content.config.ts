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
        })
      )
      .min(1, "Kamida bitta aholi statistikasi va uning manbasi shart"),
    regions: z.array(z.string()).default([]),
    religion: z.array(z.string()).default([]),
    historicalStates: z.array(reference('states')).default([]),
    scholars: z.array(reference('scholars')).default([]),
    sources: z.array(sourceRef).min(1, 'Kamida bitta umumiy manba shart'),
    ...verificationFields,
  }),
});

const peoples = defineCollection({
  loader: glob({ pattern: '*/**/*.mdx', base: './src/content/peoples' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    factsId: reference('peopleFacts'),
    ...translationFields,
  }),
});

// --- Tarixiy davlatlar ---
const stateFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/states-facts' }),
  schema: z.object({
    endonym: z.string().optional(),
    period: z.object({
      startYear: z.number().int(),
      startEra: z.enum(['m.av', 'milodiy']),
      endYear: z.number().int(),
      endEra: z.enum(['m.av', 'milodiy']),
    }),
    capital: z.string().optional(),
    predecessors: z.array(reference('states')).default([]),
    successors: z.array(reference('states')).default([]),
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
    ...translationFields,
  }),
});

// --- Olim va ulamolar ---
const scholarFacts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/scholars-facts' }),
  schema: z.object({
    birthYear: z.number().int().optional(),
    birthEra: z.enum(['m.av', 'milodiy']).default('milodiy'),
    deathYear: z.number().int().optional(),
    deathEra: z.enum(['m.av', 'milodiy']).default('milodiy'),
    datesUncertain: z.boolean().default(false),
    field: z.array(z.string()).min(1, "Faoliyat sohasi (soha) ko'rsatilishi shart"),
    relatedPeoples: z.array(reference('peopleFacts')).default([]),
    relatedStates: z.array(reference('states')).default([]),
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
};
