import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import bcrypt from 'bcrypt';
import fs from 'fs';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const sequelize = new Sequelize({
  database: 'walkietalkie', // Replace with your database name
  username: 'root', // Replace with your database username
  password: '', // Replace with your database password, if any
  host: 'localhost',
  port: 3306, // Default MySQL port
  dialect: 'mysql', // Tell Sequelize which database dialect to use
  logging: false, // Disable logging; set to console.log to enable logging
});

app.use(
  cors({
    origin: ['http://localhost:8081'],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 20000 * 60 * 1000, secure: true },
  })
);
// =================================================================
// * Users and Login *
// =================================================================
class Users extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;

  // Method to set the password, hashes password and sets the password
  setPassword(password: string): void {
    const saltRounds = 10; // or another salt round as per security requirement
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    this.password = hashedPassword;
  }
  // Example for updating a user's password
  // newUser.setPassword(newPlainTextPassword); // Hashes the new password and sets it
  // await newUser.save(); // Persists the change to the database

  // Method to check the password against the hashed password
  checkPassword(password: string): boolean {
    const result = bcrypt.compareSync(password, this.password);
    console.log(
      `Checking password for ${this.username}: ${result} - ${this.password} - ${password}`
    ); // Debug print
    return result;
  }

  // TypeScript representation of Python's __repr__ method
  toString(): string {
    return `<Users ${this.username}>`;
  }
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: DataTypes.STRING(128),
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Users',
    // Other model options go here
  }
);

app.post('/create-user', async (req, res) => {
  const userData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  };
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await Users.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    });

    console.log(`User created successfully:`, newUser);
    res.status(201).send('User created successfully.');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Failed to create user.');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('server user: ' + username);

  const user = await Users.findOne({
    where: {
      username: username,
    },
  });

  if (user && user.checkPassword(password)) {
    req.session.user = user.dataValues; // Store user info in session
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid login');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out.');
    } else {
      res.status(200).send('Logout successful');
    }
  });
});

app.post('/searchUser', async (req, res) => {
  const { username } = req.body;
  console.log('server user: ' + username);

  // Use the Op.like operator to search for usernames that contain the search string
  const users = await Users.findAll({
    where: {
      username: {
        [Op.like]: `%${username}%`, // This will match any username that contains the search string
      },
    },
  });

  if (users.length > 0) {
    res.status(200).send(users); // Send back the list of matching users
  } else {
    res.status(404).send('No users found');
  }
});

// =================================================================
// * Messages and socket.io*
// =================================================================
class Messages extends Model {
  declare id: number;
  declare sender_id: number;
  declare receiver_id: number;
  declare content: string;
  declare timestamp: Date;
  declare room: string;

  toString(): string {
    return `<Messages ${this.id}>`;
  }

  serialize(): object {
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

Messages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // This is a reference to another model
        key: 'id', // This is the column name of the referenced model
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    room: {
      type: DataTypes.STRING(100),
      defaultValue: '0',
    },
  },
  {
    sequelize, // This is the sequelize instance
    modelName: 'Messages',
    timestamps: false,
  }
);

io.on('connection', (socket: Socket) => {
  socket.on('join', async (data) => {
    const { currentRoom } = data;
    socket.join(currentRoom);
    socket.to(currentRoom).emit('notification', `${data.username} has entered the room.`);
    console.log(`${data.username} joined room: ${currentRoom}`);
  });
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
