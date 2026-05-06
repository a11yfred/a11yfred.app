import fs from 'fs';

// Remove BOM if present
const readJSON = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
};

const publicCorpus = readJSON('src/data/corpus.json');
const personalCorpus = readJSON('src/data/personal-corpus.json');

// Jargon dictionary for consistency checking
const JARGON_VARIANTS = {
  'accessible name': ['accessible name', 'accessible names', 'accessible label'],
  'focus management': ['focus management', 'focus handling', 'move focus'],
  'focus trap': ['focus trap', 'focus trapping', 'trap focus'],
  'keyboard user': ['keyboard user', 'keyboard users', 'keyboard-only user'],
  'live region': ['live region', 'live regions', 'aria-live'],
  'screen reader': ['screen reader', 'screen readers', 'assistive technology'],
  'landmark': ['landmark', 'landmarks', 'ARIA landmark'],
};

// Common missing keywords patterns
const COMMON_KEYWORDS = {
  'button': ['button', 'buttons', 'click', 'interactive'],
  'form': ['form', 'forms', 'input', 'field', 'fields'],
  'dialog': ['dialog', 'modal', 'modal dialog', 'popup'],
  'navigation': ['navigation', 'nav', 'menu', 'breadcrumb'],
  'image': ['image', 'img', 'picture', 'photo', 'icon'],
};

function checkPassiveVoice(text) {
  // Simple heuristic: look for "be" verbs + past participles
  const passivePatterns = [
    /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi,
    /\b(is|are|was|were)\s+\w+n\b/gi, // forgotten, hidden, etc.
  ];
  const matches = [];
  passivePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[0]);
    }
  });
  return matches;
}

function getSentenceLength(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  return {
    count: lengths.length,
    avgLength: lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b) / lengths.length) : 0,
    maxLength: Math.max(...lengths, 0),
    longSentences: lengths.filter(l => l > 25).length, // >25 words is complex
  };
}

function findMissingKeywords(entry, commonKeywords) {
  const titleText = (entry.title || '').toLowerCase();
  const descText = (entry.desc || '').toLowerCase();
  const fixText = (entry.fix || '').toLowerCase();
  const combinedText = titleText + ' ' + descText + ' ' + fixText;

  const missing = [];
  Object.entries(commonKeywords).forEach(([category, variants]) => {
    // Check if any variant of this category is present
    const found = variants.some(v => combinedText.includes(v.toLowerCase()));
    if (!found && (category.length > 0)) {
      missing.push(category);
    }
  });
  return missing;
}

function checkJargonConsistency(entry) {
  const text = (entry.desc + ' ' + entry.fix).toLowerCase();
  const issues = [];

  Object.entries(JARGON_VARIANTS).forEach(([primary, variants]) => {
    const foundVariants = variants.filter(v => text.includes(v.toLowerCase()));
    if (foundVariants.length > 1) {
      issues.push(`Mixed variants of "${primary}": ${foundVariants.join(', ')}`);
    }
  });

  return issues;
}

function checkReadingLevel(text, isPublic) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const avgLength = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
    : 0;

  if (isPublic && avgLength > 20) {
    return `Sentence too long for ESL (avg ${Math.round(avgLength)} words)`;
  }
  if (!isPublic && avgLength < 10) {
    return `Sentences too simple for personal corpus (avg ${Math.round(avgLength)} words)`;
  }
  return null;
}

function findMissingRelatedLinks(entry, allEntries) {
  // Find entries with same or related WCAG SC
  const sameSC = allEntries.filter(e =>
    e.id !== entry.id &&
    e.sc === entry.sc &&
    !entry.related?.includes(e.scLabel)
  );
  return sameSC.map(e => e.id);
}

