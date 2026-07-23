const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    action: { type: String, required: true, trim: true },
    resource: { type: String, trim: true },
    resourceType: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    region: { type: String, trim: true },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    status: {
      type: String,
      enum: ["Unresolved", "Investigating", "Resolved"],
      default: "Unresolved",
    },
    timestamp: { type: Date, required: true },
  },
  {
    timestamps: true, // adds createdAt/updatedAt (record ingestion time)
  }
);

// Indexes to make server-side filter/sort/pagination fast at scale.
LogSchema.index({ timestamp: -1 });
LogSchema.index({ severity: 1 });
LogSchema.index({ status: 1 });
LogSchema.index({ region: 1 });
LogSchema.index({ action: 1 });
LogSchema.index({ actor: 1 });

// Text index to support free-text search across a few key fields.
LogSchema.index({ actor: "text", action: "text", resource: "text", ipAddress: "text" });

module.exports = mongoose.model("Log", LogSchema);
