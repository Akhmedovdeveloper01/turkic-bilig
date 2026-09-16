import { reference, z } from 'astro:content';

/**
 * Loyihaning barcha kontent kolleksiyalarida qayta ishlatiladigan
 * umumiy sxema bo'laklari. ILMIY QOIDALAR (CLAUDE.md) shu yerda
 * majburiylashtiriladi: manbasiz fakt yo'q, verified maydoni majburiy,
 * munozara alohida ajratiladi.
 */

/** `sources` kolleksiyasiga majburiy havola — har bir fakt manbaga bog'lanadi. */
export const sourceRef = reference('sources');

export const reviewSchema = z.object({
  reviewerId: reference('contributors'),
  field: z.string(),
  date: z.coerce.date(),
  result: z.enum(['tasdiqlandi', 'tuzatish-kerak']),
  notes: z.string().optional(),
});

export const changelogEntrySchema = z.object({
  date: z.coerce.date(),
  author: reference('contributors').optional(),
  summary: z.string(),
  type: z.enum(['fakt', 'sana', 'raqam', 'talqin', 'boshqa']).default('boshqa'),
});

/** Munozarali masala: qarashning o'zi tarjima qilinadigan matnda (MDX body) yoziladi,
 * bu yerda faqat mavzu identifikatori va har bir qarash uchun majburiy manbalar saqlanadi. */
export const disputedTopicSchema = z.object({
  topic: z.string(),
  sourceIds: z.array(sourceRef).min(1, "Munozarali masalaning har bir qarashi kamida bitta manbaga bog'lanishi shart"),
});

/** Ilmiy tekshiruv holati — inson muharrir tasdiqlamaguncha `verified` false bo'lib qoladi. */
export const verificationFields = {
  verified: z.boolean().default(false),
  lastReviewed: z.coerce.date().optional(),
  reviews: z.array(reviewSchema).default([]),
  changelog: z.array(changelogEntrySchema).default([]),
  disputed: z.array(disputedTopicSchema).default([]),
};

/** Aniq manbani bilmasangiz shu holatni ishlating — hech qachon manbani o'ylab topmang. */
export const sourceStatus = z.enum(['tayyor', 'tekshirilishi-kerak']).default('tayyor');

export const translationStatus = z.enum(['yoq', 'mashina', 'tahrirlangan', 'tasdiqlangan']);

/** Tarjima faylining (peoples/{til}/{slug}.mdx kabi) frontmatteridagi umumiy maydonlar. */
export const translationFields = {
  translatedFrom: z.string().default('uz'),
  translationStatus: translationStatus.default('tasdiqlangan'),
  translator: reference('contributors').optional(),
  reviewedBy: z.array(reference('contributors')).default([]),
};
