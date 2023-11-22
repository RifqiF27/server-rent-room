const request = require("supertest");
const { describe, it, expect } = require("@jest/globals");
const app = require("../app");
const { sequelize } = require("../models");
const { Customer, Bookmark } = require("../models");

beforeAll(async () => {
  try {
    const user = require("../data/user.json").map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await sequelize.queryInterface.bulkInsert("Users", user);

    const type = require("../data/type.json").map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await sequelize.queryInterface.bulkInsert("Types", type);

    const lodging = require("../data/lodging.json").map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await sequelize.queryInterface.bulkInsert("Lodgings", lodging);


    const customer = await Customer.create({
      email: "customer1@mail.com",
      password: "12345678",
    });
    // await sequelize.queryInterface.bulkInsert("Customers", customer);

    const bookmark = await Bookmark.create({
      CustomerId: 1,
      LodgingId: 1,
    });
    // await sequelize.queryInterface.bulkInsert("Bookmark", bookmark);

  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete("Customers", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Lodgings", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Types", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Bookmarks", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

describe("Customer Registration", () => {
  it("should successfully register a customer", async () => {
    const response = await request(app).post("/pub/register").send({
      email: "customer@mail.com",
      password: "12345678",
    });
    console.log(response.body, "<<<<<<<<");
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", expect.any(Number));
    expect(response.body).toHaveProperty("message", expect.any(String));
  });

  it("should handle missing email", async () => {
    const response = await request(app).post("/pub/register").send({
      password: "12345678",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  it("should handle missing password", async () => {
    const response = await request(app).post("/pub/register").send({
      email: "customer@mail.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  it("should handle empty email", async () => {
    const response = await request(app).post("/pub/register").send({
      email: "",
      password: "12345678",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  it("should handle empty password", async () => {
    const response = await request(app).post("/pub/register").send({
      email: "customer@mail.com",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  it("should handle email already registered", async () => {
    const response = await request(app).post("/pub/register").send({
      email: "customer1@mail.com",
      password: "12345678",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email already registered");
  });

  it("should handle invalid email format", async () => {
    const response = await request(app).post("/pub/register").send({
      email: "customer",
      password: "12345678",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email format is invalid");
  });
});

describe("Customer Login", () => {
  it("should successfully log in a customer", async () => {
    const response = await request(app).post("/pub/login").send({
      email: "customer@mail.com",
      password: "12345678",
    });
    console.log(response.body);
    expect(response.status).toBe(200);
    // expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty("access_token", expect.any(String));
  });

  it("should handle incorrect password", async () => {
    const response = await request(app).post("/pub/login").send({
      email: "customer@mail.com",
      password: "87654321",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Invalid Email or Password"
    );
  });

  it("should handle email not registered", async () => {
    const response = await request(app).post("/pub/login").send({
      email: "newCustomer@mail.com",
      password: "12345678",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Email is not registered");
  });
});

describe("Lodgings Customer", () => {
  it("should handle get main lodgings without query filter", async () => {
    const response = await request(app).get("/pub/lodgings");
    console.log(response.body, '>>>>>>');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Object);
  });
  it("should handle get main lodgings with query filter", async () => {
    const response = await request(app).get("/pub/lodgings?");
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Object);
  });
  it("should handle get main lodgings as well as the appropriate length when rendering a specific page ", async () => {
    const response = await request(app).get("/pub/lodgings?page=");
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Object);
  });
  it("should handle get main lodgings according to given id params ", async () => {
    const response = await request(app).get("/pub/lodgings/1");
    console.log(response.body, '<<<<<<<<');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Object);
  });
  it("should handle failed get main lodgings because the given id params does not exist", async () => {
    const response = await request(app).get("/pub/lodgings/21");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Lodging Not Found");
  });
});

describe("Bookmark Customer", () => {
  it("should successfully get list of bookmarks for a logged-in user", async () => {
    const login = await request(app).post("/pub/login").send({
      email: "customer@mail.com",
      password: "12345678",
    })
    const userToken = login.body.access_token;
    const response = await request(app)
      .get("/pub/bookmarks")
      .set("access_token",  userToken);
      console.log(userToken);
      console.log(response.body.data);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array); // Sesuaikan dengan jumlah bookmark yang diharapkan.
  });

  it("should successfully add a bookmark for a logged-in user", async () => {
    const login = await request(app).post("/pub/login").send({
      email: "customer1@mail.com",
      password: "12345678",
    })
    const userToken = login.body.access_token;
    const response = await request(app)
      .post("/pub/bookmarks/1")
      .set("access_token",  userToken);
      console.log(userToken);
      console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("CustomerId", expect.any(Number));
    expect(response.body).toHaveProperty("LodgingId",  expect.any(Number));
  });

  it("should handle adding a bookmark with invalid lodging id", async () => {
    const login = await request(app).post("/pub/login").send({
      email: "customer@mail.com",
      password: "12345678",
    })
    const userToken = login.body.access_token;
    const response = await request(app)
      .post("/pub/bookmarks/99999")
      .set("access_token",  userToken);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Lodging Not Found");
  });

  it("should handle getting bookmarks for a user who is not logged in", async () => {
    const response = await request(app).get("/pub/bookmarks");
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid Token");
  });

  it("should handle getting bookmarks for a user with an invalid token", async () => {
    const userToken = 'invalid_token';
    const response = await request(app)
      .get("/pub/bookmarks")
      .set("access_token",  userToken);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid Token");
  });
});


