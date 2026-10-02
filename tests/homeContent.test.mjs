import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/homeContent.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getHomepageReviews, getHomepageCollections } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const review = (slug, date, disable = false) => ({ slug, data: { publishedAt: new Date(date), disable } });
const item = (slug, date, featured = false, disable = false) => ({ slug, data: { acquiredAt: new Date(date), featured, disable } });

test('latest enabled review represents each work, ordered by date', () => {
    const entries = [
        review('game/a/old', '2025-01-01'),
        review('game/b/first', '2026-02-01'),
        review('game/a/new', '2026-03-01'),
        review('game/a/draft', '2026-04-01', true),
        review('game/hidden/first', '2026-05-01', true),
    ];
    const originalOrder = [...entries];
    assert.deepEqual(getHomepageReviews(entries).map(({ slug }) => slug), ['game/a/new', 'game/b/first']);
    assert.deepEqual(entries, originalOrder);
});

test('homepage caps reviews at six and supports smaller topic previews', () => {
    const entries = Array.from({ length: 9 }, (_, i) => review(`game/work-${i}/first`, `2026-01-${String(i + 1).padStart(2, '0')}`));
    assert.equal(getHomepageReviews(entries).length, 6);
    assert.equal(getHomepageReviews(entries, 3).length, 3);
    assert.equal(getHomepageReviews(entries)[0].slug, 'game/work-8/first');
});

test('empty and single-entry archives do not introduce placeholders or duplicates', () => {
    assert.deepEqual(getHomepageReviews([]), []);
    assert.deepEqual(getHomepageCollections([]), []);
    const single = item('citizen/galaxy', '2022-12-02', true);
    assert.deepEqual(getHomepageCollections([single, item('hidden/sample', '2026-01-01', true, true)]), [single]);
    const singleReview = review('anime/work/first', '2026-07-01');
    assert.deepEqual(getHomepageReviews([singleReview]), [singleReview]);
});

test('featured collections precede recent nonfeatured items, with hidden items excluded', () => {
    const entries = [
        item('a', '2025-01-01', true), item('b', '2026-01-01'),
        item('c', '2025-06-01', true), item('d', '2026-02-01'),
        item('hidden', '2026-09-01', true, true),
    ];
    const originalOrder = [...entries];
    assert.deepEqual(getHomepageCollections(entries).map(({ slug }) => slug), ['c', 'a', 'd']);
    assert.deepEqual(entries, originalOrder);
});

test('equal dates produce stable selections independent of input order', () => {
    const entries = [review('game/b/first', '2026-01-01'), review('game/a/first', '2026-01-01')];
    assert.deepEqual(getHomepageReviews(entries), getHomepageReviews([...entries].reverse()));
});
