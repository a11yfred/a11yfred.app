import fs from 'fs';

const readJSON = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
};

// Category keywords to add based on content context
const categoryKeywords = {
  'button': ['button', 'buttons', 'click', 'clickable', 'control'],
  'form': ['form', 'forms', 'input', 'field', 'fields', 'fieldset'],
  'dialog': ['dialog', 'modal', 'modal dialog', 'popup', 'popover'],
  'navigation': ['navigation', 'nav', 'menu', 'breadcrumb', 'navigation menu'],
  'image': ['image', 'img', 'picture', 'photo', 'icon', 'alt text'],
  'heading': ['heading', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'title'],
  'link': ['link', 'links', 'anchor', 'href'],
  'validation': ['validation', 'error', 'required', 'validation message'],
  'announcement': ['announcement', 'announce', 'live region', 'aria-live'],
  'visibility': ['visible', 'visibility', 'hidden', 'display', 'show', 'hide'],
};

function addMissingKeywords(entry) {
  const titleLower = (entry.title || '').toLowerCase();
  const descLower = (entry.desc || '').toLowerCase();
  const remLower = (entry.rem || '').toLowerCase();
  const combinedLower = titleLower + ' ' + descLower + ' ' + remLower;

  const currentKeywords = entry.keywords || [];
  const currentKeywordsLower = currentKeywords.map(k => k.toLowerCase());

  const toAdd = [];

  // Check for each category
  Object.entries(categoryKeywords).forEach(([category, variants]) => {
    // Check if any variant exists in current keywords
    const hasCategory = variants.some(v =>
      currentKeywordsLower.includes(v.toLowerCase()) ||
      combinedLower.includes(v.toLowerCase())
    );

    // If category keywords are mentioned in content but not in keywords array, add primary variant
    if (combinedLower.includes(variants[0].toLowerCase()) && !currentKeywordsLower.includes(variants[0].toLowerCase())) {
      if (!toAdd.includes(variants[0])) {
        toAdd.push(variants[0]);
      }
    }
  });

  // Add new keywords to the array
  if (toAdd.length > 0) {
    entry.keywords = [...new Set([...currentKeywords, ...toAdd])].sort();
    return toAdd;
  }

  return [];
}

function processCorpus(filePath, name) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`ADDING KEYWORDS: ${name}`);
  console.log('='.repeat(70));

  const corpus = readJSON(filePath);
  let totalAdded = 0;
  const changesByEntry = [];

  corpus.forEach(entry => {
    const added = addMissingKeywords(entry);
    if (added.length > 0) {
      totalAdded += added.length;
      changesByEntry.push({
        id: entry.id,
        title: entry.title,
        added
      });
    }
  });

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));

  console.log(`\n✅ Added ${totalAdded} keywords across ${changesByEntry.length} entries`);

  if (changesByEntry.length > 0) {
    console.log(`\nFirst 10 entries updated:`);
    changesByEntry.slice(0, 10).forEach(({ id, title, added }) => {
      console.log(`  ${id} (${title.substring(0, 40)}): ${added.join(', ')}`);
    });
  }

  return totalAdded;
}

// Process both corpora
const publicAdded = processCorpus('src/data/corpus.json', 'Public Corpus');
const personalAdded = processCorpus('src/data/personal-corpus.json', 'Personal Corpus');

console.log(`\n${'='.repeat(70)}`);
console.log(`TOTAL: ${publicAdded + personalAdded} keywords added`);
console.log('='.repeat(70));
