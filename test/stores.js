const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");

//Assertion style
chai.should();

chai.use(chaiHttp);

describe("Store API", () => {
  // ---------------------------- Get all the Stores
  describe("GET /stores", () => {
    it("It should GET all the stores", (done) => {
      chai
        .request(server)
        .get("/stores")
        .end((err, response) => {
          if (err) {
            console.log(err);
            done();
          }
          response.should.have.status(200);
          response.body.should.be.a("array");
          //response.body.length.should.be.eq(4);
          done();
        });
    });
  });

  //   ------------------------------ Get Store by id (StoreID dependent)
  describe("GET /stores/:storeID", () => {
    it("It should get a store with given store id", (done) => {
      chai
        .request(server)
        .get("/stores/602899e43bac93c234e25277")
        .end((err, response) => {
          if (err) {
            console.log(err);
            done();
          }
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("_id");
          response.body.should.have.property("ownerID");
          response.body.should.have.property("name").to.be.a("string");
          done();
        });
    });
  });
});
