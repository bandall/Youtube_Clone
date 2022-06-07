import User from "../models/User"
import Video from "../models/Video"
import bcrypt from "bcrypt"
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    //console.log(req.body);
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
        return res.status(400).render("join", {pageTitle: "Join", errMsg:error._message});
    }
};
export const edit = (req, res) => res.send("Edit User");
export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username, socialOnly: false});
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

export const startGithubLogin = (req, res) =>{
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope:"read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            }
        })).json();
        //console.log(userData);
        const emailData = await (await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            }
        })).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj) return res.redirect("/login");

        let user = await User.findOne({email: emailObj.email});
        if(!user) {
            user = await User.create({
                name: userData.login,
                avatarUrl: userData.avatar_url,
                username: userData.login, 
                email: emailObj.email,
                socialOnly: true,
                password: "", 
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }
    else {
        res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.flash("info", "Bye Bye");
    req.session.destroy();
    return res.redirect("/");
};


export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"})
};

export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;
    console.log(file);
    let searchParams = [];
    const user = req.session.user;
    if(user.email !== email) searchParams.push({email});
    if(user.username !== username) searchParams.push({username});
    if(searchParams.length !== 0) {
        const exist = await User.findOne({ $or: searchParams });
        if(exist) {
            return res.status(400).render("edit-profile", {pageTitle: "Edit User", err: "Email or UserName has been already taken."});
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
            avatarUrl: file ? file.path : avatarUrl,
            name, email, username, location
        },
        { new : true },
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
}

export const getChangePassword = (req, res) => {
    console.log(req.session.user.socialOnly);
    if(req.session.user.socialOnly === true) {
        req.flash("error", "Social login can't change password");
        return res.redirect("/");
    }
    return res.render("user/change-password", {pageTitle: "Change Password"});
}

export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: { oldpwd, newpwd, newpwdConfirm },
    } = req;
    if(newpwdConfirm !== newpwd) {
        return res.status(400).render("user/change-password", {
            pageTitle: "Change Password", 
            err:"The new Password doesn't match!"
        });
    };
    const user = await User.findById(_id);
    const valid = await bcrypt.compare(oldpwd, user.password);
    if(!valid) {
        return res.status(400).render("user/change-password", {
            pageTitle: "Change Password", 
            err:"The current password is incorrect!"
        });
    }
    
    user.password = newpwd;
    user.save();
    req.flash("info", "Password Changed");
    return res.redirect("/users/logout");
}

export const search = (req, res) => res.send("Logout");

export const see = async (req, res) => { 
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path:"videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if(!user) {
        return res.status(404).render("404", { pageTitle: "User Not Found." });
    }

    return res.render("user/profile", { 
        pageTitle: `${user.name}`,
        user,
    });
};