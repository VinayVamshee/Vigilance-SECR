require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/ConnectDB');
const SiteSchema = require('./Models/WebSite');
const CategorySchema = require('./Models/Category');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
const AdminUser = require('./Models/AdminUser'); 
const Feedback = require('./Models/Feedback');
const Image = require('./Models/ImageModel')
const LockedUser = require('./Models/LockedUser')

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001; 
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

app.post('/admin/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdminUser = new AdminUser({ username, password: hashedPassword });
        await newAdminUser.save();
        res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const adminUser = await AdminUser.findOne({ username });
        if (!adminUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: adminUser._id, username: adminUser.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid username' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }
        const token = jwt.sign({ user: { userId: user.id } }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: { id: user.id, username: user.username }, 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Server error' }); 
    }
});

app.post('/register', async (req, res) => {
    const { username, password, phoneno } = req.body; 

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            phoneno 
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user registration:', error); 
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/AddNewSite", authMiddleware, async (req, res) => {
    const siteData = { ...req.body, userId: req.user.userId };
    try {
        const site = await SiteSchema.create(siteData);
        res.json(site);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/GetSite', authMiddleware, async (req, res) => {
    try {
        const sites = await SiteSchema.find({ userId: req.user.userId });
        res.json(sites);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.put('/sites/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const updatedSite = await SiteSchema.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSite) {
            return res.status(404).json({ message: "Site not found" });
        }
        res.json(updatedSite);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.delete('/DeleteSite/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const site = await SiteSchema.findOneAndDelete({ _id: id, userId: req.user.userId });
        res.json(site);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post("/AddNewCategory", authMiddleware, async (req, res) => {
    const categoryData = { ...req.body, userId: req.user.userId };
    try {
        const category = await CategorySchema.create(categoryData);
        res.json(category);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/GetCategory', authMiddleware, async (req, res) => {
    try {
        const categories = await CategorySchema.find({ userId: req.user.userId });
        res.json(categories);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.delete('/DeleteCategory/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const category = await CategorySchema.findOneAndDelete({ _id: id, userId: req.user.userId });
        res.json(category);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post('/saveUserBackground', authMiddleware, async (req, res) => {
    const userId = req.user.userId; 
    const { backgroundImage } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { backgroundImage });
        res.status(200).send({ msg: "Background image updated successfully!" });
    } catch (error) {
        res.status(500).send({ msg: "Error updating background image." });
    }
});

app.get('/getUserBackground', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).send({ msg: "User not found." });
        res.status(200).send({ backgroundImage: user.backgroundImage });
    } catch (error) {
        console.error("Error fetching background image:", error); 
        res.status(500).send({ msg: "Error fetching background image." });
    }
});

app.get('/getAllUsers', async (req, res) => {
    try {
        const users = await User.find({}, 'username password phoneno'); 
        const userResponse = users.map(user => ({
            username: user.username,
            password: 'Encrypted',
            phoneno: user.phoneno
        }));

        res.json(userResponse); 
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

const CommonSite = require('./Models/CommonSite'); 

app.post('/addSite', async (req, res) => {
    try {
        const newSite = new CommonSite(req.body);
        await newSite.save();
        res.status(201).json(newSite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/getAllSites', async (req, res) => {
    try {
        const sites = await CommonSite.find();
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/editSite/:id', async (req, res) => {
    try {
        const siteId = req.params.id;
        const updatedSite = await CommonSite.findByIdAndUpdate(siteId, req.body, { new: true });
        res.status(200).json(updatedSite);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

const CommonCategory = require('./Models/CommonCategory'); 

app.post('/addCategory', async (req, res) => {
    const { Name } = req.body;
    const existingCategory = await CommonCategory.findOne({ Name });
    if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
    }
    const newCategory = new CommonCategory({ Name });
    try {
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error adding category', error });
    }
});

app.get('/getAllCommonCategories', async (req, res) => {
    try {
        const categories = await CommonCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

app.delete('/deleteCommonCategory/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const deletedCategory = await CommonCategory.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category. Please try again.' });
    }
});

app.delete('/deletecommonsite/:id', async (req, res) => {
    const siteId = req.params.id;
    try {
        const deletedSite = await CommonSite.findByIdAndDelete(siteId);
        
        if (!deletedSite) {
            return res.status(404).json({ message: 'Site not found' });
        }

        res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ message: 'Failed to delete site. Please try again.' });
    }
});

app.put('/editCommonSite/:id', async (req, res) => {
    const siteId = req.params.id;
    try {
        const updatedSite = await CommonSite.findByIdAndUpdate(siteId, req.body, { new: true });
        if (!updatedSite) {
            return res.status(404).json({ message: 'Site not found' });
        }
        res.status(200).json(updatedSite);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ message: 'Failed to update site. Please try again.' });
    }
});

app.post('/feedback', async (req, res) => {
    const { name, message } = req.body;
    const newFeedback = new Feedback({ name, message });
    try {
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        res.status(400).json({ error: 'Error submitting feedback: ' + error.message });
    }
});

app.get('/getfeedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find(); 
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching feedbacks: ' + error.message });
    }
});

const CommonBackground = require('./Models/CommonBackground');

app.post('/saveCommonBackground', async (req, res) => {
    const { backgroundImage } = req.body;
    try {
        const commonBackground = await CommonBackground.findOneAndUpdate(
            {},
            { backgroundImage, updatedAt: Date.now() },
            { new: true, upsert: true } 
        );
        res.status(200).send({ msg: "Common background updated successfully!", commonBackground });
    } catch (error) {
        res.status(500).send({ msg: "Error updating common background." });
    }
});

app.get('/getCommonBackground', async (req, res) => {
    try {
        const commonBackground = await CommonBackground.findOne();
        res.status(200).send({ backgroundImage: commonBackground?.backgroundImage });
    } catch (error) {
        res.status(500).send({ msg: "Error fetching common background." });
    }
});

app.post('/images', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL is required' });
    }

    try {
        const newImage = new Image({ imageUrl });
        await newImage.save();
        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ message: 'Error saving image', error });
    }
});

// GET route to fetch all image links
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error });
    }
});

