const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Model de Usuario 
require("../src/models/Usuario")
const Usuario = mongoose.model("usuarios")


module.exports = function(passport) {

    passport.use(new localStrategy ({usernameField:"email", passwordField:"senha"}, (email, senha, done) => {

        Usuario.findOne({email: email}).then((usuarios)=>{

            if (!usuarios) {
                return done(null, false, {message: "Essa conta não existe!"})
            }

            bcrypt.compare(senha, usuarios.senha, (erro, batem)=>{

                if(batem){
                    return done(null, usuarios)
                }else {
                    return done(null, false, {message: "Senha ou e-mail incorreto(s)"})
                }

            })
        })
    }))

    passport.serializeUser((usuario, done) => {

        done(null, usuario.id)

    })

    passport.deserializeUser((id, done)=>{
        Usuario.findById(id).then((usuario)=>{
            done(null, usuario)
        }).catch((err)=>{
            done(err)
        })
    })


}