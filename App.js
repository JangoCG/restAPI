const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//Verbindung zur DB aufbauen
mongoose.connect("mongodb://localhost:27017/thesisDB", {
    //Um Warnmeldungen zu fixen.
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Schema für die Verbräuche erstellen.
const verbrauchSchema = {
    bezeichnung: String,
    stueckzahl: Number,
    monat: Number,
    jahr: Number
};

//Modell erstellen für die Einträge, als Vorlage wird das verbrauchSchema verwendet.
//Modell ist ein constructor compiled aus der Schema definition. Eine Instanz eines
//Modells heißt "document". Das erste Argument wird im Singular geschrieben, Mongooose
//sucht dann automatisch nach der kleingeschriebenen Plural Version also ist "Consumption"
//für die "consumptions" collection in der Datenbank.
const Verbrauch = mongoose.model("Consumption", verbrauchSchema);

// Chained app.route Methode von Express. Die ganzen Methoden werden durch einen . 
// an app.route angehängt
app.route("/verbrauch")
    //*****************Anfragen die alle Einträge betreffen ********************/
    .get((req, res) => {
        Verbrauch.find(function (err, gefundeneEintraege) {
            if (!err) {
                res.send(gefundeneEintraege);
            } else {
                res.send(err);
            }
        });
    })

    .post((req, res) => {
        const neuerVerbrauch = new Verbrauch({
            bezeichnung: req.body.bezeichnung,
            stueckzahl: req.body.stueckzahl,
            monat: req.body.monat,
            jahr: req.body.jahr
        });
        //Callback Funktion im Save antwortet dem Client mit Success/Error
        neuerVerbrauch.save(function (err) {
            if (!err) {
                res.send("Der Eintrag wurde erfolgreich hinzugefügt");
            } else {
                res.send(err);
            }
        });
    })

    .delete((req, res) => {
        Verbrauch.deleteMany(function (err) {
            if (!err) {
                res.send("Alle Einträge wurden erfolgreich gelöscht");
            } else {
                res.send(err);
            }
        })
    });

//*****************Anfragen für spezifische Einträge ********************/
app.route("/verbrauch/:parameterVariable")

    .get((req, res) => {
        Verbrauch.findOne({
            bezeichnung: req.params.parameterVariable
        }, (err, gefundeneEintraege) => {
            if (gefundeneEintraege) {
                res.send(gefundeneEintraege);
            } else {
                res.send("Es wurden keine Maschinen mit dieser Bezeichnung gefunden");
            }
        });
    })

    //Put ersetzt das komplette Document(Eintrag) durch ein neues Document
    .put((req, res) => {
        Verbrauch.update({
                bezeichnung: req.params.parameterVariable
            }, {
                bezeichnung: req.body.bezeichnung,
                stueckzahl: req.body.stueckzahl,
                monat: req.body.monat,
                jahr: req.body.jahr,
            }, {
                overwrite: true
            },
            err => {
                if (!err) {
                    res.send("Die Einträge wurden erfolgreich aktualisiert");
                }
            }
        );
    })

    //Patch ersetzt nur einzelne Zeile des Documents(Eintrags)
    //Der Eintrag wird quasi gepatcht.
    .patch((req, res) => {
        Verbrauch.update({
                bezeichnung: req.params.parameterVariable
            }, {
                $set: req.body
            },
            err => {
                if (!err) {
                    res.send("Der Eintrag wurde erfolgreich aktualisiert")
                } else {
                    res.send(err);
                }
            }
        );
    })

    .delete((req, res) => {
        Verbrauch.deleteOne({
                bezeichnung: req.params.parameterVariable
            },
            err => {
                if (!err) {
                    res.send("Der Eintrag wurde erfolgreich gelöscht");
                } else {
                    res.send(err);
                }
            }
        );
    });

app.listen(3000, function () {
    console.log("Server gestartet auf Port 3000");
})