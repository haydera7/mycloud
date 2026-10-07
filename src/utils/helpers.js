function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}

function extOf(filename = '') {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function truncate(str = '', n = 40) {
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

/** Splits an array into pages for inline keyboard listings. */
function paginate(items, page = 0, pageSize = 8) {
  const start = page * pageSize;
  return {
    slice: items.slice(start, start + pageSize),
    page,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    hasNext: start + pageSize < items.length,
    hasPrev: page > 0,
  };
}

module.exports = { formatBytes, extOf, truncate, paginate };
