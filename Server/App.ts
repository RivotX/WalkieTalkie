import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { Json } from 'sequelize/types/utils';
import { Z_DATA_ERROR } from 'zlib';

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
    origin: 'http://localhost:8081',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(
  session({
    secret: 'secreto',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día en milisegundos
      httpOnly: true,
      secure: false, // Establece a true si estás usando HTTPS
    },
    resave: true,
    saveUninitialized: false,
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
  declare groups: string;

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

  setgroups(groups: object): void {
    this.groups = JSON.stringify(groups);
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

    groups: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
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

app.get('/getsession', async (req, res) => {
  res.json(req.session);
});

app.post('/login', async (req, res) => {
  console.log('Entrando a login');

  const { username, password } = req.body;
  console.log(`Username: ${username}`);

  const user = await Users.findOne({
    where: {
      username: username,
    },
  });

  if (user && user.checkPassword(password)) {
    console.log('User found in database');
    user.dataValues.password = undefined; // Remove password from user info
    user.dataValues.groups = JSON.parse(user.dataValues.groups); // Remove groups from user info
    req.session.user = user.dataValues; // Store user info in session
    req.session.save();
    console.log('sesion guardada:', req.session);
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
  let groups = socket.handshake.query.groups as string | undefined;
  let groupsAmI: string[] = [];
  if (typeof groups === 'string' && groups.trim()) {
    try {
      groupsAmI = JSON.parse(groups);
    } catch (error) {
      console.error('Error parsing groups:', error);
      groupsAmI = []; // En caso de error, usa un array vacío
    }
  }
  if (groupsAmI) {
    groupsAmI.forEach((group) => {
      socket.join(group);
      console.log('User joined room:', group);
    });
  }
  console.log('User connected:', socket.id);

  socket.on('join', async (data) => {
    const { currentRoom } = data;
    socket.join(currentRoom);
    console.log('salas', socket.rooms);
    console.log('Entra a una sala');
    console.log('UserID:', data.userID);

    const user = await Users.findOne({
      where: {
        id: data.userID,
      },
    });
    if (user && user.groups) {
      let groups = JSON.parse(user.groups);

      if (typeof groups === 'string') {
        groups = JSON.parse(groups);
      }
      if (!groups.includes(currentRoom)) {
        groups.push(currentRoom);
        user.setgroups(groups);
        user
          .save()
          .then(() => {
            console.log('Los cambios han sido guardados exitosamente.');
          })
          .catch((error) => {
            console.error('Error al guardar los cambios: ', error);
          });
      } else {
        console.log('Ya esta en el grupo');
      }
    }
    socket
      .to(currentRoom)
      .emit('notification', `${user ? user.username : 'null'} has entered the room.`);
    console.log(`${user ? user.username : 'null'} joined room: ${currentRoom}`);
  });
  // socket.on('leaveAllRooms', (username) => {
  //   const rooms = socket.rooms; // O cualquier otra lógica para identificar al usuario

  //   // Iterar sobre todas las salas a las que el usuario está unido
  //   for (let room of rooms) {
  //     // Asegurarse de no sacar al usuario de su propia sala de socket
  //     if (room !== socket.id) {
  //       socket.leave(room);
  //       console.log(`${username} left room ${room}`);
  //     }
  //   }

  //   // Aquí puedes emitir un evento de confirmación si es necesario
  //   // Por ejemplo, para confirmar que el usuario ha salido de todas las salas
  //   socket.emit('leftAllRooms', { success: true });
  // });

  socket.on('send-audio', (audioData, room) => {
    // Emitir el audio recibido a todos los demás clientes conectados
    socket.to(room).emit('receive-audio', audioData, room);
    console.log('Audio data sent to all clients in room:', room);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

 // =================================================================
 // *Solicitudes de amistad* 
 // =================================================================
 class FriendRequests extends Model {
  declare id: number;
  declare senderId: number;
  declare receiverId: number;
  declare status: 'pending' | 'accepted' | 'rejected';
  declare createdAt: Date;
  declare updatedAt: Date;
}

FriendRequests.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // nombre del modelo de usuarios
        key: 'id',
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // nombre del modelo de usuarios
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // Instancia de Sequelize
    modelName: 'FriendRequests',
    tableName: 'friend_requests', // Nombre de la tabla en la base de datos
  }
);
app.post('/send-friend-request', async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'No puedes enviarte una solicitud de amistad a ti mismo.' });
  }

  // Verificar si la solicitud ya existe
  const existingRequest = await FriendRequests.findOne({
    where: {
      senderId,
      receiverId,
      status: 'pending',
    },
  });

  if (existingRequest) {
    return res.status(400).json({ message: 'Ya has enviado una solicitud de amistad a este usuario.' });
  }

  try {
    // Crear la solicitud de amistad
    await FriendRequests.create({
      senderId,
      receiverId,
    });

    // Notificar al receptor (opcional)
    // io.to(receiverId).emit('friend-request', { senderId });

    res.status(201).json({ message: 'Solicitud de amistad enviada.' });
  } catch (error) {
    console.error('Error enviando solicitud de amistad:', error);
    res.status(500).json({ message: 'Error al enviar la solicitud de amistad.' });
  }
});

 //==== fin solicitudes de amistad ===================================
sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, () => {
    console.log('Express Server running on port 3000');
  });
  server.listen(3001, () => {
    console.log('Socket.io Server running on port 3001');
  });
});
