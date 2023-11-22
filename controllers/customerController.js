const { comparePassword } = require("../helpers/bcrypt");
const { signInToken } = require("../helpers/jwt");
const { User, Customer, Lodging, Type, History, Bookmark} = require("../models");
const { Op } = require("sequelize");
const axios = require('axios')
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

class Controller {
  static async register(req, res, next) {
    try {
      const data = await Customer.create(req.body);
      // const access_token = signInToken({ id: data.id });
      res.status(201).json({
        id: data.id,
        message: `Customer with id ${data.id} has been created`,
      });
    } catch (err) {
      next(err);
    }
  }
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw { name: "InvalidInput" };
      const data = await Customer.findOne({ where: { email } });
      if (!data)
        throw {
          name: "InvalidEmail",
        };
      console.log(password, data.password, "<<<<<");
      const isPasswordValid = comparePassword(password, data.password);
      if (!isPasswordValid)
        throw {
          name: "InvalidEmail/Password",
        };
      const access_token = signInToken({ id: data.id });
      res.status(200).json({ access_token, data });
    } catch (err) {
      next(err);
    }
  }
  // static async googleLogin(req, res, next) {
  //   try {
  //     const ticket = await client.verifyIdToken({
  //       idToken: req.headers.google_token,
  //       audience: process.env.GOOGLE_CLIENT,
  //     });
  //     const payload = ticket.getPayload();
  //     // console.log(ticket, '<<<<< ticket');
  //     // console.log(payload, '<<<<<< payload');
  //     let customer = await Customer.findOne({
  //       where: { email: payload.email },
  //     });
  //     if (!customer) {
  //       customer = await Customer.create(
  //         {
  //           email: payload.email,
  //           password: String(Math.random() * 99197898),
  //           role: "Customer",
  //         },
  //         {
  //           hooks: false,
  //         }
  //       );
  //     }
  //     let access_token = signInToken({
  //       id: customer.id,
  //     });
  //     // console.log(user,'<<<<< user');
  //     // console.log(access_token, "<<<<<< access token");
  //     res.status(200).json({
  //       access_token,
  //       id: customer.id,
  //       username: customer.username,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     next(err);
  //   }
  // }

  static async showLodgingPagination(req, res, next) {
    try {
      const page = req.query.page ? +req.query.page : 1;
      const itemsPerPage = req.query.itemsPerPage ? +req.query.itemsPerPage : 9;

      const option = {
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        include: [
          {
            model: Type,
            where: {},
          },
        ],
        where: {},
        order: [["id", "ASC"]],
      };

      if (req.query.location)
        option.where = {
          location: {
            [Op.iLike]: `%${req.query.location}%`,
          },
        };
      if (req.query.name)
        option.include[0].where = {
          name: {
            [Op.iLike]: `%${req.query.name}%`,
          },
        };

      const data = await Lodging.findAndCountAll(option);
      if (!data) throw { name: "NotFound" };
      const totalPage = Math.ceil(data.count / itemsPerPage);
      //   console.log(data);
      res.status(200).json({ data: data, totalPage: totalPage });
    } catch (err) {
      console.log(
        "🚀 ~ file: customerController.js:89 ~ Controller ~ showLodging ~ err:",
        err
      );
      next(err);
    }
  }

  static async detailLodgings(req, res, next) {
    try {
      const BASE_URL = 'https://hck-63-challenge3.web.app'
      const API_KEY = "B5MFJUA58qhKSnDmp4qFOSmXgJ-Hz2lIz4D9S1avfGu1CtdnYKPdH7FH879I_q6W";
      const QR_CODE = {
        url: `https://api.qr-code-generator.com/v1/create?access-token=${API_KEY}`,
        method: "post",
        data: {
          frame_name: "no-frame",
          qr_code_text: `${BASE_URL}/lodgings/${req.params.id}`,
          image_format: "SVG",
          qr_code_logo: "scan-me-square",
        },
      }
      const data = await Lodging.findOne({ where: { id: req.params.id } });
      if (!data) throw { name: "NotFound" };
      const response = await axios.request(QR_CODE)
      res.status(200).json({ data: data, QR_CODE: response.data });
    } catch (err) {
      next(err);
    }
  }
  

  static async showBookmark(req, res, next) {
    try {
      const data = await Bookmark.findAll({
        include: [Lodging],
        where: { CustomerId: req.customer.id },
        order: [["createdAt", "ASC"]],
      });
      res.status(200).json({ data: data });
    } catch (err) {
      next(err);
    }
  }
  static async postBookmark(req, res, next) {
    try {
      const lodging = await Lodging.findByPk(req.params.id);
      if (!lodging) throw { name: "NotFound" };
      const bookmark = await Bookmark.create({
        CustomerId: req.customer.id,
        LodgingId: req.params.id,
      });
      res.status(200).json(bookmark);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Controller;
