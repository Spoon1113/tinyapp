// Libraries & Dependancies
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
app.set("view engine", "ejs");
//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["key"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(morgan('dev'));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};
// generate unique shortURLID



// Homepage
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const urls = urlsForUser(userID)
  const templateVars = {
    urls: urls,
    user: user
  };
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});
// NEW URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!userID) {
    return res.redirect("/login")
  }
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("You need to be logged in to be able to do that!")
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`)
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id].longURL;
  if (urlDatabase[id] === undefined) {
    return res.status(400).send("ID could not be found.");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id
  if (!userID) {
    return res.send("You must be logged in to see URLS");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("The URL you are looking for cannot be found.")
  }
  if (urlDatabase[req.params.id].userID !== userID) {
    return res.status(403).send("This URL cannot be accessed")
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});
//Delete existing URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = urlsForUser(userID);
  if (!userID) {
    return res.send("Please login to have access to this.");
  }
  if (urlDatabase[id].userID !== userID) {
    return res.status(403).send("You don't have access to do this.");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("This page cannot be found. Cannot Delete.")
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

//Update existing URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = urlsForUser(userID);
  if (!req.session.user_id) {
    return res.status(403).send("Please login to have access to this.");
  }
  if (!user[id]) {
    return res.status(403).send("You don't have access to do this.");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("This page cannot be found.")
  }
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});
//GET Login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

//POST Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!email) {
    return res.status(403).send("This email was not found!");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect Password!")

  }
  req.session.user_id = user.id;
  return res.redirect("/urls");
});
//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login/");
});
//GET Register
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_register", templateVars);
});
//POST Register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Both fields must be submitted");
  }
  if (getUserByEmail(email)) {
    return res.status(400).send("Account already exists. Login Please!");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString()
  const newUser = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  users[userID] = newUser;
  req.session.user_id = users.id;
  res.redirect("/login");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

