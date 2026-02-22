import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'costOfLivingTopic',
  title: 'Cost of Living Topic',
  type: 'document',
  fields: [
    defineField({name: 'city', title: 'City', type: 'string'}),
    defineField({name: 'country', title: 'Country', type: 'string'}),
    defineField({name: 'region', title: 'Region', type: 'string'}),
    defineField({
      name: 'mode',
      title: 'Mode',
      type: 'string',
      options: {list: ['city', 'comparison', 'budget']},
    }),
    defineField({name: 'comparisonCity', title: 'Comparison City', type: 'string'}),
    defineField({name: 'comparisonCountry', title: 'Comparison Country', type: 'string'}),
    defineField({name: 'priority', title: 'Priority', type: 'number'}),
    defineField({name: 'searchIntent', title: 'Search Intent', type: 'string'}),
    defineField({name: 'notes', title: 'Notes', type: 'text'}),
    defineField({name: 'year', title: 'Year', type: 'number'}),
    defineField({name: 'used', title: 'Used', type: 'boolean'}),
    defineField({name: 'usedAt', title: 'Used At', type: 'datetime'}),
    defineField({name: 'articleId', title: 'Generated Article ID', type: 'string'}),
  ],
  preview: {
    select: {title: 'city', subtitle: 'mode'},
    prepare: ({title, subtitle}) => ({title, subtitle: `[${subtitle}]`}),
  },
})
