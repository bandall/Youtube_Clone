import User from "../models/User"
import bcrypt from "bcrypt"
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    console.log(req.body);
    const { name, username, email, password, password2, location } = req.body;
    const exist = await User.exists({$or: [{username}, {email}]});
    if(exist) {
       return res.status(400).render("join", { pageTitle: "Join", errMsg: "This username or email is already taken." });
    }
    if(password !== password2) {
        return res.status(400).render("join", { pageTitle: "Join", errMsg: "Password Confirmation does not match." });
    }
   try {
        await User.create({
            name, 
            username, 
            email, 
            password, 
            location,
        });
    res.redirect("/login");
   } catch (error) {
        console.log(error);
        return res.status(400).render("join", {pageTitle: "Join", errMsg:error._message});
    }
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});
export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username});
    if(!user) {
        return res.status(400).render("login", { pageTitle: "Login", errMsg: "There is no matching Username" });
    }
    const check = await bcrypt.compare(password, user.password);
    if(!check) {
        return res.status(400).render("login", { pageTitle: "Login", errMsg: "Wrong Password." });        
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}
export const logout = (req, res) => res.send("Logout");
export const search = (req, res) => res.send("Logout");
export const see = (req, res) =>{ 
    console.log(req.params);
    res.send("See");
};