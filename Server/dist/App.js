"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
});
const sequelize = new sequelize_1.Sequelize({
    database: 'walkietalkie', // Replace with your database name
    username: 'root', // Replace with your database username
    password: '', // Replace with your database password, if any
    host: 'localhost',
    port: 3306, // Default MySQL port
    dialect: 'mysql', // Tell Sequelize which database dialect to use
    logging: false, // Disable logging; set to console.log to enable logging
});
app.use((0, cors_1.default)({
    origin: ['http://localhost:8081'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 20000 * 60 * 1000, secure: true },
}));
// =================================================================
// * Users and Login *
// =================================================================
class Users extends sequelize_1.Model {
    // Method to set the password, hashes password and sets the password
    setPassword(password) {
        const saltRounds = 10; // or another salt round as per security requirement
        const hashedPassword = bcrypt_1.default.hashSync(password, saltRounds);
        this.password = hashedPassword;
    }
    // Example for updating a user's password
    // newUser.setPassword(newPlainTextPassword); // Hashes the new password and sets it
    // await newUser.save(); // Persists the change to the database
    // Method to check the password against the hashed password
    checkPassword(password) {
        const result = bcrypt_1.default.compareSync(password, this.password);
        console.log(`Checking password for ${this.username}: ${result} - ${this.password} - ${password}`); // Debug print
        return result;
    }
    // TypeScript representation of Python's __repr__ method
    toString() {
        return `<Users ${this.username}>`;
    }
}
Users.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    password: sequelize_1.DataTypes.STRING(128),
}, {
    sequelize, // This is the sequelize instance
    modelName: 'Users',
    // Other model options go here
});
app.post('/create-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    };
    try {
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
        const newUser = yield Users.create({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
        });
        console.log(`User created successfully:`, newUser);
        res.status(201).send('User created successfully.');
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Failed to create user.');
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log('server user: ' + username);
    const user = yield Users.findOne({
        where: {
            username: username,
        },
    });
    if (user && user.checkPassword(password)) {
        req.session.user = user.dataValues; // Store user info in session
        res.status(200).send('Login successful');
    }
    else {
        res.status(401).send('Invalid login');
    }
}));
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send('Could not log out.');
        }
        else {
            res.status(200).send('Logout successful');
        }
    });
});
app.post('/searchUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    console.log('server user: ' + username);
    // Use the Op.like operator to search for usernames that contain the search string
    const users = yield Users.findAll({
        where: {
            username: {
                [sequelize_1.Op.like]: `%${username}%`, // This will match any username that contains the search string
            },
        },
    });
    if (users.length > 0) {
        res.status(200).send(users); // Send back the list of matching users
    }
    else {
        res.status(404).send('No users found');
    }
}));
// =================================================================
// * Messages and socket.io*
// =================================================================
class Messages extends sequelize_1.Model {
    toString() {
        return `<Messages ${this.id}>`;
    }
    serialize() {
        return {
            id: this.id,
            sender_id: this.sender_id,
            receiver_id: this.receiver_id,
            content: this.content,
            timestamp: this.timestamp.toISOString(),
            room: this.room,
        };
    }
}
Messages.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sender_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // This is a reference to another model
            key: 'id', // This is the column name of the referenced model
        },
    },
    receiver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    room: {
        type: sequelize_1.DataTypes.STRING(100),
        defaultValue: '0',
    },
}, {
    sequelize, // This is the sequelize instance
    modelName: 'Messages',
    timestamps: false,
});
io.on('connection', (socket) => {
    socket.on('join', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentRoom } = data;
        socket.join(currentRoom);
        socket.to(currentRoom).emit('notification', `${data.username} has entered the room.`);
        console.log(`${data.username} joined room: ${currentRoom}`);
    }));
    socket.on('leaveAllRooms', (username) => {
        const rooms = socket.rooms; // O cualquier otra lógica para identificar al usuario
        // Iterar sobre todas las salas a las que el usuario está unido
        for (let room of rooms) {
            // Asegurarse de no sacar al usuario de su propia sala de socket
            if (room !== socket.id) {
                socket.leave(room);
                console.log(`${username} left room ${room}`);
            }
        }
        // Aquí puedes emitir un evento de confirmación si es necesario
        // Por ejemplo, para confirmar que el usuario ha salido de todas las salas
        socket.emit('leftAllRooms', { success: true });
    });
    socket.on('send-audio', (audioData, room) => {
        // Emitir el audio recibido a todos los demás clientes conectados
        socket.to(room).emit('receive-audio', audioData, room);
        console.log('Audio data sent to all clients in room:', room);
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
app.listen(3000, () => {
    console.log('Express Server running on port 3000');
});
server.listen(3001, () => {
    console.log('Socket.io Server running on port 3001');
});
