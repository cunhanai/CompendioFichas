import { describe, it, expect } from 'vitest';
import {
  changelogSeenBodySchema,
  genericLibraryItemSchema,
  libraryItemIdSchema,
  photoBodySchema,
  updateProfileBodySchema,
} from './validation.js';

function dataUrl(mime: string, bytes: number[] | string): string {
  const buf = typeof bytes === 'string' ? Buffer.from(bytes, 'utf8') : Buffer.from(bytes);
  return `data:image/${mime};base64,${buf.toString('base64')}`;
}

describe('photoBodySchema', () => {
  it('accepts a genuine PNG data URL', () => {
    const url = dataUrl('png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
    expect(photoBodySchema.safeParse({ dataUrl: url }).success).toBe(true);
  });

  it('accepts a genuine JPEG data URL', () => {
    const url = dataUrl('jpeg', [0xff, 0xd8, 0xff, 0, 0, 0]);
    expect(photoBodySchema.safeParse({ dataUrl: url }).success).toBe(true);
  });

  it('accepts a genuine GIF data URL', () => {
    const url = dataUrl('gif', 'GIF89a-fake-but-signature-matches');
    expect(photoBodySchema.safeParse({ dataUrl: url }).success).toBe(true);
  });

  it('accepts a genuine WEBP data URL', () => {
    const url = dataUrl('webp', 'RIFF\0\0\0\0WEBPfake');
    expect(photoBodySchema.safeParse({ dataUrl: url }).success).toBe(true);
  });

  it('rejects an svg+xml data URL outright, regardless of content', () => {
    const url = `data:image/svg+xml;base64,${Buffer.from(
      '<svg onload="alert(document.cookie)"></svg>',
    ).toString('base64')}`;
    expect(photoBodySchema.safeParse({ dataUrl: url }).success).toBe(false);
  });

  it('rejects content mislabeled as image/png whose bytes are not actually a known image format', () => {
    const url = `data:image/png;base64,${Buffer.from('<script>alert(1)</script>').toString(
      'base64',
    )}`;
    expect(photoBodySchema.safeParse({ dataUrl: url }).success).toBe(false);
  });

  it('rejects a non-data URL', () => {
    expect(photoBodySchema.safeParse({ dataUrl: 'https://evil.com/x.png' }).success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(photoBodySchema.safeParse({ dataUrl: '' }).success).toBe(false);
  });

  it('rejects an uppercase-cased data URL prefix (no real producer emits this)', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]).toString(
      'base64',
    );
    expect(photoBodySchema.safeParse({ dataUrl: `DATA:IMAGE/PNG;BASE64,${png}` }).success).toBe(
      false,
    );
  });
});

describe('updateProfileBodySchema', () => {
  const base = { name: 'Ana', username: 'ana', libraryLocale: 'pt' as const };

  it('accepts a null avatarUrl', () => {
    expect(updateProfileBodySchema.safeParse({ ...base, avatarUrl: null }).success).toBe(true);
  });

  it('accepts an omitted avatarUrl', () => {
    expect(updateProfileBodySchema.safeParse(base).success).toBe(true);
  });

  it('accepts an omitted libraryLocale (AccountCard/AvatarUpload save only name/username/avatar)', () => {
    const { libraryLocale: _libraryLocale, ...withoutLocale } = base;
    expect(updateProfileBodySchema.safeParse(withoutLocale).success).toBe(true);
  });

  it('rejects an unsupported libraryLocale', () => {
    expect(updateProfileBodySchema.safeParse({ ...base, libraryLocale: 'fr' }).success).toBe(false);
  });

  it('accepts a genuine PNG avatarUrl', () => {
    const url = dataUrl('png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
    expect(updateProfileBodySchema.safeParse({ ...base, avatarUrl: url }).success).toBe(true);
  });

  it('rejects an svg+xml avatarUrl, same as the character photo fields', () => {
    const url = `data:image/svg+xml;base64,${Buffer.from(
      '<svg onload="alert(document.cookie)"></svg>',
    ).toString('base64')}`;
    expect(updateProfileBodySchema.safeParse({ ...base, avatarUrl: url }).success).toBe(false);
  });
});

describe('changelogSeenBodySchema', () => {
  it('accepts a well-formed version string', () => {
    expect(changelogSeenBodySchema.safeParse({ version: '2026.11.03-beta' }).success).toBe(true);
  });

  it('rejects an empty version', () => {
    expect(changelogSeenBodySchema.safeParse({ version: '' }).success).toBe(false);
  });

  it('rejects a missing version', () => {
    expect(changelogSeenBodySchema.safeParse({}).success).toBe(false);
  });
});

describe('libraryItemIdSchema', () => {
  it('accepts a well-formed uuid', () => {
    expect(
      libraryItemIdSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' }).success,
    ).toBe(true);
  });

  it('rejects a non-uuid string', () => {
    expect(libraryItemIdSchema.safeParse({ id: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects a missing id', () => {
    expect(libraryItemIdSchema.safeParse({}).success).toBe(false);
  });
});

describe('genericLibraryItemSchema (locale/groupId)', () => {
  const base = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Acuidade com Arma',
    desc: '',
    tag: '',
    groupId: '123e4567-e89b-12d3-a456-426614174001',
  };

  it('accepts a pt item', () => {
    expect(genericLibraryItemSchema.safeParse({ ...base, locale: 'pt' }).success).toBe(true);
  });

  it('accepts an en item', () => {
    expect(genericLibraryItemSchema.safeParse({ ...base, locale: 'en' }).success).toBe(true);
  });

  it('rejects an unsupported locale', () => {
    expect(genericLibraryItemSchema.safeParse({ ...base, locale: 'fr' }).success).toBe(false);
  });

  it('rejects a missing locale', () => {
    const { locale: _locale, ...withoutLocale } = { ...base, locale: 'pt' };
    expect(genericLibraryItemSchema.safeParse(withoutLocale).success).toBe(false);
  });

  it('rejects a missing groupId', () => {
    const { groupId: _groupId, ...withoutGroupId } = base;
    expect(genericLibraryItemSchema.safeParse({ ...withoutGroupId, locale: 'pt' }).success).toBe(
      false,
    );
  });
});
