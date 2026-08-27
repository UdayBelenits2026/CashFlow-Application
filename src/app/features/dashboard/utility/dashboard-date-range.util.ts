// Computes start and end dates for a named date range selection
export function getDateRangeValues(range: string): { fromDate: string; toDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const formatDate = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  switch (range) {
    case 'today': {
      const todayStr = formatDate(now);
      return { fromDate: todayStr, toDate: todayStr };
    }
    case 'this-week': {
      const dayOfWeek = now.getDay();
      const start = new Date(year, month, date - dayOfWeek);
      const end = new Date(year, month, date + (6 - dayOfWeek));
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'last-week': {
      const dayOfWeek = now.getDay();
      const start = new Date(year, month, date - dayOfWeek - 7);
      const end = new Date(year, month, date + (6 - dayOfWeek) - 7);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'this-month': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'last-month': {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'this-quarter': {
      const quarter = Math.floor(month / 3);
      const start = new Date(year, quarter * 3, 1);
      const end = new Date(year, (quarter + 1) * 3, 0);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'last-quarter': {
      const quarter = Math.floor(month / 3);
      const start = new Date(year, (quarter - 1) * 3, 1);
      const end = new Date(year, quarter * 3, 0);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'this-year': {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    case 'last-year': {
      const start = new Date(year - 1, 0, 1);
      const end = new Date(year - 1, 11, 31);
      return { fromDate: formatDate(start), toDate: formatDate(end) };
    }
    default:
      return { fromDate: '', toDate: '' };
  }
}
