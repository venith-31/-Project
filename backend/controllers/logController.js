const Log = require("../models/Log");

const ALLOWED_FILTER_FIELDS = [
  "actor",
  "role",
  "action",
  "resourceType",
  "region",
  "severity",
  "status",
];

const ALLOWED_SORT_FIELDS = [
  "timestamp",
  "actor",
  "action",
  "severity",
  "status",
  "region",
];

// POST /api/logs/bulk
// Accepts { logs: [ {...}, {...}, ... ] } - designed to handle 10,000+ records.
exports.bulkUpload = async (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ message: "Request body must contain a non-empty 'logs' array." });
    }

    const MAX_RECORDS = 20000;
    if (logs.length > MAX_RECORDS) {
      return res.status(400).json({ message: `Too many records. Max allowed per request is ${MAX_RECORDS}.` });
    }

    // Normalize timestamps to Date objects and drop obviously invalid rows
    // instead of failing the whole batch.
    const prepared = [];
    const rejected = [];

    logs.forEach((log, idx) => {
      if (!log || typeof log !== "object" || !log.actor || !log.action || !log.timestamp) {
        rejected.push({ index: idx, reason: "Missing required field (actor, action, timestamp)." });
        return;
      }
      const ts = new Date(log.timestamp);
      if (isNaN(ts.getTime())) {
        rejected.push({ index: idx, reason: "Invalid timestamp." });
        return;
      }
      prepared.push({ ...log, timestamp: ts });
    });

    // insertMany with ordered:false = fastest bulk insert; keeps inserting
    // valid docs even if some fail validation, instead of aborting the batch.
    let insertedCount = 0;
    let insertErrors = [];

    if (prepared.length > 0) {
      try {
        const result = await Log.insertMany(prepared, { ordered: false });
        insertedCount = result.length;
      } catch (bulkErr) {
        // insertMany with ordered:false throws after attempting all docs;
        // bulkErr.insertedDocs (Mongoose) tells us what actually succeeded.
        insertedCount = bulkErr.insertedDocs ? bulkErr.insertedDocs.length : 0;
        insertErrors = (bulkErr.writeErrors || []).map((e) => ({
          index: e.index,
          reason: e.errmsg,
        }));
      }
    }

    return res.status(201).json({
      message: "Bulk upload processed.",
      totalReceived: logs.length,
      inserted: insertedCount,
      rejected: rejected.length + insertErrors.length,
      rejectedDetails: [...rejected, ...insertErrors].slice(0, 50), // cap response size
    });
  } catch (err) {
    console.error("bulkUpload error:", err);
    return res.status(500).json({ message: "Server error during bulk upload." });
  }
};

// GET /api/logs
// Query params: page, limit, sortBy, sortOrder, search, from, to,
// plus any of ALLOWED_FILTER_FIELDS (actor, role, action, resourceType, region, severity, status)
exports.getLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 200);
    const skip = (page - 1) * limit;

    const query = {};

    // Field-level exact filters
    ALLOWED_FILTER_FIELDS.forEach((field) => {
      if (req.query[field]) {
        query[field] = req.query[field];
      }
    });

    // Date range filter on timestamp
    if (req.query.from || req.query.to) {
      query.timestamp = {};
      if (req.query.from) query.timestamp.$gte = new Date(req.query.from);
      if (req.query.to) query.timestamp.$lte = new Date(req.query.to);
    }

    // Free-text search across a few key fields (partial match)
    if (req.query.search) {
      const term = req.query.search.trim();
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { actor: regex },
        { action: regex },
        { resource: regex },
        { ipAddress: regex },
      ];
    }

    // Sorting
    let sortBy = req.query.sortBy;
    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) sortBy = "timestamp";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [logs, total] = await Promise.all([
      Log.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Log.countDocuments(query),
    ]);

    return res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getLogs error:", err);
    return res.status(500).json({ message: "Server error while fetching logs." });
  }
};

// GET /api/logs/facets
// Returns distinct values for filter dropdowns (severity, status, region, etc.)
exports.getFacets = async (req, res) => {
  try {
    const [severity, status, region, action, resourceType] = await Promise.all([
      Log.distinct("severity"),
      Log.distinct("status"),
      Log.distinct("region"),
      Log.distinct("action"),
      Log.distinct("resourceType"),
    ]);
    return res.json({ severity, status, region, action, resourceType });
  } catch (err) {
    console.error("getFacets error:", err);
    return res.status(500).json({ message: "Server error while fetching facets." });
  }
};
