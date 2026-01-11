import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPosts } from '../../../lib/getPosts';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const siteUrl = 'https://moneywithsense.com';

// Guide data with comprehensive content
const guides: Record<string, {
  title: string;
  category: string;
  categorySlug: string;
  description: string;
  keywords: string;
  icon: string;
  readTime: string;
  intro: string;
  sections: Array<{
    title: string;
    content: string;
    tips?: string[];
  }>;
  commonMistakes: string[];
  checklist: string[];
  faq: Array<{ q: string; a: string }>;
}> = {
  'personal-finance-guide': {
    title: 'The Complete Guide to Personal Finance',
    category: 'Personal Finance',
    categorySlug: 'personal-finance',
    description: 'Everything you need to know about managing your money effectively. From basics to advanced strategies for long-term financial success.',
    keywords: 'personal finance guide, money management, financial planning, financial literacy, money basics',
    icon: '💼',
    readTime: '25 min read',
    intro: `Personal finance is the foundation of your financial well-being. It encompasses everything from how you earn and spend money to how you save, invest, and protect your wealth. Understanding personal finance isn't about becoming a financial expert—it's about making informed decisions that align with your goals and values.

This comprehensive guide will walk you through the core concepts of personal finance, helping you build a solid foundation for financial success regardless of your starting point.`,
    sections: [
      {
        title: 'Why Personal Finance Matters',
        content: `Financial literacy directly impacts every area of your life. When you understand how money works, you make better decisions about earning, spending, saving, and investing. Studies consistently show that people with higher financial literacy accumulate more wealth, carry less debt, and experience less financial stress.

The good news? Personal finance isn't rocket science. Most of it comes down to simple principles applied consistently over time.`,
        tips: [
          'Start where you are—you don\'t need to be perfect',
          'Focus on progress, not perfection',
          'Small changes compound into big results'
        ]
      },
      {
        title: 'Calculate Your Net Worth',
        content: `Your net worth is the single most important number in personal finance. It's simple: Assets (what you own) minus Liabilities (what you owe) equals Net Worth.

Track this number monthly or quarterly. The goal isn't to obsess over it, but to ensure it's moving in the right direction over time. A rising net worth means you're building wealth. A falling one signals you need to make changes.`,
        tips: [
          'Include all assets: savings, investments, property, vehicles',
          'List all debts: credit cards, loans, mortgages',
          'Update quarterly to track progress'
        ]
      },
      {
        title: 'Set Clear Financial Goals',
        content: `Goals give your money a purpose. Without them, you're more likely to spend mindlessly and wonder where your paycheck went. Break your goals into timeframes:

**Short-term (0-1 year):** Build an emergency fund, pay off a credit card, save for a vacation.

**Medium-term (1-5 years):** Save for a down payment, pay off student loans, build a six-month emergency fund.

**Long-term (5+ years):** Retirement savings, college funds for kids, financial independence.

Make each goal SMART: Specific, Measurable, Achievable, Relevant, and Time-bound.`
      },
      {
        title: 'The Personal Finance Framework',
        content: `Here's a simple framework to organize your finances:

1. **Track everything** – Know where your money goes
2. **Build a budget** – Give every dollar a job
3. **Eliminate high-interest debt** – Pay off credit cards first
4. **Build an emergency fund** – 3-6 months of expenses
5. **Invest for the future** – Start with retirement accounts
6. **Protect what you have** – Insurance and estate planning

This order matters. There's no point investing if you're paying 20% interest on credit card debt. Get the basics right first.`
      }
    ],
    commonMistakes: [
      'Not tracking spending – you can\'t manage what you don\'t measure',
      'Ignoring high-interest debt while trying to invest',
      'No emergency fund – one unexpected expense derails everything',
      'Lifestyle inflation – spending more as you earn more',
      'Waiting to start – time in the market beats timing the market'
    ],
    checklist: [
      'Calculate your net worth',
      'List all income sources',
      'Track all expenses for 30 days',
      'Identify 3 areas to reduce spending',
      'Set one short-term and one long-term goal',
      'Open a high-yield savings account',
      'Review your credit report (free annually)'
    ],
    faq: [
      {
        q: 'How much should I save each month?',
        a: 'Aim for at least 20% of your income. Start with whatever you can and increase over time. Even 5% is better than nothing.'
      },
      {
        q: 'Should I pay off debt or save first?',
        a: 'Build a small emergency fund ($1,000) first, then attack high-interest debt aggressively. Once debt is gone, build your full emergency fund.'
      },
      {
        q: 'When should I start investing?',
        a: 'After you have an emergency fund and no high-interest debt. If your employer offers a 401(k) match, contribute enough to get the full match even while paying off debt—it\'s free money.'
      }
    ]
  },
  'saving-money-guide': {
    title: 'Saving Money: A Comprehensive Guide',
    category: 'Saving Money',
    categorySlug: 'saving-money',
    description: 'Practical strategies to reduce expenses, build an emergency fund, and grow your savings faster than you thought possible.',
    keywords: 'saving money tips, how to save money, emergency fund, reduce expenses, frugal living',
    icon: '💰',
    readTime: '20 min read',
    intro: `Saving money is the cornerstone of financial security. It's not about deprivation—it's about making intentional choices that align with your priorities. Whether you want to build an emergency fund, save for a house, or simply stress less about money, the principles are the same.

This guide covers practical, actionable strategies to help you save more without feeling like you're constantly sacrificing.`,
    sections: [
      {
        title: 'Why Saving Money Matters',
        content: `Savings provide options. They give you the freedom to handle emergencies without debt, take advantage of opportunities, and eventually stop trading time for money. The path to financial independence starts with the gap between what you earn and what you spend.

A simple truth: you can only cut expenses so much, but you can increase income infinitely. Still, optimizing your spending is the fastest way to see immediate results.`
      },
      {
        title: 'Build Your Emergency Fund First',
        content: `Before anything else, build an emergency fund. This is money set aside for true emergencies: job loss, medical bills, major car repairs. Without it, one unexpected expense can spiral into debt.

**Phase 1:** Save $1,000 as fast as possible. This covers minor emergencies.

**Phase 2:** Build up to 3-6 months of essential expenses. This protects against job loss.

Keep this money in a high-yield savings account—accessible but separate from your checking.`,
        tips: [
          'Automate transfers on payday',
          'Name the account "Emergency Fund" for psychological separation',
          'Only touch it for true emergencies'
        ]
      },
      {
        title: 'Cut the Big Three',
        content: `Most budgets have three major expenses: housing, transportation, and food. Optimizing these has the biggest impact.

**Housing:** Keep it under 30% of income. Consider house hacking, getting a roommate, or moving to a lower-cost area.

**Transportation:** Buy reliable used cars, consider public transit, or bike if possible. A $400/month car payment is $4,800/year you could invest.

**Food:** Meal prep, cook at home, use grocery lists. Eating out is convenient but expensive.`
      },
      {
        title: 'Automate Your Savings',
        content: `Willpower is limited. Automate your finances so saving happens without thinking about it.

Set up automatic transfers from checking to savings on payday. The money moves before you see it, and you adjust your spending to what's left. This "pay yourself first" approach is the single most effective saving strategy.

Start with a percentage you can handle—even 5%—and increase it by 1% every few months.`
      }
    ],
    commonMistakes: [
      'No emergency fund – relying on credit cards instead',
      'Cutting too aggressively – leading to burnout and binge spending',
      'Ignoring the big three while obsessing over small expenses',
      'Keeping savings in a low-interest checking account',
      'Not automating – relying on willpower alone'
    ],
    checklist: [
      'Open a high-yield savings account',
      'Set up automatic transfers on payday',
      'Calculate your monthly essential expenses',
      'Set emergency fund target (3-6 months expenses)',
      'Review subscriptions and cancel unused ones',
      'Plan meals for the week',
      'Research ways to reduce housing or transportation costs'
    ],
    faq: [
      {
        q: 'How much should I have in my emergency fund?',
        a: '3-6 months of essential expenses. If you have a stable job with multiple income sources, 3 months may be enough. If your income is variable or you\'re the sole earner, aim for 6 months or more.'
      },
      {
        q: 'Where should I keep my emergency fund?',
        a: 'A high-yield savings account. It should be accessible within a few days but not so easy to access that you\'re tempted to spend it. Don\'t invest your emergency fund—you need it available when emergencies happen.'
      },
      {
        q: 'I can\'t seem to save anything. Where do I start?',
        a: 'Track every expense for 30 days. You\'ll be surprised where money goes. Then identify one or two areas to cut. Even $50/month is a start. Automate that amount into savings and build from there.'
      }
    ]
  },
  'budgeting-guide': {
    title: 'Budgeting That Actually Works',
    category: 'Budgeting',
    categorySlug: 'budgeting',
    description: 'Find the budgeting method that fits your life. From zero-based to 50/30/20, we cover proven approaches that stick.',
    keywords: 'budgeting guide, budget methods, 50/30/20 rule, zero-based budget, how to budget',
    icon: '📊',
    readTime: '22 min read',
    intro: `A budget is simply a plan for your money. It's not about restriction—it's about intention. When you budget, you decide in advance where your money goes instead of wondering where it went.

The best budget is one you'll actually follow. This guide covers multiple approaches so you can find the method that fits your personality and lifestyle.`,
    sections: [
      {
        title: 'Why Budgeting Works',
        content: `People who budget consistently build wealth faster than those who don't. Why? Because awareness drives behavior change. When you know you've allocated $200 for dining out, you think twice before that third restaurant trip.

Budgeting isn't about perfection. It's about progress. Even a rough budget beats no budget at all.`
      },
      {
        title: 'The 50/30/20 Method',
        content: `This simple framework allocates your after-tax income into three buckets:

**50% Needs:** Housing, utilities, groceries, insurance, minimum debt payments—things you must pay.

**30% Wants:** Dining out, entertainment, hobbies, subscriptions—things you enjoy but could live without.

**20% Savings & Debt:** Extra debt payments, emergency fund, investments, retirement.

This method works well for beginners because it's simple and flexible. You don't track every dollar—just ensure each category stays within its limit.`,
        tips: [
          'If needs exceed 50%, focus on reducing housing or transportation',
          'The 20% savings is a minimum—more is better',
          'Adjust ratios based on your goals and income'
        ]
      },
      {
        title: 'Zero-Based Budgeting',
        content: `With zero-based budgeting, every dollar gets a job. Income minus all allocated spending equals zero. Nothing is left unassigned.

At the start of each month, list your income and assign every dollar to a category: rent, groceries, savings, fun money, etc. If you have $100 left over, decide where it goes—extra debt payment, savings, or a specific goal.

This method requires more effort but provides maximum control. It's ideal for people who want to optimize every dollar or who have variable income.`
      },
      {
        title: 'Envelope System',
        content: `The envelope system uses cash for variable spending categories. You put a set amount of cash in envelopes labeled "Groceries," "Dining Out," "Entertainment," etc. When the envelope is empty, you stop spending in that category.

This tactile approach makes spending feel real. Swiping a card is painless; handing over cash hurts a little. That friction reduces overspending.

You can also use virtual envelopes through apps if cash feels outdated.`
      },
      {
        title: 'Pay Yourself First',
        content: `This isn't a full budget method but a philosophy that works with any approach. When money hits your account, immediately move a portion to savings or investments. Then spend what's left.

Most people spend first and save what's left (usually nothing). Reversing the order ensures saving actually happens.`
      }
    ],
    commonMistakes: [
      'Making the budget too restrictive – setting yourself up for failure',
      'Not including a "fun money" category',
      'Forgetting irregular expenses (car registration, annual subscriptions)',
      'Not reviewing and adjusting monthly',
      'Giving up after one bad month'
    ],
    checklist: [
      'Choose a budgeting method that fits your style',
      'Calculate your monthly after-tax income',
      'List all fixed expenses',
      'List all variable expenses (estimate based on past spending)',
      'Allocate savings/debt payments',
      'Include a buffer for unexpected expenses',
      'Review your budget weekly for the first month'
    ],
    faq: [
      {
        q: 'What\'s the best budgeting app?',
        a: 'It depends on your style. YNAB (You Need A Budget) is great for zero-based budgeting. Mint works for passive tracking. The best app is the one you\'ll actually use consistently.'
      },
      {
        q: 'How do I budget with irregular income?',
        a: 'Budget based on your lowest expected income month. When you earn more, put the extra toward savings or debt. Consider zero-based budgeting since you allocate what you actually have each month.'
      },
      {
        q: 'Should my partner and I have separate or joint budgets?',
        a: 'Both approaches work. Many couples use a hybrid: joint account for shared expenses, individual accounts for personal spending. The key is communication and shared financial goals.'
      }
    ]
  },
  'investing-basics-guide': {
    title: 'Investing Basics for Beginners',
    category: 'Investing Basics',
    categorySlug: 'investing-basics',
    description: 'Start your investment journey with confidence. Learn about stocks, bonds, ETFs, and retirement accounts in plain language.',
    keywords: 'investing for beginners, stock market basics, index funds, retirement accounts, how to invest',
    icon: '📈',
    readTime: '30 min read',
    intro: `Investing is how you grow wealth over time. While saving protects your money, investing puts it to work. The stock market has historically returned around 7-10% annually after inflation—far better than any savings account.

You don't need to be rich or a financial genius to invest. With low-cost index funds and retirement accounts, regular people can build significant wealth over time.`,
    sections: [
      {
        title: 'Why Invest?',
        content: `Inflation erodes the value of cash. Money sitting in a savings account loses purchasing power over time. Investing allows your money to grow faster than inflation.

The power of compound growth is remarkable. $10,000 invested at 7% annual return becomes $76,000 in 30 years—without adding a single dollar. Start early, stay consistent, and let time do the heavy lifting.`
      },
      {
        title: 'Stocks vs. Bonds',
        content: `**Stocks** represent ownership in companies. They offer higher potential returns but more volatility. Stock prices can swing wildly day-to-day, but historically they've outperformed other assets over long periods.

**Bonds** are loans to companies or governments. They offer lower returns but more stability. Bonds help balance a portfolio and reduce overall volatility.

A classic guideline: subtract your age from 110 to get your stock percentage. A 30-year-old might hold 80% stocks, 20% bonds. This is just a starting point—adjust based on your risk tolerance and timeline.`
      },
      {
        title: 'Index Funds: The Simple Path',
        content: `Index funds are the best choice for most investors. They hold a basket of stocks that mirror a market index like the S&P 500. Benefits:

**Low fees:** Index funds charge minimal fees since they don't require active management.

**Diversification:** One fund gives you exposure to hundreds of companies.

**Performance:** Most actively managed funds fail to beat index funds over time.

A simple portfolio of 2-3 index funds (US stocks, international stocks, bonds) is all most people need.`,
        tips: [
          'Look for expense ratios below 0.20%',
          'Consider "total market" funds for maximum diversification',
          'Don\'t chase past performance'
        ]
      },
      {
        title: 'Retirement Accounts',
        content: `Tax-advantaged accounts are your best friends. They let your investments grow tax-free or tax-deferred.

**401(k):** Employer-sponsored. Contributions reduce taxable income. Many employers match contributions—that's free money. 2024 contribution limit: $23,000.

**IRA (Traditional or Roth):** Individual accounts. Traditional gives tax deduction now; Roth gives tax-free withdrawals later. 2024 limit: $7,000.

**Order of priority:**
1. Get full 401(k) employer match
2. Max out Roth IRA
3. Max out remaining 401(k) space
4. Taxable brokerage account`
      },
      {
        title: 'Getting Started',
        content: `Starting is simpler than you think:

1. **Open an account:** Choose a low-cost brokerage (Fidelity, Vanguard, Schwab) or use your employer's 401(k).

2. **Choose your investments:** A target-date fund or simple three-fund portfolio works for most people.

3. **Set up automatic contributions:** Even $100/month adds up significantly over time.

4. **Don't touch it:** Leave it alone. Don't panic sell during downturns. Stay the course.`
      }
    ],
    commonMistakes: [
      'Waiting to start – time in market beats timing the market',
      'Trying to pick individual stocks without experience',
      'Paying high fees for actively managed funds',
      'Panic selling during market downturns',
      'Not taking advantage of employer 401(k) match'
    ],
    checklist: [
      'Open a brokerage or retirement account',
      'Ensure you\'re getting full 401(k) match if available',
      'Choose 2-3 low-cost index funds',
      'Set up automatic monthly contributions',
      'Write down your investment plan and risk tolerance',
      'Set a calendar reminder for annual portfolio review',
      'Ignore daily market news'
    ],
    faq: [
      {
        q: 'How much money do I need to start investing?',
        a: 'You can start with as little as $1 at most brokerages. The important thing is to start. Even small amounts grow significantly over decades.'
      },
      {
        q: 'Should I pay off debt or invest?',
        a: 'Pay off high-interest debt (above 7%) first. For lower-interest debt, you can do both—especially if your employer matches 401(k) contributions.'
      },
      {
        q: 'What if the market crashes right after I invest?',
        a: 'Market crashes are normal and temporary. If you\'re investing for 10+ years, downturns are actually buying opportunities. Stay the course and keep contributing.'
      }
    ]
  },
  'passive-income-guide': {
    title: 'Building Passive Income Streams',
    category: 'Passive Income',
    categorySlug: 'passive-income',
    description: 'Explore ways to earn money while you sleep. From dividends to digital products—realistic approaches to passive income.',
    keywords: 'passive income ideas, dividend investing, how to make passive income, income streams',
    icon: '🔄',
    readTime: '18 min read',
    intro: `Passive income is money earned with minimal ongoing effort. Note "minimal"—not "zero." Most passive income requires significant upfront work or capital. But once established, these income streams can generate money while you sleep.

This guide covers realistic passive income strategies, not get-rich-quick schemes. Building meaningful passive income takes time, but it's achievable.`,
    sections: [
      {
        title: 'Understanding Passive Income',
        content: `True passive income is rare. Most "passive" income falls into two categories:

**Portfolio income:** Returns from investments like dividends, interest, and capital gains. Requires capital to start but minimal ongoing effort.

**Semi-passive income:** Businesses or products that require initial effort but generate ongoing revenue with minimal maintenance. Think digital products, rental properties, or content royalties.

Both are valuable. The key is matching your resources (time vs. money) with the right approach.`
      },
      {
        title: 'Dividend Investing',
        content: `Dividend stocks pay you a portion of company profits regularly—usually quarterly. Build a portfolio of dividend-paying stocks or funds, and you receive income without selling shares.

**Dividend yield:** Annual dividends divided by stock price. A 3% yield on $100,000 invested generates $3,000/year.

**Dividend growth:** Companies that consistently increase dividends. A company raising dividends 7% annually doubles your income in 10 years.

Index funds like VYM (Vanguard High Dividend Yield) or SCHD (Schwab US Dividend Equity) provide diversified dividend exposure.`,
        tips: [
          'Reinvest dividends while building wealth',
          'Focus on dividend growth, not just high yield',
          'Diversify across sectors and geographies'
        ]
      },
      {
        title: 'Digital Products',
        content: `Create once, sell forever. Digital products include:

- **Ebooks:** Share expertise in written form
- **Online courses:** Teach a skill you've mastered
- **Templates/tools:** Spreadsheets, design templates, software
- **Stock photos/music:** Creative assets others can license

These require significant upfront work but can generate income for years. The key is solving a specific problem for a specific audience.`
      },
      {
        title: 'Rental Income',
        content: `Real estate can generate reliable passive income, but it's more work than many expect. Options include:

**Traditional rentals:** Buy property, rent it out. Requires capital and involves maintenance, tenant management, and property taxes.

**REITs:** Real Estate Investment Trusts let you invest in real estate without owning property. They trade like stocks and pay dividends.

**House hacking:** Live in one unit of a multi-family property and rent the others. Reduces your housing costs while building equity.`
      }
    ],
    commonMistakes: [
      'Expecting passive income without upfront effort or capital',
      'Chasing high yields without understanding the risks',
      'Underestimating the work involved in "passive" ventures',
      'Not diversifying income streams',
      'Giving up before streams mature'
    ],
    checklist: [
      'Assess your resources: time vs. capital',
      'Choose 1-2 passive income strategies to focus on',
      'If investing: open a brokerage account and research dividend funds',
      'If creating products: identify your expertise and target audience',
      'Set realistic timeline expectations (12-24 months for meaningful income)',
      'Reinvest early passive income to accelerate growth'
    ],
    faq: [
      {
        q: 'How much money do I need to live off passive income?',
        a: 'At a 4% withdrawal rate, you need 25x your annual expenses. To generate $40,000/year, you\'d need about $1 million invested. Building to this level takes time.'
      },
      {
        q: 'What\'s the easiest passive income stream to start?',
        a: 'Dividend investing is the most accessible if you have capital. Open a brokerage account and buy dividend index funds. Digital products are best if you have expertise and time but limited capital.'
      },
      {
        q: 'Are passive income gurus trustworthy?',
        a: 'Be skeptical. Many make more money selling courses about passive income than from actual passive income. Look for people who share realistic timelines and aren\'t just selling dreams.'
      }
    ]
  },
  'credit-debt-guide': {
    title: 'Credit & Debt Management',
    category: 'Credit & Debt',
    categorySlug: 'credit-debt',
    description: 'Master your credit score and develop a plan to become debt-free. Practical strategies that actually work.',
    keywords: 'credit score guide, debt payoff strategies, how to improve credit, debt snowball, debt avalanche',
    icon: '💳',
    readTime: '24 min read',
    intro: `Credit and debt are powerful financial tools—they can accelerate wealth-building or trap you in a cycle of payments. Understanding how credit works and having a debt payoff strategy puts you in control.

This guide covers everything from building excellent credit to eliminating debt systematically.`,
    sections: [
      {
        title: 'Understanding Credit Scores',
        content: `Your credit score (FICO) ranges from 300-850. It affects loan interest rates, apartment applications, insurance premiums, and even job prospects. Five factors determine your score:

**Payment history (35%):** Pay bills on time. One late payment can drop your score significantly.

**Credit utilization (30%):** Keep balances below 30% of credit limits—lower is better.

**Length of credit history (15%):** Older accounts help. Don't close old cards.

**Credit mix (10%):** Having different types of credit (cards, loans) helps slightly.

**New credit (10%):** Too many applications in a short period hurts your score.`
      },
      {
        title: 'Building Credit',
        content: `Starting from scratch? Here's how to build credit:

1. **Secured credit card:** Put down a deposit that becomes your credit limit. Use it for small purchases and pay in full.

2. **Become an authorized user:** Ask a family member with good credit to add you to their card. Their payment history benefits your score.

3. **Credit-builder loan:** Some banks offer small loans specifically designed to build credit.

4. **Report rent payments:** Services like Experian Boost can add rent payments to your credit report.

Building credit takes time. Expect 6-12 months to see meaningful improvement.`,
        tips: [
          'Set up autopay to never miss a payment',
          'Keep credit utilization below 10% for the best scores',
          'Check your credit report annually for errors'
        ]
      },
      {
        title: 'Debt Payoff Strategies',
        content: `Two proven methods to pay off debt:

**Debt Avalanche:** Pay minimums on everything, then throw extra money at the highest-interest debt. Mathematically optimal—saves the most in interest.

**Debt Snowball:** Pay minimums on everything, then throw extra money at the smallest balance. Creates quick wins that build momentum.

Both work. The avalanche saves more money; the snowball provides psychological wins. Choose based on your personality.`
      },
      {
        title: 'Good Debt vs. Bad Debt',
        content: `Not all debt is equal.

**Good debt** can increase your net worth or earning potential:
- Mortgage (building equity, often lower rates than rent)
- Student loans (increases earning potential—ideally)
- Business loans (invests in income-generating assets)

**Bad debt** funds consumption and depreciates:
- Credit card balances (high interest, no asset)
- Car loans on expensive vehicles
- Personal loans for vacations or lifestyle

The goal: eliminate bad debt, use good debt strategically.`
      }
    ],
    commonMistakes: [
      'Only paying minimum payments on credit cards',
      'Closing old credit cards (hurts credit history length)',
      'Ignoring credit report errors',
      'Using balance transfers without paying down debt',
      'Taking on new debt while paying off old debt'
    ],
    checklist: [
      'Check your credit score (free at Credit Karma or through your bank)',
      'Review your credit report for errors (annualcreditreport.com)',
      'List all debts with balances and interest rates',
      'Choose a payoff strategy (avalanche or snowball)',
      'Set up autopay for all bills',
      'Calculate your debt-free date',
      'Identify extra money to throw at debt'
    ],
    faq: [
      {
        q: 'How long does it take to improve my credit score?',
        a: 'Small improvements can happen in 30-60 days. Building excellent credit (750+) from scratch typically takes 12-24 months of consistent positive behavior.'
      },
      {
        q: 'Should I use a debt consolidation loan?',
        a: 'Only if it truly lowers your interest rate AND you commit to not running up new debt. Many people consolidate, then accumulate new debt, making things worse.'
      },
      {
        q: 'Is it bad to carry a credit card balance for my credit score?',
        a: 'No—this is a myth. Pay your balance in full every month. Utilization is measured at statement close, not by carrying a balance. Carrying a balance just costs you interest.'
      }
    ]
  },
  'banking-cards-guide': {
    title: 'Banking & Credit Cards Guide',
    category: 'Banking & Cards',
    categorySlug: 'banking-cards',
    description: 'Choose the right accounts, maximize rewards, and use banking products to your advantage.',
    keywords: 'best bank accounts, credit card rewards, high-yield savings, banking guide',
    icon: '🏦',
    readTime: '16 min read',
    intro: `Your choice of bank accounts and credit cards impacts your finances more than you might think. The right accounts save money on fees, earn interest, and provide valuable rewards. The wrong ones quietly drain your wealth.

This guide helps you optimize your banking setup and use credit cards strategically.`,
    sections: [
      {
        title: 'Choosing a Bank',
        content: `Consider these factors when choosing a bank:

**Fees:** Avoid monthly maintenance fees. Many banks waive fees with minimum balances or direct deposit. Better yet, choose banks with no fees at all.

**Interest rates:** Online banks typically offer 10-20x higher savings rates than traditional banks.

**ATM access:** Check the ATM network. Many online banks reimburse ATM fees.

**Features:** Mobile deposit, bill pay, Zelle, budgeting tools—choose what matters to you.

You don't have to choose one bank. Many people use an online bank for savings (better rates) and a local bank or credit union for checking (easier cash deposits).`
      },
      {
        title: 'High-Yield Savings Accounts',
        content: `If your savings account pays less than 4% APY (as of 2024), you're leaving money on the table. Online banks like Marcus, Ally, and Discover offer significantly higher rates than traditional banks.

On $10,000:
- 0.01% APY (traditional bank): $1/year
- 4.50% APY (online bank): $450/year

Same money, just a different account. The switch takes 15 minutes.`,
        tips: [
          'Compare rates at bankrate.com',
          'Look for no minimum balance requirements',
          'Consider FDIC insurance limit ($250,000 per bank)'
        ]
      },
      {
        title: 'Credit Card Strategy',
        content: `Used responsibly, credit cards offer free money through rewards. Key principles:

**Pay in full every month.** Rewards are worthless if you're paying interest.

**Match cards to spending.** Use cards that reward your biggest spending categories.

**Don't chase too many cards.** Two or three cards is plenty for most people.

Popular reward structures:
- **Flat-rate cards:** 1.5-2% on everything (simple, effective)
- **Category cards:** 3-5% on specific categories (groceries, gas, dining)
- **Travel cards:** Points redeemable for flights and hotels`
      },
      {
        title: 'Account Organization',
        content: `A clean banking setup reduces friction and prevents mistakes:

**Checking account:** For bills and daily spending. Keep 1-2 months of expenses.

**High-yield savings:** Emergency fund and short-term savings goals.

**Retirement accounts:** 401(k) and/or IRA for long-term investing.

**Brokerage account:** For investing beyond retirement accounts.

Automate transfers between accounts so saving and investing happen automatically.`
      }
    ],
    commonMistakes: [
      'Paying unnecessary bank fees',
      'Keeping savings in low-interest accounts',
      'Carrying credit card balances',
      'Having too many accounts to track',
      'Not reviewing statements for errors or fraud'
    ],
    checklist: [
      'Review your current bank fees',
      'Compare high-yield savings account rates',
      'List your credit cards and their rewards',
      'Set up autopay for all credit cards (full balance)',
      'Enable transaction alerts for fraud protection',
      'Review your accounts quarterly for optimization opportunities'
    ],
    faq: [
      {
        q: 'How many bank accounts should I have?',
        a: 'Most people need 2-3: one checking for daily use, one high-yield savings for emergency fund/goals, and investment accounts. Simpler is usually better.'
      },
      {
        q: 'Do credit cards hurt my credit score?',
        a: 'No—when used responsibly, they help. Opening a card creates a small temporary dip, but the increased available credit and payment history boost your score long-term.'
      },
      {
        q: 'Are annual fee credit cards worth it?',
        a: 'Only if the rewards exceed the fee. A $95 annual fee card needs to provide more than $95 in value through rewards, perks, and benefits. Calculate before applying.'
      }
    ]
  },
  'side-hustles-guide': {
    title: 'Side Hustles: Building Extra Income',
    category: 'Side Hustles',
    categorySlug: 'side-hustles',
    description: 'Explore proven side hustle ideas and learn how to build sustainable extra income alongside your main job.',
    keywords: 'side hustle ideas, make extra money, freelancing, gig economy, second income',
    icon: '🚀',
    readTime: '28 min read',
    intro: `A side hustle is any income-generating activity outside your main job. Side hustles can accelerate debt payoff, fund savings goals, or eventually replace your primary income entirely.

This guide covers realistic side hustle options, how to choose one, and how to make it sustainable.`,
    sections: [
      {
        title: 'Why Start a Side Hustle?',
        content: `Side hustles provide benefits beyond extra cash:

**Financial acceleration:** Extra income can dramatically speed up financial goals.

**Income diversification:** Multiple income streams reduce risk if you lose your job.

**Skill development:** Many side hustles build marketable skills.

**Exploration:** Test business ideas without quitting your day job.

**Purpose:** Work on something you're passionate about.

The key is choosing something sustainable—a side hustle you can maintain long-term without burning out.`
      },
      {
        title: 'Service-Based Side Hustles',
        content: `Sell your time and skills for money. Low startup cost but limited by hours in the day.

**Freelancing:** Writing, design, development, marketing, virtual assistance. Platforms like Upwork and Fiverr help you find clients.

**Consulting:** Leverage professional expertise. Former accountants help with taxes; HR professionals assist with hiring.

**Tutoring/coaching:** Teach academic subjects, music, fitness, or professional skills.

**Local services:** Dog walking, lawn care, cleaning, handyman work. Apps like TaskRabbit connect you with local customers.`,
        tips: [
          'Start with skills you already have',
          'Price based on value, not just time',
          'Build a portfolio of work samples'
        ]
      },
      {
        title: 'Product-Based Side Hustles',
        content: `Create or sell products. Higher potential upside but requires more upfront investment.

**Digital products:** Courses, ebooks, templates, apps. Create once, sell repeatedly.

**E-commerce:** Sell physical products through Amazon, Etsy, or your own store.

**Content creation:** Blog, YouTube, podcast. Monetize through ads, sponsorships, or products.

**Print-on-demand:** Design products (shirts, mugs) that are printed when ordered—no inventory required.`
      },
      {
        title: 'Gig Economy',
        content: `Flexible work through apps. Lower earning potential but maximum flexibility.

**Delivery:** DoorDash, Uber Eats, Instacart. Work when you want.

**Rideshare:** Uber, Lyft. Evening and weekend demand is highest.

**Task-based:** TaskRabbit, Handy. Various tasks from assembly to moving help.

These work well for short-term goals but typically don't scale. Consider them a bridge to more lucrative options.`
      },
      {
        title: 'Making It Sustainable',
        content: `Most side hustles fail not from lack of opportunity but from burnout. Protect your sustainability:

**Set boundaries:** Designate specific hours for side hustle work. Don't let it consume all free time.

**Start small:** Begin with 5-10 hours/week. Increase only if you can handle it.

**Protect sleep:** A side hustle isn't worth it if it ruins your health and primary job performance.

**Have an exit strategy:** Know when you'll scale back or stop. Side hustles should serve your goals, not become a burden.`
      }
    ],
    commonMistakes: [
      'Trying too many things at once',
      'Underpricing your services',
      'Neglecting your main job',
      'Not tracking income and expenses for taxes',
      'Burning out by working every spare moment'
    ],
    checklist: [
      'List skills you could monetize',
      'Identify 2-3 side hustle options that interest you',
      'Research the market for your chosen option',
      'Set a weekly hour limit (start with 5-10 hours)',
      'Set a financial goal for your side hustle',
      'Track all income and expenses',
      'Set aside 25-30% for taxes'
    ],
    faq: [
      {
        q: 'How much can I realistically make from a side hustle?',
        a: 'It varies wildly. Gig economy work might net $15-25/hour. Skilled freelancing can exceed $100/hour. Digital products can generate passive income indefinitely. Start with $500-1000/month as an initial target.'
      },
      {
        q: 'Do I need to pay taxes on side hustle income?',
        a: 'Yes. In the US, you must report all income over $400 from self-employment. Set aside 25-30% for taxes and make quarterly estimated payments if you earn significantly.'
      },
      {
        q: 'Will my employer care if I have a side hustle?',
        a: 'Check your employment contract. Most employers don\'t mind as long as it doesn\'t compete with them, use company resources, or affect your job performance. When in doubt, be transparent.'
      }
    ]
  },
  'taxes-guide': {
    title: 'Taxes Made Simple',
    category: 'Taxes & Tips',
    categorySlug: 'taxes-tips',
    description: 'Understand tax basics, common deductions, and strategies to minimize your tax burden legally.',
    keywords: 'tax guide, tax deductions, how to reduce taxes, tax basics, filing taxes',
    icon: '📋',
    readTime: '22 min read',
    intro: `Taxes are complicated, but the basics aren't. Understanding how taxes work helps you make better financial decisions and keep more of what you earn.

This guide covers tax fundamentals for everyday people—not advanced strategies for the wealthy, but practical knowledge you can use.`,
    sections: [
      {
        title: 'How Income Tax Works',
        content: `The US uses a progressive tax system with tax brackets. Higher income is taxed at higher rates, but only the income in each bracket is taxed at that rate.

Example (simplified 2024 brackets for single filers):
- 10% on income $0-$11,600
- 12% on income $11,601-$47,150
- 22% on income $47,151-$100,525

If you earn $60,000, you don't pay 22% on all of it. You pay 10% on the first $11,600, 12% on the next portion, and 22% only on income above $47,150.

Your marginal tax rate (highest bracket) differs from your effective tax rate (what you actually pay overall).`
      },
      {
        title: 'Reducing Taxable Income',
        content: `The best way to lower taxes is to reduce taxable income. Legal methods include:

**Retirement contributions:** 401(k) and Traditional IRA contributions reduce taxable income dollar-for-dollar.

**HSA contributions:** Health Savings Accounts are triple tax-advantaged—contributions are deductible, growth is tax-free, and withdrawals for medical expenses are tax-free.

**Standard vs. itemized deductions:** Most people take the standard deduction ($14,600 single, $29,200 married in 2024). Itemize only if your deductible expenses exceed this.`,
        tips: [
          'Max out tax-advantaged accounts when possible',
          'Keep records of deductible expenses',
          'Bunch deductions in alternate years to exceed standard deduction'
        ]
      },
      {
        title: 'Common Deductions & Credits',
        content: `**Deductions** reduce taxable income. **Credits** reduce taxes owed dollar-for-dollar (more valuable).

Common deductions (if itemizing):
- State and local taxes (SALT, capped at $10,000)
- Mortgage interest
- Charitable donations
- Medical expenses (above 7.5% of AGI)

Common credits:
- Child Tax Credit (up to $2,000 per child)
- Earned Income Tax Credit (for lower incomes)
- Education credits (American Opportunity, Lifetime Learning)
- Saver's Credit (for retirement contributions)`
      },
      {
        title: 'Self-Employment Taxes',
        content: `Side hustles and freelance income come with extra taxes. Self-employed individuals pay both the employer and employee portions of Social Security and Medicare—15.3% total on top of income tax.

The silver lining: self-employed individuals can deduct business expenses:
- Home office (dedicated space)
- Equipment and supplies
- Mileage for business travel
- Health insurance premiums
- Half of self-employment tax

Keep meticulous records. Use accounting software to track income and expenses.`
      }
    ],
    commonMistakes: [
      'Not contributing enough to tax-advantaged accounts',
      'Missing deductions and credits you\'re eligible for',
      'Not keeping records of deductible expenses',
      'Ignoring estimated taxes (self-employed)',
      'Overpaying because you don\'t understand the basics'
    ],
    checklist: [
      'Know your tax bracket and effective tax rate',
      'Max out employer 401(k) match at minimum',
      'Consider Traditional vs. Roth based on current vs. future tax rates',
      'Keep records of deductible expenses throughout the year',
      'Review whether to itemize or take standard deduction',
      'If self-employed, track all business expenses',
      'Make quarterly estimated payments if required'
    ],
    faq: [
      {
        q: 'Should I do my own taxes or hire a professional?',
        a: 'For simple situations (W-2 income, standard deduction), tax software works fine. If you have self-employment income, rental properties, or complex situations, a CPA may save you money.'
      },
      {
        q: 'Traditional or Roth retirement accounts?',
        a: 'Roth if you expect higher taxes in retirement (younger, lower income now). Traditional if you expect lower taxes later. When unsure, diversifying between both is reasonable.'
      },
      {
        q: 'What if I can\'t afford to pay my tax bill?',
        a: 'File on time even if you can\'t pay—the failure-to-file penalty is much higher. The IRS offers payment plans. Don\'t ignore the problem.'
      }
    ]
  },
  'money-psychology-guide': {
    title: 'Money Psychology & Habits',
    category: 'Money Psychology',
    categorySlug: 'money-psychology',
    description: 'Understand your relationship with money and build lasting financial habits that stick.',
    keywords: 'money mindset, financial habits, behavioral finance, money psychology, financial anxiety',
    icon: '🧠',
    readTime: '15 min read',
    intro: `Personal finance is more personal than finance. Your money behaviors are shaped by upbringing, emotions, and deeply held beliefs—often unconscious. Understanding your money psychology is essential to lasting financial change.

This guide explores the emotional side of money and helps you build habits that stick.`,
    sections: [
      {
        title: 'Your Money Story',
        content: `Your financial behaviors started forming in childhood. What did you learn about money growing up?

**Scarcity mindset:** "Money doesn't grow on trees." Can lead to hoarding or fear of spending even when appropriate.

**Abundance mindset:** "There's always more where that came from." Can lead to overspending or undervaluing savings.

**Money as taboo:** "We don't talk about money." Can lead to financial ignorance and shame around money issues.

Neither extreme is ideal. Awareness of your money story is the first step to changing behaviors that don't serve you.`
      },
      {
        title: 'Common Money Behaviors',
        content: `Which patterns do you recognize in yourself?

**Avoider:** Ignores financial issues. Doesn't check balances. Pays bills late because opening mail is stressful.

**Spender:** Uses shopping for emotional regulation. Buys things to feel better, then feels guilt.

**Saver:** Hoards money beyond reason. Has trouble enjoying money even when financially secure.

**Worrier:** Constantly anxious about money regardless of actual financial situation.

These patterns often stem from past experiences. Identifying yours helps you address the root cause, not just the symptom.`,
        tips: [
          'Journal about money memories from childhood',
          'Notice emotions when making financial decisions',
          'Consider talking to a financial therapist for deep-seated issues'
        ]
      },
      {
        title: 'Building Better Habits',
        content: `Lasting change comes from habits, not willpower. Principles of habit formation:

**Make it easy:** Automate savings and bill payments. Remove friction from good behaviors.

**Make it hard:** Add friction to bad behaviors. Delete shopping apps. Unsubscribe from retail emails.

**Start small:** Want to track expenses? Start with one category. Want to save? Start with $25/month.

**Stack habits:** Attach new habits to existing ones. "After morning coffee, I review yesterday's spending."

**Celebrate wins:** Small rewards reinforce behavior. Acknowledge progress.`
      },
      {
        title: 'Managing Financial Stress',
        content: `Money stress is real and affects mental health. Strategies to cope:

**Face it:** Avoiding financial reality increases anxiety. Knowledge reduces fear. Check your accounts regularly.

**Control what you can:** You can't control the economy or market crashes. Focus on your savings rate, spending, and behaviors.

**Separate self-worth from net worth:** Your value as a person has nothing to do with your bank balance.

**Get support:** Talk to trusted friends, family, or professionals. Money shame thrives in secrecy.

**Take action:** Anxiety decreases when you take constructive steps. One small action—opening a savings account, making a budget—builds momentum.`
      }
    ],
    commonMistakes: [
      'Ignoring the emotional side of money',
      'Trying to change everything at once',
      'Comparing yourself to others',
      'Using deprivation-based approaches that aren\'t sustainable',
      'Not celebrating progress along the way'
    ],
    checklist: [
      'Reflect on your money story—what did you learn growing up?',
      'Identify your primary money behavior pattern',
      'Choose one habit to change (start small)',
      'Automate one positive financial behavior',
      'Schedule a weekly money check-in',
      'Find an accountability partner or community'
    ],
    faq: [
      {
        q: 'I know what I should do financially but can\'t seem to do it. What\'s wrong with me?',
        a: 'Nothing is "wrong" with you. Knowledge and behavior change are different. Focus on environment design (automation, removing temptation) rather than willpower. Consider whether emotional factors are at play.'
      },
      {
        q: 'How do I talk to my partner about money?',
        a: 'Schedule dedicated money conversations—not when stressed. Focus on shared goals rather than blame. Listen to understand their perspective and money story. Consider working with a financial planner to mediate.'
      },
      {
        q: 'I\'m embarrassed about my financial situation. How do I move forward?',
        a: 'Shame keeps people stuck. Your past decisions don\'t define your future. Everyone starts somewhere. Focus on the next right step, not the whole journey. Progress compounds.'
      }
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];

  if (!guide) {
    return {
      title: 'Guide not found',
      description: 'The guide you are looking for does not exist.',
    };
  }

  const canonicalUrl = `${siteUrl}/guides/${slug}`;

  return {
    title: `${guide.title} | MoneyWithSense`,
    description: guide.description,
    keywords: guide.keywords,
    authors: [{ name: 'MoneyWithSense Editorial Team' }],
    robots: 'index, follow',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonicalUrl,
      siteName: 'MoneyWithSense',
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

function slugifyCategory(value?: string) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = guides[slug];

  if (!guide) {
    notFound();
  }

  // Get related articles from this category
  const posts = await getPosts();
  const relatedPosts = posts.filter((post: { categories?: (string | { title: string })[] }) =>
    post.categories?.some((cat) => {
      const catTitle = typeof cat === 'object' ? cat.title : cat;
      return slugifyCategory(catTitle) === guide.categorySlug ||
             catTitle.toLowerCase().includes(guide.category.toLowerCase());
    })
  ).slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    author: {
      '@type': 'Organization',
      name: 'MoneyWithSense Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MoneyWithSense',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.svg`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/guides/${slug}`
    },
    articleSection: guide.category,
    keywords: guide.keywords,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="bg-white min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <ol className="flex items-center gap-2 text-secondary-500">
                <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
                <li>/</li>
                <li><Link href="/guides" className="hover:text-primary-600">Guides</Link></li>
                <li>/</li>
                <li className="text-secondary-900 font-medium">{guide.category}</li>
              </ol>
            </nav>

            <div className="text-center">
              <span className="text-5xl mb-4 block">{guide.icon}</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 mb-4">
                {guide.category} • {guide.readTime}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                {guide.title}
              </h1>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                {guide.description}
              </p>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="border-b border-secondary-100 bg-secondary-50 py-4 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {guide.sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-sm text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  {section.title}
                </a>
              ))}
              <a href="#mistakes" className="text-sm text-secondary-600 hover:text-primary-600 transition-colors">
                Common Mistakes
              </a>
              <a href="#checklist" className="text-sm text-secondary-600 hover:text-primary-600 transition-colors">
                Checklist
              </a>
              <a href="#faq" className="text-sm text-secondary-600 hover:text-primary-600 transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-12">
            <p className="text-amber-800 text-sm">
              <strong>Disclaimer:</strong> This guide is for educational purposes only and does not constitute financial advice. 
              Always consult with a qualified professional before making financial decisions.
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none text-secondary-700 mb-12">
            {guide.intro.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Sections */}
          {guide.sections.map((section, index) => (
            <section key={index} id={`section-${index}`} className="mb-12 scroll-mt-32">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                {section.title}
              </h2>
              <div className="prose prose-lg max-w-none text-secondary-700">
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
              
              {section.tips && (
                <div className="mt-6 bg-primary-50 border border-primary-100 rounded-xl p-6">
                  <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                    <span>💡</span> Key Tips
                  </h3>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-primary-800">
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          {/* Common Mistakes */}
          <section id="mistakes" className="mb-12 scroll-mt-32">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> Common Mistakes to Avoid
            </h2>
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <ul className="space-y-3">
                {guide.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-3 text-red-800">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Checklist */}
          <section id="checklist" className="mb-12 scroll-mt-32">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <span>✅</span> Quick Action Checklist
            </h2>
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <ul className="space-y-3">
                {guide.checklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-green-800">
                    <span className="w-6 h-6 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-12 scroll-mt-32">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
              <span>❓</span> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {guide.faq.map((item, index) => (
                <div key={index} className="border border-secondary-200 rounded-xl p-6">
                  <h3 className="font-semibold text-secondary-900 mb-3">
                    {item.q}
                  </h3>
                  <p className="text-secondary-600">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Disclaimer */}
          <div className="border-t border-secondary-200 pt-8 mb-12">
            <p className="text-xs text-secondary-500">
              The information provided in this guide is for general informational and educational purposes only. 
              It is not intended as, and should not be construed as, financial, legal, or investment advice. 
              MoneyWithSense is not a licensed financial advisor. Always consult with qualified professionals regarding your specific situation.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="bg-secondary-50 border-t border-secondary-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-secondary-900">
                  Related Articles in {guide.category}
                </h2>
                <Link
                  href={`/categories/${guide.categorySlug}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((post: {
                  _id: string;
                  title: string;
                  slug: { current: string };
                  excerpt?: string;
                }) => (
                  <Link
                    key={post._id}
                    href={`/articles/${post.slug.current}`}
                    className="group bg-white rounded-xl border border-secondary-100 p-6 hover:border-primary-200 hover:shadow-card-hover transition-all"
                  >
                    <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-secondary-500 line-clamp-2">
                      {post.excerpt || 'Read this article for more insights...'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="bg-secondary-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Found this guide helpful?
            </h2>
            <p className="text-secondary-300 mb-8">
              Get weekly finance tips delivered to your inbox. No spam, just actionable advice.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-full hover:bg-primary-400 transition-all"
            >
              Subscribe Free
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
