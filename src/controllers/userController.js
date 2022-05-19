export const join = (req, res) => res.send("join");
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
export const search = (req, res) => res.send("Logout");
export const see = (req, res) =>{ 
    console.log(req.params);
    res.send("See");
}