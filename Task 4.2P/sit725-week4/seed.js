const mongoose = require('mongoose');

// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myprojectDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Schema
const ProjectSchema = new mongoose.Schema({
    title: String,
    image: String,
    link: String,
    description: String,
});

const Project = mongoose.model('Project', ProjectSchema);

const sampleProjects = [
    {
        title: "Bunny & Chicks",
        image: "images/bunny-chicks.jpg",
        link: "About Bunny & Chicks",
        description: "Adorable white bunny surrounded by fluffy baby chicks - a perfect picture of friendship!"
    },
    {
        title: "Cheetah Family",
        image: "images/cheetah-family.jpg",
        link: "About Cheetah Family",
        description: "Beautiful cheetah mother with her cubs in their natural habitat - showcasing the bond of family."
    },
    {
        title: "Giant Panda",
        image: "images/panda.jpg",
        link: "About Giant Panda",
        description: "Majestic giant panda with its distinctive black and white fur - a symbol of conservation."
    }
];

async function seedDatabase() {
    try {
        await Project.deleteMany({});
        console.log('Existing data cleared');

        await Project.insertMany(sampleProjects);
        console.log("Animal projects saved successfully!");

        const allProjects = await Project.find({});
        console.log(`Total projects in database: ${allProjects.length}`);

        allProjects.forEach((project, index) => {
            console.log(`${index + 1}. ${project.title} - ${project.description}`);
        });

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
}

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB for seeding');
    seedDatabase();
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});