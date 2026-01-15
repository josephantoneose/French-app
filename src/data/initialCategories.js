import { v4 as uuidv4 } from 'uuid';

export const initialCategories = [
    { id: uuidv4(), name: 'Casual', content: 'Bonjour. Hello.\nComment ça va? How are you?' },
    { id: uuidv4(), name: 'Office', content: 'Je suis en réunion. I am in a meeting.\nVoici mon rapport. Here is my report.' },
    { id: uuidv4(), name: 'Transportation', content: 'Où est la gare? Where is the station?\nUn billet s\'il vous plait. A ticket please.' },
    { id: uuidv4(), name: 'Restaurant', content: 'L\'addition s\'il vous plait. The check please.' },
    { id: uuidv4(), name: 'Shopping', content: 'Combien ça coûte? How much is this?' },
    { id: uuidv4(), name: 'Emergency', content: 'Aidez-moi! Help me!' },
    { id: uuidv4(), name: 'Hotel', content: 'Avez-vous une chambre? Do you have a room?' },
    { id: uuidv4(), name: 'Weather', content: 'Il fait beau. The weather is nice.' },
    { id: uuidv4(), name: 'Family', content: 'Voici ma mère. This is my mother.' },
    { id: uuidv4(), name: 'Hobbies', content: 'J\'aime lire. I like to read.' },
];
