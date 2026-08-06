import auditLogModel from "../models/auditLogModel.js";

// Builds the shared Mongo filter from query params used by both the list
// and export endpoints, so the two stay in sync.
const buildFilter = (query) => {
  const { search, action, actorType, status, from, to } = query;
  const filter = {};

  if (action) filter.action = action;
  if (actorType) filter.actorType = actorType;
  if (status) filter.status = status;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  if (search) {
    const re = new RegExp(search.trim(), "i");
    filter.$or = [
      { actorLabel: re },
      { action: re },
      { "target.label": re },
      { reason: re },
    ];
  }

  return filter;
};

// =============================
// List Audit Logs (paginated)
// =============================
const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const filter = buildFilter(req.query);

    const [logs, total] = await Promise.all([
      auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      auditLogModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Export Audit Logs (CSV)
// =============================
const exportAuditLogs = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const logs = await auditLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const columns = [
      "createdAt",
      "actorType",
      "actorLabel",
      "action",
      "target.type",
      "target.label",
      "status",
      "reason",
      "ip",
      "userAgent",
    ];

    const escapeCsv = (value) => {
      const str = value === undefined || value === null ? "" : String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const rows = logs.map((log) =>
      [
        log.createdAt?.toISOString?.() || "",
        log.actorType || "",
        log.actorLabel || "",
        log.action || "",
        log.target?.type || "",
        log.target?.label || "",
        log.status || "",
        log.reason || "",
        log.ip || "",
        log.userAgent || "",
      ]
        .map(escapeCsv)
        .join(","),
    );

    const csv = [columns.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audit-logs-${Date.now()}.csv"`,
    );
    res.send(csv);
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getAuditLogs, exportAuditLogs };
