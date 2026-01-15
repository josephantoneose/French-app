
export const categories = [
    {
        id: 'hotel',
        name: 'Hotel',
        icon: 'Trophy', // Placeholder, using available icons or generic
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'Une chambre double',
                instruction: 'Translate',
                answer: 'A double room',
                audioText: 'Une chambre double'
            },
            {
                id: 2,
                type: 'definition',
                content: 'Le petit-déjeuner',
                instruction: 'Translate',
                answer: 'Breakfast',
                audioText: 'Le petit-déjeuner'
            }
        ]
    },
    {
        id: 'casual',
        name: 'Casual',
        icon: 'Utensils',
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'Ça va?',
                instruction: 'Translate',
                answer: 'How are you?',
                audioText: 'Ça va?'
            },
            {
                id: 2,
                type: 'definition',
                content: 'À plus tard',
                instruction: 'Translate',
                answer: 'See you later',
                audioText: 'À plus tard'
            }
        ]
    },
    {
        id: 'driving',
        name: 'Driving',
        icon: 'Plane',
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'Le permis de conduire',
                instruction: 'Translate',
                answer: 'Driver\'s license',
                audioText: 'Le permis de conduire'
            },
            {
                id: 2,
                type: 'definition',
                content: 'Tournez à gauche',
                instruction: 'Translate',
                answer: 'Turn left',
                audioText: 'Tournez à gauche'
            }
        ]
    },
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
                audioText: null
            },
            {
                id: 3,
                type: 'fill_blank',
                content: 'Je ___ au tennis.',
                instruction: 'Fill in the blank (verb: jouer)',
                answer: 'joue',
                audioText: 'Je ... au tennis'
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
    },
    {
        id: 'shopping',
        name: 'Shopping',
        icon: 'Utensils',
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'Combien ça coûte?',
                instruction: 'Translate',
                answer: 'How much does it cost?',
                audioText: 'Combien ça coûte?'
            }
        ]
    },
    {
        id: 'health',
        name: 'Health',
        icon: 'Trophy',
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'J\'ai mal à la tête',
                instruction: 'Translate',
                answer: 'I have a headache',
                audioText: 'J\'ai mal à la tête'
            }
        ]
    },
    {
        id: 'work',
        name: 'Work',
        icon: 'Plane',
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'La réunion',
                instruction: 'Translate',
                answer: 'The meeting',
                audioText: 'La réunion'
            }
        ]
    },
    {
        id: 'family',
        name: 'Family',
        icon: 'Trophy',
        questions: [
            {
                id: 1,
                type: 'definition',
                content: 'Ma soeur',
                instruction: 'Translate',
                answer: 'My sister',
                audioText: 'Ma soeur'
            }
        ]
    }
];
