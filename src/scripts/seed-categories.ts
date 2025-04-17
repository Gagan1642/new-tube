import { db } from '../db';
import { categories } from '@/db/schema';

const categoryNames = [
    'Technology',
    'Health',
    'Finance',
    'Education',
    'Entertainment',
    'Travel',
    'Food',
    'Lifestyle',
    'Sports',
    'Fashion',
    'Art',
    'Science',
    'History',
    'Politics',
    'Business',
    'Environment',
    'Automotive',
    'Real Estate',
    'Gaming',
    'Music',
]


async function main() {
    console.log('Seeding categories...');

    try {
        const values = categoryNames.map((name) => ({
            name,
            description: `Video related to ${name.toLowerCase}`,
        }));

        await db.insert(categories).values(values);
        console.log('Categories seeded successfully!');
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

main();