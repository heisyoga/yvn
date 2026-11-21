import assert from 'node:assert/strict';
import test from 'node:test';
import { PORTFOLIO_DATA, SUPPORTED_LANGUAGES } from '../data/portfolioData.ts';
import { deserializePortfolioSheets, serializePortfolioSheets, type PortfolioSheetRows } from './portfolioSheetStore.ts';

test('serializes every locale and portfolio entity into its own tab rows', () => {
  const rows = serializePortfolioSheets(PORTFOLIO_DATA);
  assert.deepEqual(Object.keys(rows).sort(), ['Certificates', 'Copy', 'Experiences', 'Profile', 'Projects', 'SEO', 'Skills'].sort());
  assert.equal(rows.Profile.length, SUPPORTED_LANGUAGES.length + 1);
  assert.equal(rows.Experiences.length, Object.values(PORTFOLIO_DATA).reduce((n, locale) => n + locale.experiences.length, 1));
  assert.equal(rows.Projects.length, Object.values(PORTFOLIO_DATA).reduce((n, locale) => n + locale.projects.length, 1));
  assert.deepEqual(rows.Profile[0], ['locale', 'id', 'data']);
});

test('round trips all locales and content through entity tab rows', () => {
  const rows = serializePortfolioSheets(PORTFOLIO_DATA);
  const result = deserializePortfolioSheets(rows);
  assert.deepEqual(Object.keys(result), Object.keys(PORTFOLIO_DATA));
  for (const language of SUPPORTED_LANGUAGES) {
    assert.deepEqual(result[language].profile, PORTFOLIO_DATA[language].profile);
    assert.deepEqual(result[language].experiences, PORTFOLIO_DATA[language].experiences);
    assert.deepEqual(result[language].certificates, PORTFOLIO_DATA[language].certificates);
    assert.deepEqual(result[language].projects, PORTFOLIO_DATA[language].projects);
    assert.deepEqual(result[language].skills, PORTFOLIO_DATA[language].skills);
    assert.deepEqual(result[language].copy, PORTFOLIO_DATA[language].copy);
    assert.ok(result[language].seo?.title);
  }
});

test('allows empty collections but rejects malformed entity rows', () => {
  const rows = serializePortfolioSheets(PORTFOLIO_DATA);
  const incomplete = { ...rows, Projects: [['locale', 'id', 'data']] } as PortfolioSheetRows;
  assert.equal(deserializePortfolioSheets(incomplete).id.projects.length, 0);
  const malformed = { ...rows, Skills: [...rows.Skills, ['id', 'react', '{bad-json}']] } as PortfolioSheetRows;
  assert.throws(() => deserializePortfolioSheets(malformed), /Skills/);
});
