
export const categories = [
    {
        id: 'sports',
        name: 'Sports',
        icon: 'Trophy',
        questions: [
            {
                id: 1,
                type: 'meaning',
                content: 'La Natation',
                instruction: 'What does this mean?',
                answer: 'Swimming',
                audioText: 'La Natation'
            },
            {
                id: 2,
                type: 'translation',
                content: 'Soccer',
                instruction: 'What is the French word for?',
                answer: 'Le Football',
                audioText: null // Don't give away the answer
            },
            {
                id: 3,
                type: 'fill_blank',
                content: 'Je ___ au tennis.',
                instruction: 'Fill in the blank (verb: jouer)',
                answer: 'joue',
                audioText: 'Je ... au tennis' // Pause for blank
            },
            {
                id: 4,
                type: 'meaning',
                content: 'L\'Escalade',
                instruction: 'What does this mean?',
                answer: 'Rock Climbing',
                audioText: 'L\'Escalade'
            },
            {
                id: 5,
                type: 'translation',
                content: 'To run',
                instruction: 'What is the French word for?',
                answer: 'Courir',
                audioText: null
            }
        ]
    },
    {
        id: 'food',
        name: 'Food',
        icon: 'Utensils',
        questions: [
            {
                id: 1,
                type: 'meaning',
                content: 'Le Fromage',
                instruction: 'What does this mean?',
                answer: 'Cheese',
                audioText: 'Le Fromage'
            },
            {
                id: 2,
                type: 'translation',
                content: 'Bread',
                instruction: 'What is the French word for?',
                answer: 'Le Pain',
                audioText: null
            },
            {
                id: 3,
                type: 'fill_blank',
                content: 'Je voudrais de ___ (water).',
                instruction: 'Fill in the blank',
                answer: 'l\'eau',
                audioText: 'Je voudrais de ...'
            }
        ]
    },
    {
        id: 'travel',
        name: 'Travel',
        icon: 'Plane',
        questions: [
            {
                id: 1,
                type: 'meaning',
                content: 'La Gare',
                instruction: 'What does this mean?',
                answer: 'Train Station',
                audioText: 'La Gare'
            },
            {
                id: 2,
                type: 'translation',
                content: 'Airport',
                instruction: 'What is the French word for?',
                answer: 'L\'Aéroport',
                audioText: null
            }
        ]
    }
];
