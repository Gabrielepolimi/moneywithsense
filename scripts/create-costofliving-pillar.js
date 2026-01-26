/**
 * 🏛️ Create Cost of Living Category and Pillar Page
 *
 * Creates the "Cost of Living" category and the pillar guide page
 * that all cost-of-living articles will link to.
 */

import { createClient } from '@sanity/client';
import {
  getDefaultAuthorId,
  getCategoryIdBySlug,
  markdownToBlockContent,
  slugify
} from './sanity-helpers.js';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

/**
 * Create Cost of Living category
 */
async function createCategory() {
  try {
    // Check if category already exists
    const existing = await getCategoryIdBySlug('cost-of-living');
    if (existing) {
      console.log(`✅ Category "Cost of Living" already exists (${existing})`);
      return existing;
    }
    
    // Create category
    const category = await sanityClient.create({
      _type: 'category',
      title: 'Cost of Living',
      slug: { current: 'cost-of-living' },
      description: 'Articles about cost of living by city, country comparisons, and budget planning guides.',
      icon: '🏙️'
    });
    
    console.log(`✅ Created category "Cost of Living" (${category._id})`);
    return category._id;
  } catch (error) {
    console.error('❌ Error creating category:', error.message);
    throw error;
  }
}

/**
 * Create pillar page
 */
async function createPillarPage(categoryId) {
  try {
    // Check if pillar already exists
    const existing = await sanityClient.fetch(`*[
      _type == "post" && 
      slug.current == "cost-of-living-guide-2026"
    ][0]{ _id }`);
    
    if (existing) {
      console.log(`✅ Pillar page already exists (${existing._id})`);
      return existing._id;
    }
    
    const authorId = await getDefaultAuthorId();
    if (!authorId) {
      throw new Error('No author found. Create an author first.');
    }
    
    // Generate pillar content (basic structure, can be enhanced manually)
    const pillarContent = `## What is Cost of Living?

Cost of living refers to the amount of money needed to maintain a certain standard of living in a specific location. It includes expenses like housing, food, transportation, healthcare, and entertainment.

Understanding cost of living helps you:
- Plan your budget before moving
- Compare cities and countries
- Make informed financial decisions
- Set realistic savings goals

## How We Calculate Cost of Living

Our cost of living estimates are based on:
- Public rental listings and property data
- Consumer price indices
- Local cost databases
- Typical lifestyle assumptions

**Important:** All estimates are ranges, not precise numbers. Costs vary significantly by:
- Neighborhood within a city
- Lifestyle choices
- Family size
- Personal preferences

## Key Cost Categories

### Housing
Rent or mortgage payments are usually the largest expense. We provide ranges for:
- City center apartments
- Outside city center options
- Different apartment sizes

### Food & Groceries
Monthly grocery costs depend on:
- Eating habits
- Dietary preferences
- Shopping locations (markets vs supermarkets)

### Transportation
Costs include:
- Public transport passes
- Car ownership (if applicable)
- Occasional taxis or rideshares

### Utilities
Monthly bills for:
- Electricity
- Water
- Gas
- Internet and phone

### Entertainment & Lifestyle
Variable costs for:
- Dining out
- Entertainment
- Hobbies
- Social activities

## How to Use Our Guides

1. **Start with the range:** Use our min/max estimates as a starting point
2. **Adjust for your lifestyle:** Add or subtract based on your preferences
3. **Validate locally:** Check local rental sites, grocery stores, and expat forums
4. **Plan for variability:** Budget for the higher end of ranges to be safe

## Common Mistakes to Avoid

- Assuming costs are fixed (they vary by neighborhood and lifestyle)
- Not accounting for one-time moving costs
- Forgetting about taxes and insurance
- Underestimating healthcare costs
- Not planning for currency fluctuations (if moving internationally)

## Quick Checklist

- [ ] Research housing costs in your target neighborhoods
- [ ] Calculate transportation needs (car vs public transport)
- [ ] Estimate food costs based on your eating habits
- [ ] Factor in utilities and internet
- [ ] Budget for entertainment and lifestyle
- [ ] Add 10-20% buffer for unexpected expenses
- [ ] Validate estimates with local sources
- [ ] Plan for currency exchange (if applicable)

## FAQ

### How accurate are these estimates?

Our estimates are based on typical ranges from public sources. They provide a starting point, but actual costs vary by neighborhood, lifestyle, and personal choices. Always validate with local sources.

### Should I budget for the minimum or maximum?

We recommend budgeting for the higher end of ranges to be safe. It's better to overestimate and have extra money than to underestimate and struggle.

### How often are estimates updated?

We update estimates annually, but costs can change throughout the year. Always check current local prices when making financial decisions.

### Can I use these estimates for visa applications?

These estimates are for informational purposes only. For visa applications, check official government requirements and consult with immigration professionals.

### How do I validate costs locally?

- Check local rental websites (Zillow, Rightmove, etc.)
- Visit grocery stores online or in person
- Join expat forums and Facebook groups
- Talk to locals or expats living in the area
- Use cost-of-living calculators from official sources

## Conclusion

Understanding cost of living is essential for financial planning, whether you're moving to a new city or just curious about expenses elsewhere. Use our guides as a starting point, but always validate with local sources and adjust for your personal situation.

Remember: These estimates are ranges, not guarantees. Your actual costs will depend on your lifestyle, neighborhood, and personal choices.

**Disclaimer:** This content is for informational purposes only and does not constitute financial advice. Always consult a qualified professional for personalized guidance.`;

    const bodyBlocks = markdownToBlockContent(pillarContent);
    
    const pillar = await sanityClient.create({
      _type: 'post',
      title: 'Cost of Living Guide (2026): How to Estimate Your Monthly Budget',
      slug: { current: 'cost-of-living-guide-2026' },
      excerpt: 'Learn how to estimate your monthly budget in any city. Understand cost categories, validate estimates locally, and avoid common budgeting mistakes.',
      author: { _type: 'reference', _ref: authorId },
      categories: [{ _type: 'reference', _ref: categoryId }],
      body: bodyBlocks,
      readingTime: 10,
      initialLikes: 0,
      seoTitle: 'Cost of Living Guide 2026: Estimate Monthly Budget by City',
      seoDescription: 'Complete guide to estimating cost of living in any city. Learn how to calculate monthly expenses, validate costs locally, and plan your budget.',
      seoKeywords: ['cost of living', 'monthly budget', 'living expenses', 'city costs', 'budget planning'],
      status: 'published',
      publishedAt: new Date().toISOString(),
      contentSeries: 'cost-of-living',
      primaryKeyword: 'cost of living guide 2026'
    });
    
    console.log(`✅ Created pillar page "Cost of Living Guide (2026)" (${pillar._id})`);
    return pillar._id;
  } catch (error) {
    console.error('❌ Error creating pillar page:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🏛️ Creating Cost of Living Category and Pillar Page\n');
  
  try {
    // Create category
    const categoryId = await createCategory();
    
    // Create pillar page
    const pillarId = await createPillarPage(categoryId);
    
    console.log('\n✅ Setup complete!');
    console.log(`   Category ID: ${categoryId}`);
    console.log(`   Pillar ID: ${pillarId}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Review and enhance the pillar page content in Sanity Studio');
    console.log('   2. Add items to the queue: node scripts/costofliving-queue.js add <city> <country>');
    console.log('   3. Test generation: node scripts/ai-costofliving-generator.js "London" "UK" 2026');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