function auditCorpus(corpus, name) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`AUDIT: ${name} (${corpus.length} entries)`);
  console.log('='.repeat(80));

  const isPublic = name.includes('Public');
  const issues = [];
  const jargonIssues = new Map();
  const readingLevelIssues = [];
  const missingKeywords = new Map();
  const potentialPassive = [];
  const missingRelated = [];

  corpus.forEach(entry => {
    // 1. Check for passive voice
    const passiveMatches = checkPassiveVoice(entry.desc + ' ' + entry.fix);
    if (passiveMatches.length > 0) {
      potentialPassive.push({ id: entry.id, examples: passiveMatches.slice(0, 2) });
    }

    // 2. Check reading level
    const descLevel = checkReadingLevel(entry.desc, isPublic);
    const fixLevel = checkReadingLevel(entry.fix, isPublic);
    if (descLevel) readingLevelIssues.push({ id: entry.id, issue: descLevel });
    if (fixLevel) readingLevelIssues.push({ id: entry.id, issue: fixLevel });

    // 3. Check jargon consistency
    const jargonProbs = checkJargonConsistency(entry);
    if (jargonProbs.length > 0) {
      jargonIssues.set(entry.id, jargonProbs);
    }

    // 4. Find missing keywords
    const missing = findMissingKeywords(entry, COMMON_KEYWORDS);
    if (missing.length > 0) {
      missingKeywords.set(entry.id, missing);
    }

    // 5. Check for missing related links
    const missingRel = findMissingRelatedLinks(entry, corpus);
    if (missingRel.length > 0) {
      missingRelated.push({ id: entry.id, missing: missingRel });
    }
  });

  console.log(`\n📊 SUMMARY`);
  console.log(`  Potential passive voice: ${potentialPassive.length} entries`);
  console.log(`  Reading level issues: ${readingLevelIssues.length} entries`);
  console.log(`  Jargon inconsistencies: ${jargonIssues.size} entries`);
  console.log(`  Missing keywords: ${missingKeywords.size} entries`);
  console.log(`  Missing related links: ${missingRelated.length} entries`);

  if (potentialPassive.length > 0) {
    console.log(`\n⚠️  PASSIVE VOICE EXAMPLES (first 10)`);
    potentialPassive.slice(0, 10).forEach(({ id, examples }) => {
      console.log(`  ${id}: ${examples.join('; ')}`);
    });
  }

  if (readingLevelIssues.length > 0) {
    console.log(`\n📚 READING LEVEL ISSUES (first 10)`);
    readingLevelIssues.slice(0, 10).forEach(({ id, issue }) => {
      console.log(`  ${id}: ${issue}`);
    });
  }

  if (jargonIssues.size > 0) {
    console.log(`\n🔤 JARGON INCONSISTENCIES (first 10)`);
    Array.from(jargonIssues.entries()).slice(0, 10).forEach(([id, probs]) => {
      console.log(`  ${id}:`);
      probs.forEach(p => console.log(`    - ${p}`));
    });
  }

  if (missingKeywords.size > 0) {
    console.log(`\n🔑 MISSING KEYWORDS (first 15 entries)`);
    Array.from(missingKeywords.entries()).slice(0, 15).forEach(([id, missing]) => {
      console.log(`  ${id}: ${missing.join(', ')}`);
    });
  }

  if (missingRelated.length > 0) {
    console.log(`\n🔗 MISSING RELATED LINKS (first 10)`);
    missingRelated.slice(0, 10).forEach(({ id, missing }) => {
      console.log(`  ${id}: could link to ${missing.join(', ')}`);
    });
  }

  return {
    name,
    potentialPassive,
    readingLevelIssues,
    jargonIssues,
    missingKeywords,
    missingRelated,
  };
}

// Run audits
const publicAudit = auditCorpus(publicCorpus, 'Public Corpus');
const personalAudit = auditCorpus(personalCorpus, 'Personal Corpus');

// Save findings to file
const findings = {
  timestamp: new Date().toISOString(),
  public: publicAudit,
  personal: personalAudit,
};

fs.writeFileSync('CORPUS_AUDIT_FINDINGS.json', JSON.stringify(findings, null, 2));
console.log('\n\n✅ Findings saved to CORPUS_AUDIT_FINDINGS.json');
