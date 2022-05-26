const express = require('express')
const router = express.Router()
const db = require('../models')

//GET /users/new -- render a form to create a new user
router.get('/new', (req,res) => {

    res.render('users/new.ejs',{message:null})
})

// POST /users -- creates a new user and redirects to index
router.post("/", async (req, res) => {
  try {
    // try to create a user
    const [user, userCreated] = await db.user.findOrCreate({
      where: { email: req.body.email },
      defaults: { password: req.body.password },
    });
    // if user is new log them in by giving them a cookie
    if (userCreated) {
      res.cookie("userId", user.id);
      res.redirect("/users/profile");
    } else {
      // redirect to the homepage or profile
      // if user was not created, rerender the login form with a message for the user
      console.log("That email already exists");
      res.render("users/new", {
        msg: "email already exists",
      });
    }
  } catch (err) {
    console.warn(err);
  }
});

//GET /users/login -- render a login form
router.get('/login', (req, res) => {
    res.render('users/login.ejs', {message: null})
})
//POST /users/login -- authentication user credentails againt the database
router.post('/login', async(req, res) => {
    try {
        //look up the userin the db based on there email
        const foundUser = await db.user.findOne({
            where: {email: req.body.email}
        })

        const message = 'bad login credentails'
        //if the user is noit found -- dispaly the login form 
        if(!foundUser){
            console.log('email not found on login')
            res.render('/users/login.ejs')
            return // do not continue the function
        }
        //give them a message
        //otherwise, check the provided password agaisnt the password in the data base 
        //hash the passqord from hte req.body and cpmpare it ottghe db password
        if(foundUser.password === req.body.password){
            res.cookie('userId', foundUser.id)
            //TODO: redirect
            res.redirect('/user/profile')
        }else{
            res.render('user/login.ejs', {message})
        }
            //if they match -- send them a cookie! to log them in 
            //if not -- render the login form with a message 
    } catch (error) {
       console.log(error) 
    }
})

//GET /user/logout -- clear the cookie to log the user out
router.get('/logout', (req, res) =>{
    router.get('/logout', (req, res) => {
        //clear the cookie from storage
        res.clearCookie('userId')
        //redirect to root
        res.redirect('/')
    })
})

router.get('/profile', (req, res) => {
        //check if the user is authorized 
        if(!res.locals.user){
            //if the user is not authorized, ask them to log in
            res.render('user.login.ejs', {user: res.locals.user})
            return //end the route here 
        }
        res.render('users/profile.ejs', {user: res.locals.user})
})


module.exports = router