// required packages
const cookieParser = require('cookie-parser')
const express = require('express')
const rowdy = require('rowdy-logger')
const db = require('./models')

// app config
const PORT = process.env.PORT || 3000
const app = express()
app.set('view engine', 'ejs')

// middlewares
const rowdyRes = rowdy.begin(app)
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

//DIY middleware
//happens on every request
app.use((req, res, next) => {
  //handy dandy debugging request logger
  console.log(`[${new Date().toLocaleString()}] incoming request ${req.method} ${req.url}`)
  console.log("request body:", req.body)
  //modify the response to give data to the routes/middleware that is 'downstream'
  res.locals.myData = 'hi i came from a middleware'
  //tell express that they middleware is done 
  next()
})


//auth middleware
app.use(async (req, res, next) => {
  try {
    //if there is a cookies 
  if(req.cookies.userId){
    const userId = req.cookies.userId
    //try to find the user in the database 
    const user = await db.user.findByPk(userId)
    //mount the found user on the res.locals so that later routes can access the login in user
    res.locals.user = user
  }else {
    //the user is explicitly not logged in
    res.locals.user = null
  }
  } catch (error) {
    console.log(error)
  }finally {
    next()//forge ahead in case of error

  }
  

 
})
// routes
app.get('/', (req, res) => {
  console.log(res.locals)
  res.render('index')
})

//controller section 
app.use('/users', require('./controllers/users'))

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print()
})
