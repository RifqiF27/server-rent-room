const { comparePassword } = require("../helpers/bcrypt");
const { signInToken } = require("../helpers/jwt");
const { User, Lodging, Type, History } = require("../models");
const { Op } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

class Controller {
    static async createLodging(req, res, next) {
        try {
            const data = await Lodging.create({
                ...req.body,
                authorId: req.user.id,
            });
            await History.create({
                name: data.name,
                description: `entity with id ${data.id} created by ${req.user.username}`,
                updatedBy: req.user.username,
            });

            res.status(201).json(data);
        } catch (err) {
            next(err);
            // console.log(err);
            // if (err.name === 'SequelizeValidationError'){
            //     res.status(400).json({message: err.errors.map((el) => { return el.message})})
            // } else {
            //     console.log(err);
            //     res.status(500).json({message: 'Internal server error'})
            // }
        }
    }
    static async showLodging(req, res, next) {
        try {
            const data = await Lodging.findAll({ include: [User] });
            res.status(200).json(data);
        } catch (err) {
            next(err);
            // res.status(500).json({message: 'Internal server error'})
        }
    }
    static async showOneLodging(req, res, next) {
        try {
            const data = await Lodging.findOne({
                where: { id: req.params.id },
            });
            if (!data)
                throw {
                    name: "NotFound",
                    // return res.status(404).json({message: 'lodging not found'})
                };
            res.status(200).json(data);
        } catch (err) {
            next(err);
            // res.status(500).json({message: 'Internal server error'})
        }
    }
    static async deleteLodging(req, res, next) {
        try {
            const data = await Lodging.findOne({
                where: { id: req.params.id },
            });
            // if(!data) throw { name: 'NotFound'
            //     // return res.status(404).json({message: 'lodging not found'})
            // }
            await Lodging.destroy({ where: { id: req.params.id } });
            res.status(200).json({ message: `${data.name} success to delete` });
        } catch (err) {
            next(err);
            // res.status(500).json({message: 'Internal server error'})
        }
    }

    static async showType(req, res, next) {
        try {
            const data = await Type.findAll();
            res.status(200).json(data);
        } catch (err) {
            next(err);
            // console.log("🚀 ~ file: controller.js:66 ~ Controller ~ showType ~ err:", err)
            // res.status(500).json({message: 'Internal server error'})
        }
    }

    static async createType(req, res, next){
        try {
            const data = await Type.create(req.body)
            res.status(201).json(data);
        } catch (err) {
            next(err)
        }
    }
    
    static async deleteType(req, res, next){
        try {
            const data = await Type.findOne({ where: {id: req.params.id}})
            await Type.destroy({ where: { id: req.params.id } });
            res.status(200).json({ message: `${data.name} success to delete` });
        } catch (err) {
            next(err)
        }
    }

    static async register(req, res, next) {
        try {
            // const {username, email, password, role, phoneNumber, address} = req.body
            const data = await User.create(req.body);
            const access_token = signInToken({ id: data.id });
            res.status(201).json({
                access_token,
                message: `User with id ${data.id} has been created`,
            });
        } catch (err) {
            next(err);
            // console.log("🚀 ~ file: controller.js:79 ~ Controller ~ register ~ err:", err)
            // if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError'){
            //     res.status(400).json({message: err.errors.map((el) => { return el.message})})
            // } else {
            //     console.log(err);
            //     res.status(500).json({message: 'Internal server error'})
            // }
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw { name: "InvalidInput" };
            const data = await User.findOne({ where: { email } });
            if (!data)
                throw {
                    name: "InvalidEmail/Password",
                    // return  res.status(401).json({message: `Invalid email or password`})
                };
            console.log(password, data.password, "<<<<<");
            const isPasswordValid = comparePassword(password, data.password);
            if (!isPasswordValid)
                throw {
                    name: "InvalidEmail/Password",
                    // return  res.status(401).json({message: `Invalid email or password`})
                };
            const access_token = signInToken({ id: data.id });
            res.status(200).json({ access_token });
        } catch (err) {
            next(err);
            // console.log("🚀 ~ file: controller.js:103 ~ Controller ~ login ~ err:", err)
            // if (err.name === 'SequelizeValidationError'){
            //     res.status(400).json({message: err.errors.map((el) => { return el.message})})
            // } else {
            //     console.log(err);
            //     res.status(500).json({message: 'Internal server error'})
            // }
        }
    }
    static async googleLogin(req, res, next) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: req.headers.google_token,
                audience: process.env.GOOGLE_CLIENT,
            });
            const payload = ticket.getPayload();
            // console.log(ticket, '<<<<< ticket');
            // console.log(payload, '<<<<<< payload');
            let user = await User.findOne({
                where: { email: payload.email },
            });
            if (!user) {
                user = await User.create(
                    {
                        email: payload.email,
                        username: payload.name,
                        password: String(Math.random() * 99197898),
                        phoneNumber: "default",
                        address: "default",
                        role: "Staff",
                    },
                    {
                        hooks: false,
                    }
                );
            }
            let access_token = signInToken({
                id: user.id,
            });
            // console.log(user,'<<<<< user');
            // console.log(access_token, "<<<<<< access token");
            res.status(200).json({
                access_token,
                id: user.id,
                username: user.username,
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async editLodging(req, res, next) {
        try {
            // console.log(req.user);
            const data = await Lodging.update(
                { ...req.body, authorId: req.user.id },
                {
                    where: { id: req.params.id },
                    returning: true,
                }
            );
            await History.create({
                name: data[1][0].name,
                description: `entity with id ${data[1][0].id} updated by ${req.user.username}`,
                updatedBy: req.user.username,
            });
            if (!data[0]) throw { name: "NotFound" };
            // console.log(data,'<<<<<<<');
            res.status(200).json(data[1][0]);
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async statusLodging(req,res,next) {
        try {
            const {status} = req.body
            const previousData = await Lodging.findByPk(req.params.id)

            const data = await Lodging.update({status},{
                where: {id: req.params.id},
                returning: true
                
            })

            await History.create({
                name: data[1][0].name,
                description: `entity with id ${data[1][0].id} status has been updated from ${previousData.status} to ${status} by ${req.user.username}`,
                updatedBy: req.user.username,
            });

            if (!data[0]) throw { name: "NotFound" };
            // console.log(data,'<<<<<<<');
            res.status(200).json(data[1][0]);
        } catch (err) {
            next(err)
        }
    }

    static async showHistory(req, res, next) {
        try {
            const data = await History.findAll({
                order: [["id", "DESC"]]
            })
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = Controller;
