var formidable = require("formidable");

module.exports = function(req, res, next) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    if (err) return next(err);

    req.fields = fields;
    req.files  = files;

    next();
  });
}
