const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database("./tripbooking.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the tripbooking database.");
  }
});

app.use(express.json());

// ------------------------------------------------------------
// DESTINATIONS CRUD
// ------------------------------------------------------------
// Get all destinations
app.get("/destinations", (req, res) => {
  db.all("SELECT * FROM destination", [], (err, rows) => {
    handleResponse(res, err, rows);
  });
});

// Get a specific destination
app.get("/destinations/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM destination WHERE idx = ?", [id], (err, row) => {
    handleResponse(res, err, row, 404, "Destination not found");
  });
});

// Create a new destination
app.post("/destinations", (req, res) => {
  const { zone } = req.body;
  db.run("INSERT INTO destination (zone) VALUES (?)", [zone], function (err) {
    handleResponse(
      res,
      err,
      { message: "Destination created successfully", id: this.lastID },
      500,
      "Failed to create destination"
    );
  });
});

// Update a destination
app.put("/destinations/:id", (req, res) => {
  const id = req.params.id;
  const { zone } = req.body;
  db.run(
    "UPDATE destination SET zone = ? WHERE idx = ?",
    [zone, id],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Destination updated successfully" },
        404,
        "Destination not found",
        this.changes
      );
    }
  );
});

// Delete a destination
app.delete("/destinations/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM destination WHERE idx = ?", [id], function (err) {
    handleResponse(
      res,
      err,
      { message: "Destination deleted successfully" },
      404,
      "Destination not found",
      this.changes
    );
  });
});

// ------------------------------------------------------------
// TRIPS CRUD
// ------------------------------------------------------------
// Get all trips
app.get("/trips", (req, res) => {
  const sql = `
    SELECT 
      t.idx, 
      t.name, 
      t.country, 
      t.coverimage, 
      t.detail, 
      t.price, 
      t.duration,
      d.zone AS destination_zone 
    FROM 
      trip AS t
    JOIN 
      destination AS d ON t.destinationid = d.idx
  `;

  db.all(sql, [], (err, rows) => {
    handleResponse(res, err, rows);
  });
});

