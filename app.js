const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//Für lokale DB
mongoose.connect("mongodb://localhost:27017/thesisDB", {
    //Um Warnmeldungen zu fixen.
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// //Für Online DB Verbindung
// mongoose.connect("mongodb+srv://admin-cengiz:jangoadminasdf@cluster0-5vxjv.mongodb.net/thesisAPI", {
//     //Um Warnmeldungen zu fixen.
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });




//Schema für die Verbräuche erstellen.
const consumptionSchema = {
    name: String,
    amount: Number,
    month: Number,
    year: Number
};

//Modell erstellen für die Einträge, als Vorlage wird das verbrauchSchema verwendet.
//Modell ist ein constructor compiled aus der Schema definition. Eine Instanz eines
//Modells heißt "document". Das erste Argument wird im Singular geschrieben, Mongooose
//sucht dann automatisch nach der kleingeschriebenen Plural Version also ist "Consumption"
//für die "consumptions" collection in der Datenbank.
const Consumption = mongoose.model("Consumption", consumptionSchema);

// Chained app.route Methode von Express. Die ganzen Methoden werden durch einen . 
// an app.route angehängt
app.route("/consumption")
    //*****************Anfragen die alle Einträge betreffen ********************/
    .get((req, res) => {
        Consumption.find(function (err, foundRecords) {
            if (!err) {
                res.send(foundRecords);
            } else {
                res.send(err);
            }
        });
    })

    .post((req, res) => {
        const newEntry = new Consumption({
            name: req.body.name,
            amount: req.body.amount,
            month: req.body.month,
            year: req.body.year
        });
        //Callback Funktion im Save antwortet dem Client mit Success/Error
        newEntry.save(function (err) {
            if (!err) {
                res.send("Successfully added the record.");
            } else {
                res.send(err);
            }
        });
    })

    .delete((req, res) => {
        Consumption.deleteMany(function (err) {
            if (!err) {
                res.send("Successfully deleted all records.");
            } else {
                res.send(err);
            }
        })
    });

//*****************Anfragen für spezifische Einträge ********************/
app.route("/consumption/:parameterVariable")

    .get((req, res) => {
        Consumption.findOne({
            name: req.params.parameterVariable
        }, (err, foundRecords) => {
            if (foundRecords) {
                res.send(foundRecords);
            } else {
                res.send("No records found with that name.");
            }
        });
    })

    //Put ersetzt das komplette Document(Eintrag) durch ein neues Document
    .put((req, res) => {
        Consumption.update({
                name: req.params.parameterVariable
            }, {
                name: req.body.name,
                amount: req.body.amount,
                month: req.body.month,
                year: req.body.year,
            }, {
                overwrite: true
            },
            err => {
                if (!err) {
                    res.send("Succesfully updated all records.");
                }
            }
        );
    })

    //Patch ersetzt nur einzelne Zeile des Documents(Eintrags)
    //Der Eintrag wird quasi gepatcht.
    .patch((req, res) => {
        Consumption.update({
                name: req.params.parameterVariable
            }, {
                $set: req.body
            },
            err => {
                if (!err) {
                    res.send("Succesfully updated the record.")
                } else {
                    res.send(err);
                }
            }
        );
    })

    .delete((req, res) => {
        Consumption.deleteOne({
                name: req.params.parameterVariable
            },
            err => {
                if (!err) {
                    res.send("Succesfully deleted the record.");
                } else {
                    res.send();
                }
            }
        );
    });

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 3000;
    }
    //  <---
    app.listen(port, function () {
        console.log("Server started on port 3000")
    });
