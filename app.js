const express = require("express");

const app = express();

const handlebars = require('express-handlebars')

const bodyParser = require('body-parser')

const admin = require('./src/routes/admin')

const path = require('path')

const mongoose = require('mongoose')

const session = require('express-session')

const flash = require('connect-flash');
const { get } = require("http");

require("./src/models/Postagem")
const Postagem = mongoose.model("postagem")

require("./src/models/Categoria")
const Categoria = mongoose.model("categoria")

//config

    //Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
        //Middleware
            app.use((req, res , next) => {
                res.locals.success_msg = req.flash("success_msg")
                res.locals.error_msg = req.flash("error_msg")
                next()
            })
    //Tamplate Engine Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main', 
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }}))
        app.set('view engine', 'handlebars')
    //Body Parser
        app.use(bodyParser.urlencoded({extended: false}))
        app.use(bodyParser.json())
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://127.0.0.1:27017/appblog", { useNewUrlParser: true }).then(()=>{
            console.log("Banco conectado com sucesso!!!")
        }).catch((err)=>{
            console.log("Houve um erro ao se conectar ao banco:" +err)
        })
    //public
        app.use(express.static(path.join(__dirname,"public")))

//Rota

app.get("/" , (req, res)=> {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("index", {postagens: postagens})
    }).catch((err)=>{
        req.flash("msg_error", "Rota nao encontrada")
        res.redirect("/404")
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if (postagem) {
            res.render("postagem/index", {postagem: postagem})
        }else{
            req.flash("error_msg", "Essa postagem não existe!")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/")
    })
})

app.get("/categorias", (req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render("categoria/index", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res)=>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categorias)=>{
        if (categorias) {

            Postagem.find({categoria: categorias._id}).lean().then((postagens)=>{
                res.render("categoria/postagens", {postagens: postagens , categorias: categorias})
            }).catch((err)=>{
                req.flash("error_msg", "Essa categoria não existe!")
                res.redirect("/") 
            })

        }else{
            req.flash("error_msg", "Essa categoria não existe!")
            res.redirect("/")    
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/")
    })
})

app.get("/404", (req, res)=>{
    res.send("rota nao encontrada ERRO:404")
})

app.use('/admin', admin)

//outros
const PORT = 8081
app.listen(PORT , ()=>{
    console.log('Servidor rodando')
})