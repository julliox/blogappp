const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')
require ("../models/Usuario")
const Usuario = mongoose.model("usuarios")

const bcrypt = require("bcryptjs")

const passport= require("passport")


router.get("/registro", (req, res)=>{
    res.render("usuarios/registro")
})

router.post("/registro", (req, res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido!"})     
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email invalido!"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha invalida!"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito pequena! (Menos de 4 caracteres)"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas não são iguais, tente novamente!"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros : erros})
    }else {
        Usuario.findOne({email: req.body.email}).then((usuarios)=>{
            if(usuarios){
                req.flash("erro_msg", "Ja existe uma conta vinculada a esse email no nosso sistema!!!")
                res.redirect("/usuarios/registro")
            }else {
                const novoUsuario = new Usuario ({

                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                })

                bcrypt.genSalt(10, (erro, salt)=> {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if (erro){
                            req.flash("erro_msg", "Houve um erro interno durante o salvamento !")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=>{
                                req.flash("success_msg", "Usuario cadastrado!")
                                res.redirect("/")
                        }).catch((err)=>{
                            req.flash("erro_msg", "Houve um erro interno!")
                            res.redirect("/")
                        })
                    })
                })

            }
        }).catch((err)=>{
            req.flash("erro_msg", "Houve um erro interno!")
            res.redirect("/")
        })
    }


})

router.get("/login", (req, res)=>{
    res.render("usuarios/login")
})

router.post("/login", (req, res, next)=>{

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true

    })(req, res, next)

})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err) 
        }
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect('/')
      })
})




module.exports = router