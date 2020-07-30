bcrypt = require("bcrypt");
console.log("Hamza");
bcrypt.compare(
  " secret password",
  "$2b$12$s8s7FdMRp2TUJnt.MhhbXumCM1Ge57FNgLL8nSCQ3Xom8jbH0N8Q6",
  function (err, result) {
    if (result == true) {
      console.log("Match");
    } else {
      console.log("Failure");
    }
  }
);
