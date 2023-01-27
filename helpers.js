const urlsForUser = (user) => {
  let urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  return urls;
};

//Email look up function
const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return null;
};
const generateRandomString = () => {
  let string = "";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    let randomNum = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNum, randomNum + 1);
  }
  return string;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};