import multiparty from "multiparty";
import nextConnect from "next-connect";

const middleware = nextConnect();

// Enables parsing of multipart form
middleware.use(async (req, res, next) => {
  const form = new multiparty.Form();

  await form.parse(req, function (err, fields, files) {
    req.body = fields;
    req.files = files;
    next();
  });
});

export default middleware;
