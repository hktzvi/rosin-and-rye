const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../public/blog');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) fm[m[1]] = m[2];
  }
  return fm;
}

function extractBlogPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  files.forEach(file => {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const fm = parseFrontmatter(content);

    if (!fm.title || !fm.date || fm.draft === 'true') return;

    posts.push({
      slug: fm.slug ?? slug,
      title: fm.title,
      author: fm.author ?? '',
      date: fm.date,
    });
  });

  return posts;
}

function getPostDescription(slug) {
  try {
    const postPath = path.join(BLOG_DIR, `${slug}.md`);
    const content = fs.readFileSync(postPath, 'utf8');

    // Strip frontmatter block before extracting description
    const body = content.replace(/^---[\s\S]*?---\r?\n/, '');

    // Check if frontmatter has a description field
    const fm = parseFrontmatter(content);
    if (fm.description) return fm.description;

    let plainText = body
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return plainText.length > 250 ? plainText.substring(0, 250).trim() + '...' : plainText;
  } catch (error) {
    console.warn(`Warning: Could not read post content for ${slug}:`, error.message);
    return 'Blog post content not available.';
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toUTCString();
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateRSS(blogPosts) {
  const now = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Rosin &amp; Rye</title>
    <link>https://rosinandrye.com</link>
    <description>Rosin &amp; Rye — ideas, experiments, and things worth writing about.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
`;

  blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  blogPosts.forEach(post => {
    const pubDate = formatDate(post.date);
    const postUrl = `https://rosinandrye.com/blog/${post.slug}`;
    const description = getPostDescription(post.slug);

    rss += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author)}</author>
      <guid>${postUrl}</guid>
    </item>`;
  });

  rss += `
  </channel>
</rss>`;

  return rss;
}

function main() {
  try {
    console.log('Generating RSS feed...');

    const blogPosts = extractBlogPosts();
    console.log(`Found ${blogPosts.length} blog post(s)`);

    if (blogPosts.length === 0) {
      console.warn('No blog posts found, creating empty RSS feed');
    } else {
      blogPosts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.author} (${post.date})`);
      });
    }

    const rssContent = generateRSS(blogPosts);
    const outputPath = path.join(__dirname, '../public/feed.rss');

    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, rssContent);
    console.log(`RSS feed generated successfully: ${outputPath}`);

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractBlogPosts, generateRSS, getPostDescription };