// Get a specific trip
app.get("/trips/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      t.idx, 
      t.name, 
      t.country, 
      t.coverimage, 
      t.detail, 
      t.price, 
      t.duration,
      d.zone AS destination_zone 
    FROM 
      trip AS t
    JOIN 
      destination AS d ON t.destinationid = d.idx
    WHERE 
      t.idx = ?
  `;

  db.get(sql, [id], (err, row) => {
    handleResponse(res, err, row, 404, "Trip not found");
  });
});

// Create a new trip
app.post("/trips", (req, res) => {
  const { name, country, destinationid, coverimage, detail, price, duration } =
    req.body;
  db.run(
    "INSERT INTO trip (name, country, destinationid, coverimage, detail, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, country, destinationid, coverimage, detail, price, duration],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Trip created successfully", id: this.lastID },
        500,
        "Failed to create trip"
      );
    }
  );
});

// Update a trip
app.put("/trips/:id", (req, res) => {
  const id = req.params.id;
  const { name, country, destinationid, coverimage, detail, price, duration } =
    req.body;
  db.run(
    "UPDATE trip SET name = ?, country = ?, destinationid = ?, coverimage = ?, detail = ?, price = ?, duration = ? WHERE idx = ?",
    [name, country, destinationid, coverimage, detail, price, duration, id],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Trip updated successfully" },
        404,
        "Trip not found",
        this.changes
      );
    }
  );
});

// Delete a trip
app.delete("/trips/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM trip WHERE idx = ?", [id], function (err) {
    handleResponse(
      res,
      err,
      { message: "Trip deleted successfully" },
      404,
      "Trip not found",
      this.changes
    );
  });
});

// ------------------------------------------------------------
// CUSTOMERS CRUD
// ------------------------------------------------------------
// Get all customers
app.get("/customers", (req, res) => {
  db.all("SELECT * FROM customer", [], (err, rows) => {
    if (err) {
      handleResponse(res, err);
      return;
    }

    // Remove password from each customer object
    const sanitizedRows = rows.map(row => {
      const sanitizedRow = { ...row };
      delete sanitizedRow.password;
      return sanitizedRow;
    });

    handleResponse(res, null, sanitizedRows); 
  });
});

// Get a specific customer
app.get("/customers/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM customer WHERE idx = ?", [id], (err, row) => {
    if (err) {
      handleResponse(res, err, null, 404, "Customer not found");
      return;
    }

    if (!row) {
      handleResponse(res, null, null, 404, "Customer not found");
      return;
    }

    // Remove password from the response data
    const sanitizedRow = { ...row };
    delete sanitizedRow.password;

    handleResponse(res, null, sanitizedRow);
  });
});

// Create a new customer
app.post("/customers", (req, res) => {
  const { fullname, phone, email, image, password } = req.body;
  db.run(
    "INSERT INTO customer (fullname, phone, email, image, password) VALUES (?, ?, ?, ?, ?)",
    [fullname, phone, email, image, password],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Customer created successfully", id: this.lastID },
        500,
        "Failed to create customer"
      );
    }
  );
});

// Update a customer
app.put("/customers/:id", (req, res) => {
  const id = req.params.id;
  const { fullname, phone, email, image } = req.body;
  db.run(
    "UPDATE customer SET fullname = ?, phone = ?, email = ?, image = ? WHERE idx = ?",
    [fullname, phone, email, image, id],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Customer updated successfully" },
        404,
        "Customer not found",
        this.changes
      );
    }
  );
});

// Delete a customer
app.delete("/customers/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM customer WHERE idx = ?", [id], function (err) {
    handleResponse(
      res,
      err,
      { message: "Customer deleted successfully" },
      404,
      "Customer not found",
      this.changes
    );
  });
});

app.post("/customers/login", (req, res) => {
  const { phone, password } = req.body;

  // Basic validation (you should add more robust validation in a real app)
  if (!phone || !password) {
    res.status(400).json({ error: "Phone and password are required" });
    return;
  }

  const sql = "SELECT * FROM customer WHERE phone = ? AND password = ?";
  db.get(sql, [phone, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(401).json({ error: "Invalid phone or password" });
      return;
    }

    // Successful login - remove password from response
    const customerData = { ...row }; // Create a copy
    delete customerData.password; // Remove the password field

    res.json({ message: "Login successful", customer: customerData });
  });
});

// ------------------------------------------------------------
// MEETINGS CRUD
// ------------------------------------------------------------
// Get all meetings
app.get("/meetings", (req, res) => {
  db.all("SELECT * FROM meeting", [], (err, rows) => {
    handleResponse(res, err, rows);
  });
});

// Get a specific meeting
app.get("/meetings/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM meeting WHERE idx = ?", [id], (err, row) => {
    handleResponse(res, err, row, 404, "Meeting not found");
  });
});

// Create a new meeting
app.post("/meetings", (req, res) => {
  const { detail, meetingdatetime, latitude, longitude } = req.body;
  db.run(
    "INSERT INTO meeting (detail, meetingdatetime, latitude, longitude) VALUES (?, ?, ?, ?)",
    [detail, meetingdatetime, latitude, longitude],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Meeting created successfully", id: this.lastID },
        500,
        "Failed to create meeting"
      );
    }
  );
});

// Update a meeting
app.put("/meetings/:id", (req, res) => {
  const id = req.params.id;
  const { detail, meetingdatetime, latitude, longitude } = req.body;
  db.run(
    "UPDATE meeting SET detail = ?, meetingdatetime = ?, latitude = ?, longitude = ? WHERE idx = ?",
    [detail, meetingdatetime, latitude, longitude, id],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Meeting updated successfully" },
        404,
        "Meeting not found",
        this.changes
      );
    }
  );
});

// Delete a meeting
app.delete("/meetings/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM meeting WHERE idx = ?", [id], function (err) {
    handleResponse(
      res,
      err,
      { message: "Meeting deleted successfully" },
      404,
      "Meeting not found",
      this.changes
    );
  });
});

// ------------------------------------------------------------
// BOOKINGS CRUD
// ------------------------------------------------------------
// Get all bookings
app.get("/bookings", (req, res) => {
  db.all("SELECT * FROM booking", [], (err, rows) => {
    handleResponse(res, err, rows);
  });
});

// Get a specific booking
app.get("/bookings/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM booking WHERE idx = ?", [id], (err, row) => {
    handleResponse(res, err, row, 404, "Booking not found");
  });
});

// Create a new booking
app.post("/bookings", (req, res) => {
  const { customerid, bookdatetime, tripid, meetingid } = req.body;
  db.run(
    "INSERT INTO booking (customerid, bookdatetime, tripid, meetingid) VALUES (?, ?, ?, ?)",
    [customerid, bookdatetime, tripid, meetingid],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Booking created successfully", id: this.lastID },
        500,
        "Failed to create booking"
      );
    }
  );
});

// Update a booking
app.put("/bookings/:id", (req, res) => {
  const id = req.params.id;
  const { customerid, bookdatetime, tripid, meetingid } = req.body;
  db.run(
    "UPDATE booking SET customerid = ?, bookdatetime = ?, tripid = ?, meetingid = ? WHERE idx = ?",
    [customerid, bookdatetime, tripid, meetingid, id],
    function (err) {
      handleResponse(
        res,
        err,
        { message: "Booking updated successfully" },
        404,
        "Booking not found",
        this.changes
      );
    }
  );
});

// Delete a booking
app.delete("/bookings/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM booking WHERE idx = ?", [id], function (err) {
    handleResponse(
      res,
      err,
      { message: "Booking deleted successfully" },
      404,
      "Booking not found",
      this.changes
    );
  });
});

// ------------------------------------------------------------
// HELPER FUNCTION
// ------------------------------------------------------------
// Helper function to handle API responses
function handleResponse(
  res,
  err,
  data,
  notFoundStatusCode = 404,
  notFoundMessage = "Not found",
  changes = null
) {
  if (err) {
    res.status(500).json({ error: err.message });
    return;
  }
  if (!data && !changes) {
    res.status(notFoundStatusCode).json({ error: notFoundMessage });
    return;
  }
  res.json(data);
}

var os = require("os");
var ip = "0.0.0.0";
var ips = os.networkInterfaces();
Object.keys(ips).forEach(function (_interface) {
  ips[_interface].forEach(function (_dev) {
    if (_dev.family === "IPv4" && !_dev.internal) ip = _dev.address;
  });
});

app.listen(port, () => {
  console.log(`Trip booking API listening at http://${ip}:${port}`);
});