// DELETE route to remove an image by its ID
app.delete('/images/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedImage = await Image.findByIdAndDelete(id);
        if (!deletedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error });
    }
});

app.post('/AddNewLockedUser', async (req, res) => {
    try {
        const { names } = req.body;
        if (!Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ error: 'At least one name is required' });
        }
        await LockedUser.deleteMany({});
        const newUsers = await LockedUser.insertMany(names.map(name => ({ name })));
        res.status(201).json({ message: 'Users updated successfully', users: newUsers });
    } catch (error) {
        console.error('Error saving users:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/GetLockedUsers', async (req, res) => {
    try {
        const lockedUsers = await LockedUser.find({});
        res.status(200).json(lockedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


const start = async () => {
    try {
        await connectDB();
        app.listen(PORT,'0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
}
start();require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/ConnectDB');
const SiteSchema = require('./Models/WebSite');
const CategorySchema = require('./Models/Category');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
const AdminUser = require('./Models/AdminUser'); 
const Feedback = require('./Models/Feedback');
const Image = require('./Models/ImageModel')

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001; 
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

app.post('/admin/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdminUser = new AdminUser({ username, password: hashedPassword });
        await newAdminUser.save();
        res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const adminUser = await AdminUser.findOne({ username });
        if (!adminUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: adminUser._id, username: adminUser.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid username' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }
        const token = jwt.sign({ user: { userId: user.id } }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: { id: user.id, username: user.username }, 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Server error' }); 
    }
});

app.post('/register', async (req, res) => {
    const { username, password, phoneno } = req.body; 

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            phoneno 
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user registration:', error); 
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/AddNewSite", authMiddleware, async (req, res) => {
    const siteData = { ...req.body, userId: req.user.userId };
    try {
        const site = await SiteSchema.create(siteData);
        res.json(site);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/GetSite', authMiddleware, async (req, res) => {
    try {
        const sites = await SiteSchema.find({ userId: req.user.userId });
        res.json(sites);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.put('/sites/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const updatedSite = await SiteSchema.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSite) {
            return res.status(404).json({ message: "Site not found" });
        }
        res.json(updatedSite);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.delete('/DeleteSite/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const site = await SiteSchema.findOneAndDelete({ _id: id, userId: req.user.userId });
        res.json(site);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post("/AddNewCategory", authMiddleware, async (req, res) => {
    const categoryData = { ...req.body, userId: req.user.userId };
    try {
        const category = await CategorySchema.create(categoryData);
        res.json(category);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/GetCategory', authMiddleware, async (req, res) => {
    try {
        const categories = await CategorySchema.find({ userId: req.user.userId });
        res.json(categories);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.delete('/DeleteCategory/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const category = await CategorySchema.findOneAndDelete({ _id: id, userId: req.user.userId });
        res.json(category);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post('/saveUserBackground', authMiddleware, async (req, res) => {
    const userId = req.user.userId; 
    const { backgroundImage } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { backgroundImage });
        res.status(200).send({ msg: "Background image updated successfully!" });
    } catch (error) {
        res.status(500).send({ msg: "Error updating background image." });
    }
});

app.get('/getUserBackground', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).send({ msg: "User not found." });
        res.status(200).send({ backgroundImage: user.backgroundImage });
    } catch (error) {
        console.error("Error fetching background image:", error); 
        res.status(500).send({ msg: "Error fetching background image." });
    }
});

app.get('/getAllUsers', async (req, res) => {
    try {
        const users = await User.find({}, 'username password phoneno'); 
        const userResponse = users.map(user => ({
            username: user.username,
            password: 'Encrypted',
            phoneno: user.phoneno
        }));

        res.json(userResponse); 
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

const CommonSite = require('./Models/CommonSite'); 

app.post('/addSite', async (req, res) => {
    try {
        const newSite = new CommonSite(req.body);
        await newSite.save();
        res.status(201).json(newSite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/getAllSites', async (req, res) => {
    try {
        const sites = await CommonSite.find();
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/editSite/:id', async (req, res) => {
    try {
        const siteId = req.params.id;
        const updatedSite = await CommonSite.findByIdAndUpdate(siteId, req.body, { new: true });
        res.status(200).json(updatedSite);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

const CommonCategory = require('./Models/CommonCategory'); 

app.post('/addCategory', async (req, res) => {
    const { Name } = req.body;
    const existingCategory = await CommonCategory.findOne({ Name });
    if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
    }
    const newCategory = new CommonCategory({ Name });
    try {
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error adding category', error });
    }
});

app.get('/getAllCommonCategories', async (req, res) => {
    try {
        const categories = await CommonCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

app.delete('/deleteCommonCategory/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const deletedCategory = await CommonCategory.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category. Please try again.' });
    }
});

app.delete('/deletecommonsite/:id', async (req, res) => {
    const siteId = req.params.id;
    try {
        const deletedSite = await CommonSite.findByIdAndDelete(siteId);
        
        if (!deletedSite) {
            return res.status(404).json({ message: 'Site not found' });
        }

        res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ message: 'Failed to delete site. Please try again.' });
    }
});

app.put('/editCommonSite/:id', async (req, res) => {
    const siteId = req.params.id;
    try {
        const updatedSite = await CommonSite.findByIdAndUpdate(siteId, req.body, { new: true });
        if (!updatedSite) {
            return res.status(404).json({ message: 'Site not found' });
        }
        res.status(200).json(updatedSite);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ message: 'Failed to update site. Please try again.' });
    }
});

app.post('/feedback', async (req, res) => {
    const { name, message } = req.body;
    const newFeedback = new Feedback({ name, message });
    try {
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        res.status(400).json({ error: 'Error submitting feedback: ' + error.message });
    }
});

app.get('/getfeedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find(); 
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching feedbacks: ' + error.message });
    }
});

const CommonBackground = require('./Models/CommonBackground');

app.post('/saveCommonBackground', async (req, res) => {
    const { backgroundImage } = req.body;
    try {
        const commonBackground = await CommonBackground.findOneAndUpdate(
            {},
            { backgroundImage, updatedAt: Date.now() },
            { new: true, upsert: true } 
        );
        res.status(200).send({ msg: "Common background updated successfully!", commonBackground });
    } catch (error) {
        res.status(500).send({ msg: "Error updating common background." });
    }
});

app.get('/getCommonBackground', async (req, res) => {
    try {
        const commonBackground = await CommonBackground.findOne();
        res.status(200).send({ backgroundImage: commonBackground?.backgroundImage });
    } catch (error) {
        res.status(500).send({ msg: "Error fetching common background." });
    }
});

app.post('/images', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL is required' });
    }

    try {
        const newImage = new Image({ imageUrl });
        await newImage.save();
        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ message: 'Error saving image', error });
    }
});

// GET route to fetch all image links
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error });
    }
});

// DELETE route to remove an image by its ID
app.delete('/images/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedImage = await Image.findByIdAndDelete(id);
        if (!deletedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error });
    }
});


const start = async () => {
    try {
        await connectDB();
        app.listen(PORT,'0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
}
start();
