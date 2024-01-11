const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const getRandomUsers = async (limit) => {
  const response = await axios.get(
    `https://randomuser.me/api/?results=${limit}`
  );
  const users = response.data.results.map((user) => ({
    fullName: `${user.name.first} ${user.name.last}`,
    email: user.email,
    gender: user.gender,
  }));
  return users;
};

const generateUniqueRandomUsers = async (limit) => {
  const usersSet = new Set();
  while (usersSet.size < limit) {
    const randomUsers = await getRandomUsers(limit - usersSet.size);
    randomUsers.forEach((user) => usersSet.add(user));
  }
  return Array.from(usersSet).slice(0, limit);
};

const categorizeUsersByGender = (users) => {
  const categorizedUsers = { male: [], female: [] };
  users.forEach((user) => {
    categorizedUsers[user.gender].push(user);
  });
  return categorizedUsers;
};

app.get("/users", async (req, res) => {
  const limit = req.query.limit || 10;
  const categorizeByGender = req.query.categorize === "gender";

  try {
    const users = await generateUniqueRandomUsers(limit);

    if (categorizeByGender) {
      const categorizedUsers = categorizeUsersByGender(users);
      res.json(categorizedUsers);
    } else {
      res.json(users);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
