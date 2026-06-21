process.env.NODE_ENV !== "production" && require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const auth = require("./routes/auth");
const messages = require("./routes/messages");
const family = require("./routes/family");
const products = require("./routes/products");
const notifications = require("./routes/notifications");

const recipes = require("./routes/recipes/recipes");
const mealPlans = require("./routes/recipes/mealPlans");
const shoppingList = require("./routes/recipes/shoppingList");

const db = require("./database/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/messages", messages);
app.use("/api/family", family);
app.use("/api/products", products);
app.use("/api/notifications", notifications);

app.use("/api/recipes", recipes);
app.use("/api/mealplans", mealPlans);
app.use("/api/shoppinglist", shoppingList);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room) => socket.join(room));

  socket.on("send_message", async (data) => {
    io.to(data.room).emit("receive_message", data);

    try {
      const familyId = data.room.replace("family_", "");
      const members = await db.query(
        "SELECT username FROM users WHERE family_id = $1 AND username != $2",
        [familyId, data.username],
      );

      for (const member of members.rows) {
        const result = await db.query(
          "INSERT INTO notifications (family_id, username, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
          [
            familyId,
            member.username,
            `New message from ${data.username}`,
            "message",
          ],
        );
        io.to(`user_${member.username}`).emit(
          "new_notification",
          result.rows[0],
        );
      }
    } catch (err) {
      console.error("Notification error:", err.message);
    }
  });

  socket.on("join_user_room", (username) => {
    socket.join(`user_${username}`);
  });

  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
